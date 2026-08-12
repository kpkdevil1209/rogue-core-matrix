export type ArtifactKind = "html" | "css" | "react" | "svg" | "three";

export const ARTIFACTS: { id: ArtifactKind; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "react", label: "React" },
  { id: "svg", label: "SVG" },
  { id: "three", label: "Three.js" },
];

export const TEMPLATES: Record<ArtifactKind, string> = {
  html: `<div class="card">
  <h1>DEVIL SANDBOX</h1>
  <p>Isolated execution surface. Edit and re-compile.</p>
  <button onclick="alert('signal sent')">TRANSMIT</button>
</div>
<style>
  body { background:#030005; color:#ff0033; font-family:ui-monospace,monospace; display:grid; place-items:center; height:100vh; margin:0 }
  .card { border:1px solid #9d00ff55; padding:24px; border-radius:8px; box-shadow:0 0 40px #9d00ff33 }
  button { background:#ff003322; color:#ff0033; border:1px solid #ff0033; padding:8px 16px; letter-spacing:.2em; cursor:pointer }
</style>`,
  css: `<div class="orb"></div>
<style>
  body { background:#030005; display:grid; place-items:center; height:100vh; margin:0 }
  .orb {
    width:160px; height:160px; border-radius:50%;
    background:radial-gradient(circle at 30% 30%, #9d00ff, #ff0033 60%, #030005);
    animation:pulse 2.4s ease-in-out infinite;
    box-shadow:0 0 80px #ff003366;
  }
  @keyframes pulse { 0%,100%{transform:scale(.9)} 50%{transform:scale(1.15)} }
</style>`,
  react: `function App() {
  const [n, setN] = React.useState(0);
  return (
    <div style={{ fontFamily: "ui-monospace, monospace", color: "#ff0033", textAlign: "center" }}>
      <h2 style={{ letterSpacing: ".2em" }}>REACT NODE ONLINE</h2>
      <p style={{ color: "#9d00ff" }}>payload counter: {n}</p>
      <button
        onClick={() => setN(n + 1)}
        style={{ background: "#9d00ff22", color: "#9d00ff", border: "1px solid #9d00ff", padding: "8px 18px" }}
      >
        ESCALATE
      </button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);`,
  svg: `<svg viewBox="0 0 200 200" width="320" height="320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g"><stop offset="0%" stop-color="#9d00ff"/><stop offset="100%" stop-color="#ff0033"/></radialGradient>
  </defs>
  <circle cx="100" cy="100" r="70" fill="none" stroke="url(#g)" stroke-width="2"/>
  <polygon points="100,35 160,145 40,145" fill="none" stroke="#ff0033" stroke-width="2"/>
  <circle cx="100" cy="110" r="14" fill="url(#g)"/>
</svg>`,
  three: `const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const mesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true })
);
scene.add(mesh);
(function loop() {
  requestAnimationFrame(loop);
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
})();`,
};

const ERROR_BRIDGE = `<script>
  window.onerror = function (m, s, l, c) {
    parent.postMessage({ __devil: true, type: "error", message: String(m), line: l || 0 }, "*");
    return false;
  };
  window.addEventListener("unhandledrejection", function (e) {
    parent.postMessage({ __devil: true, type: "error", message: "Unhandled rejection: " + e.reason, line: 0 }, "*");
  });
  ["log","warn","error"].forEach(function (k) {
    var orig = console[k];
    console[k] = function () {
      parent.postMessage({ __devil: true, type: k, message: Array.prototype.slice.call(arguments).map(String).join(" ") }, "*");
      orig.apply(console, arguments);
    };
  });
<\/script>`;

export function buildDocument(kind: ArtifactKind, code: string): string {
  const base = (head: string, body: string) =>
    `<!doctype html><html><head><meta charset="utf-8"/><style>html,body{margin:0;background:#030005;color:#e6e6e6}</style>${ERROR_BRIDGE}${head}</head><body>${body}</body></html>`;

  switch (kind) {
    case "react":
      return base(
        `<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
         <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
         <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>`,
        `<div id="root" style="display:grid;place-items:center;height:100vh"></div><script type="text/babel">${code}<\/script>`,
      );
    case "three":
      return base(
        `<script src="https://unpkg.com/three@0.160.0/build/three.min.js"><\/script>`,
        `<script>${code}<\/script>`,
      );
    case "svg":
      return base("", `<div style="display:grid;place-items:center;height:100vh">${code}</div>`);
    default:
      return base("", code);
  }
}

export function offlineHtml(kind: ArtifactKind, code: string) {
  return buildDocument(kind, code).replace(
    "<head>",
    "<head>\n<!-- Packaged offline by DEVIL Auto-Coder -->",
  );
}
