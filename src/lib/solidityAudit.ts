import type { AuditFinding, AuditSeverity } from "@/types/security";

interface Detector {
  title: string;
  severity: AuditSeverity;
  re: RegExp;
  detail: string;
  remediation: string;
  requiresAbsence?: RegExp;
}

const DETECTORS: Detector[] = [
  {
    title: "Reentrancy via external call before state update",
    severity: "critical",
    re: /\.call\{value:[^}]*\}\(|\.send\(|\.transfer\(/,
    detail:
      "Value transfer occurs before internal accounting is written, letting a malicious fallback re-enter and drain the contract.",
    remediation: "Apply checks-effects-interactions: zero the balance first, or guard with ReentrancyGuard nonReentrant.",
  },
  {
    title: "Missing reentrancy guard on withdrawal path",
    severity: "high",
    re: /function\s+\w*(withdraw|claim|redeem)\w*\s*\([^)]*\)\s*(external|public)/i,
    detail: "A withdrawal entrypoint is externally callable with no nonReentrant modifier detected in source.",
    remediation: "Add OpenZeppelin ReentrancyGuard and mark the function nonReentrant.",
    requiresAbsence: /nonReentrant/,
  },
  {
    title: "Spot-price oracle enables flash-loan manipulation",
    severity: "critical",
    re: /getReserves\(\)|\bslot0\b|balanceOf\(address\(this\)\)\s*\/|price\s*=\s*\w+\.balanceOf/,
    detail:
      "Pricing derived from instantaneous pool reserves or vault balance can be skewed inside a single flash-loan transaction.",
    remediation: "Use a TWAP/Chainlink feed and validate deviation bounds before acting on the price.",
  },
  {
    title: "Unchecked low-level call return value",
    severity: "high",
    re: /(?<!\(bool\s+\w+,\s*\)\s*=\s*)\w+\.call\(/,
    detail: "The boolean result of a low-level call is discarded, so failures pass silently.",
    remediation: "Destructure (bool ok, ) = target.call(...) and require(ok).",
  },
  {
    title: "Privileged function lacks access control",
    severity: "high",
    re: /function\s+\w*(mint|setOwner|upgrade|pause|rescue)\w*\s*\([^)]*\)\s*(external|public)(?![^{]*(onlyOwner|onlyRole|require\(msg\.sender))/i,
    detail: "An administrative entrypoint is callable by any address.",
    remediation: "Gate with onlyOwner / AccessControl role checks.",
  },
  {
    title: "tx.origin used for authorization",
    severity: "high",
    re: /tx\.origin/,
    detail: "tx.origin can be phished through an intermediate contract.",
    remediation: "Authorize against msg.sender only.",
  },
  {
    title: "Block timestamp used as randomness / deadline source",
    severity: "medium",
    re: /block\.(timestamp|number)\s*[%+]|keccak256\(abi\.encodePacked\(block\./,
    detail: "Validators can nudge block timing, biasing outcomes derived from it.",
    remediation: "Use a commit-reveal scheme or Chainlink VRF for randomness.",
  },
  {
    title: "Floating pragma",
    severity: "low",
    re: /pragma\s+solidity\s*[\^>]/,
    detail: "A floating pragma allows compilation under untested compiler versions.",
    remediation: "Pin an exact compiler, e.g. pragma solidity 0.8.24;",
  },
  {
    title: "Unbounded loop over storage array",
    severity: "medium",
    re: /for\s*\([^)]*<\s*\w+\.length\s*;/,
    detail: "Iterating an unbounded storage array can exceed the block gas limit and brick the function.",
    remediation: "Paginate the loop or track aggregates incrementally.",
  },
  {
    title: "Gas: storage read inside loop",
    severity: "gas",
    re: /for\s*\([\s\S]{0,120}?\b(storage|\w+\[i\])\b/,
    detail: "Repeated SLOADs inside the loop body cost 2100 gas each on cold access.",
    remediation: "Cache the value in a memory variable before the loop.",
  },
  {
    title: "Gas: state variable can be immutable/constant",
    severity: "gas",
    re: /\b(address|uint256|bytes32)\s+public\s+\w+\s*;/,
    detail: "Variables assigned only in the constructor should be immutable to skip storage slots.",
    remediation: "Mark as immutable (constructor-set) or constant (compile-time).",
  },
  {
    title: "Gas: use custom errors instead of require strings",
    severity: "gas",
    re: /require\([^;]*,\s*"/,
    detail: "Revert strings are stored in bytecode; custom errors cut deploy and revert cost.",
    remediation: "Declare error Unauthorized(); and use if (...) revert Unauthorized();",
  },
];

export const SEVERITY_WEIGHT: Record<AuditSeverity, number> = {
  critical: 30,
  high: 18,
  medium: 9,
  low: 4,
  gas: 2,
};

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

export function auditSolidity(source: string): { findings: AuditFinding[]; score: number } {
  const findings: AuditFinding[] = [];
  DETECTORS.forEach((d, i) => {
    if (d.requiresAbsence && d.requiresAbsence.test(source)) return;
    const m = d.re.exec(source);
    if (!m || m.index === undefined) return;
    findings.push({
      id: `f${i}`,
      title: d.title,
      severity: d.severity,
      line: lineOf(source, m.index),
      detail: d.detail,
      remediation: d.remediation,
    });
  });
  const penalty = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return { findings, score: Math.max(0, 100 - penalty) };
}

export const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPool { function getReserves() external view returns (uint112, uint112); }

contract DevilVault {
    address public owner;
    IPool public pool;
    mapping(address => uint256) public balances;
    address[] public depositors;

    constructor(address _pool) { owner = msg.sender; pool = IPool(_pool); }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        depositors.push(msg.sender);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        balances[msg.sender] -= amount;
        require(ok, "transfer failed");
    }

    function priceInWeth() public view returns (uint256) {
        (uint112 r0, uint112 r1) = pool.getReserves();
        return uint256(r1) * 1e18 / uint256(r0);
    }

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    function sweep() external {
        for (uint256 i = 0; i < depositors.length; i++) {
            balances[depositors[i]] = 0;
        }
    }

    function luckyDraw() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, tx.origin))) % 100;
    }
}`;