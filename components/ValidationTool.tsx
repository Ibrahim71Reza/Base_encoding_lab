"use client";

import { useEffect, useState } from "react";
import { hexToBytes, utf8ToBytes } from "@/lib/bytes";
import { encodingSpecs } from "@/lib/encodings/registry";

function parsePlain(example: { plain: string; inputMode?: "text" | "hex" }): Uint8Array {
  if (example.inputMode === "hex") return hexToBytes(example.plain.replace(/^hex:\s*/i, ""));
  if (/^hex:\s*/i.test(example.plain)) return hexToBytes(example.plain.replace(/^hex:\s*/i, ""));
  if (example.plain === "16 zero bytes") return hexToBytes("00000000000000000000000000000000");
  return utf8ToBytes(example.plain);
}

export default function ValidationTool() {
  const [rows, setRows] = useState<{ encoding: string; plain: string; expected: string; actual: string; pass: boolean; message: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const next = [];
      for (const spec of encodingSpecs) {
        if (!spec.engine) continue;
        for (const example of spec.examples) {
          try {
            const bytes = parsePlain(example);
            const actual = await spec.engine.encode(bytes, { strict: true, padding: true });
            const pass = actual === example.encoded;
            next.push({ encoding: spec.shortName, plain: example.plain, expected: example.encoded, actual, pass, message: pass ? "Pass" : "Mismatch" });
          } catch (err) {
            next.push({ encoding: spec.shortName, plain: example.plain, expected: example.encoded, actual: "—", pass: false, message: err instanceof Error ? err.message : String(err) });
          }
        }
      }
      if (!cancelled) setRows(next);
    }
    void run();
    return () => { cancelled = true; };
  }, []);

  const passed = rows.filter((row) => row.pass).length;

  return (
    <div className="tool">
      <div className="badges"><span className="badge good">{passed}/{rows.length} examples passing</span><span className="badge">Runs in this browser</span></div>
      <p>These checks run locally against the same encoder functions used by the tool. Official standards are separated from de facto and experimental references.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Encoding</th><th>Input</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.encoding}-${index}`}>
                <td>{row.encoding}</td>
                <td><code>{row.plain}</code></td>
                <td><code>{row.expected}</code></td>
                <td><code>{row.actual}</code></td>
                <td className={row.pass ? "success" : "error"}>{row.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
