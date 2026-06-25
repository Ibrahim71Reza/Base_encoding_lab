"use client";

import { useMemo, useState } from "react";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@/lib/bytes";
import { getRecommendedEncodings } from "@/lib/encodings/registry";

export default function CompareTool() {
  const [inputMode, setInputMode] = useState<"text" | "hex">("text");
  const [input, setInput] = useState("hello");
  const [padding, setPadding] = useState(true);
  const [rows, setRows] = useState<{ name: string; id: string; status: string; output: string; chars: number; bytes: number }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const specs = useMemo(() => getRecommendedEncodings().filter((spec) => spec.engine), []);

  async function run() {
    setBusy(true);
    setError("");
    setRows([]);
    try {
      const bytes = inputMode === "hex" ? hexToBytes(input) : utf8ToBytes(input);
      const next = [];
      for (const spec of specs) {
        try {
          const output = await spec.engine!.encode(bytes, { strict: true, padding });
          next.push({
            name: spec.shortName,
            id: spec.id,
            status: spec.status,
            output,
            chars: [...output].length,
            bytes: new TextEncoder().encode(output).length
          });
        } catch (err) {
          next.push({
            name: spec.shortName,
            id: spec.id,
            status: spec.status,
            output: err instanceof Error ? `Not applicable: ${err.message}` : "Not applicable",
            chars: 0,
            bytes: 0
          });
        }
      }
      setRows(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tool">
      <div className="row">
        <div>
          <label>Input mode</label>
          <select value={inputMode} onChange={(e) => setInputMode(e.target.value as "text" | "hex")}>
            <option value="text">UTF-8 text</option>
            <option value="hex">Hex bytes</option>
          </select>
        </div>
        <label className="checkline">
          <input type="checkbox" checked={padding} onChange={(e) => setPadding(e.target.checked)} />
          Padding enabled where applicable
        </label>
      </div>
      <div style={{ marginTop: 14 }}>
        <label>Input to compare</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      </div>
      <div className="actions">
        <button onClick={run} disabled={busy}>{busy ? "Comparing..." : "Compare encodings"}</button>
        <button className="secondary" onClick={() => setInput(bytesToHex(utf8ToBytes(input), true))}>Text → hex helper</button>
      </div>
      {error && <p className="error">{error}</p>}
      {rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Encoding</th><th>Status</th><th>Chars</th><th>UTF-8 bytes</th><th>Output</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.status}</td>
                  <td>{row.chars || "—"}</td>
                  <td>{row.bytes || "—"}</td>
                  <td><code>{row.output}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
