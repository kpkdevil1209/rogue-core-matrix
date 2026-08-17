import { useMemo, useRef, useState } from "react";
import { BarChart3, Table2, UploadCloud } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActionButton, Panel } from "@/components/autocoder/Panel";
import { numericColumns, parseDelimited, tableToJson, toNumber, type Table } from "@/lib/fileIngest";

const SAMPLE = `region,exploits,patched,uptime
Karachi,412,388,99.2
Lahore,318,301,98.4
Islamabad,275,268,99.7
Dubai,510,470,97.1
Berlin,190,188,99.9`;

type Kind = "bar" | "line" | "area";

export function ChartStudio() {
  const [raw, setRaw] = useState(SAMPLE);
  const [kind, setKind] = useState<Kind>("bar");
  const inputRef = useRef<HTMLInputElement>(null);

  const table: Table = useMemo(() => parseDelimited(raw), [raw]);
  const rows = useMemo(() => tableToJson(table), [table]);
  const numeric = useMemo(() => numericColumns(table), [table]);
  const labelKey = table.headers.find((h) => !numeric.includes(h)) ?? table.headers[0] ?? "col_0";

  const data = rows.slice(0, 40).map((r) => {
    const out: Record<string, string | number> = { [labelKey]: r[labelKey] ?? "" };
    for (const n of numeric) out[n] = toNumber(r[n] ?? "");
    return out;
  });

  const colors = ["oklch(0.62 0.28 12)", "oklch(0.62 0.28 300)", "oklch(0.75 0.16 190)"];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <Panel icon={Table2} title="CSV Source" tag={`${table.rows.length} rows`}>
        <textarea
          rows={12}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="w-full resize-y rounded border border-border bg-background/70 p-2.5 font-mono text-[11px] outline-none focus:border-accent"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton onClick={() => inputRef.current?.click()}>
            <UploadCloud className="h-3.5 w-3.5" /> Load CSV
          </ActionButton>
          {(["bar", "line", "area"] as Kind[]).map((k) => (
            <ActionButton key={k} variant={kind === k ? "accent" : "ghost"} onClick={() => setKind(k)}>
              {k}
            </ActionButton>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setRaw(await f.text());
          }}
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Label axis: <span className="text-accent">{labelKey}</span> · series:{" "}
          <span className="text-accent">{numeric.join(", ") || "none detected"}</span>
        </p>
      </Panel>

      <Panel icon={BarChart3} title="Interactive Chart" tag={kind.toUpperCase()}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeOpacity={0.12} />
                <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} stroke="currentColor" />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" />
                <Tooltip contentStyle={{ background: "oklch(0.14 0.02 300)", border: "1px solid oklch(0.4 0.1 300)", fontSize: 11 }} />
                {numeric.map((n, i) => (
                  <Bar key={n} dataKey={n} fill={colors[i % colors.length]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            ) : kind === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeOpacity={0.12} />
                <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} stroke="currentColor" />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" />
                <Tooltip contentStyle={{ background: "oklch(0.14 0.02 300)", border: "1px solid oklch(0.4 0.1 300)", fontSize: 11 }} />
                {numeric.map((n, i) => (
                  <Line key={n} type="monotone" dataKey={n} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={data}>
                <CartesianGrid strokeOpacity={0.12} />
                <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} stroke="currentColor" />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" />
                <Tooltip contentStyle={{ background: "oklch(0.14 0.02 300)", border: "1px solid oklch(0.4 0.1 300)", fontSize: 11 }} />
                {numeric.map((n, i) => (
                  <Area
                    key={n}
                    type="monotone"
                    dataKey={n}
                    stroke={colors[i % colors.length]}
                    fill={colors[i % colors.length]}
                    fillOpacity={0.18}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}