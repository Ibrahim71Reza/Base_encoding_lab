"use client";

import { useMemo, useState } from "react";
import { downloadBytes, hexToBytes, bytesToHex, bytesToUtf8, utf8ToBytes } from "@/lib/bytes";
import { encodingSpecs } from "@/lib/encodings/registry";
import type { EncodeDecodeMode } from "@/lib/encodings/types";

type Props = { defaultEncodingId?: string };

export default function EncoderTool({ defaultEncodingId = "base64-rfc4648" }: Props) {
  const [encodingId, setEncodingId] = useState(defaultEncodingId);
  const [operation, setOperation] = useState<"encode" | "decode">("encode");
  const [inputMode, setInputMode] = useState<EncodeDecodeMode>("text");
  const [outputMode, setOutputMode] = useState<"text" | "hex">("text");
  const [input, setInput] = useState("hello");
  const [output, setOutput] = useState("");
  const [lastBytes, setLastBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");
  const [strict, setStrict] = useState(true);
  const [padding, setPadding] = useState(true);
  const [busy, setBusy] = useState(false);

  const spec = useMemo(() => encodingSpecs.find((item) => item.id === encodingId) ?? encodingSpecs[0], [encodingId]);

  async function getInputBytes(): Promise<Uint8Array> {
    if (inputMode === "hex") return hexToBytes(input);
    return utf8ToBytes(input);
  }

  async function run() {
    setBusy(true);
    setError("");
    setOutput("");
    setLastBytes(null);
    try {
      if (!spec.engine) throw new Error("This encoding page is documentation-only.");
      if (operation === "encode") {
        const bytes = await getInputBytes();
        const encoded = await spec.engine.encode(bytes, { strict, padding });
        setOutput(encoded);
      } else {
        const bytes = await spec.engine.decode(input, { strict, padding });
        setLastBytes(bytes);
        setOutput(outputMode === "hex" ? bytesToHex(bytes, true) : bytesToUtf8(bytes));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (!spec.engine) throw new Error("This encoding page is documentation-only.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const encoded = await spec.engine.encode(bytes, { strict, padding });
      setInput(`[Loaded file: ${file.name}, ${bytes.length} bytes]`);
      setOutput(encoded);
      setOperation("encode");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
  }

  function downloadDecoded() {
    if (lastBytes) downloadBytes("decoded.bin", lastBytes);
  }

  return (
    <div className="tool">
      <div className="row">
        <div>
          <label>Encoding system</label>
          <select value={encodingId} onChange={(e) => setEncodingId(e.target.value)}>
            {encodingSpecs.map((item) => (
              <option key={item.id} value={item.id}>{item.shortName} — {item.status}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Operation</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value as "encode" | "decode")}>
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </div>
      </div>

      <div className="badges">
        <span className={spec.status.includes("Official") ? "badge good" : "badge warn"}>{spec.status}</span>
        <span className="badge">{spec.standard}</span>
        <span className="badge">{spec.safeForUrls ? "URL-safe" : "Not fully URL-safe"}</span>
        <span className="badge">{spec.supportsFiles ? "File capable" : "Fixed-size/specialized"}</span>
      </div>

      <p>{spec.summary}</p>

      <div className="row">
        <div>
          <label>Input mode</label>
          <select value={inputMode} onChange={(e) => setInputMode(e.target.value as EncodeDecodeMode)} disabled={operation === "decode"}>
            <option value="text">UTF-8 text</option>
            <option value="hex">Hex bytes</option>
          </select>
        </div>
        <div>
          <label>Decoded output mode</label>
          <select value={outputMode} onChange={(e) => setOutputMode(e.target.value as "text" | "hex")} disabled={operation === "encode"}>
            <option value="text">UTF-8 text</option>
            <option value="hex">Hex bytes</option>
          </select>
        </div>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} />
          Strict validation
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <input type="checkbox" checked={padding} onChange={(e) => setPadding(e.target.checked)} />
          Padding enabled where applicable
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>{operation === "encode" ? "Plain input" : "Encoded input"}</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text, hex, or encoded data here" />
      </div>

      {operation === "encode" && spec.supportsFiles && (
        <div style={{ marginTop: 12 }}>
          <label>Optional browser-only file encode</label>
          <input type="file" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      )}

      <div className="actions">
        <button onClick={run} disabled={busy}>{busy ? "Working..." : operation === "encode" ? "Encode" : "Decode"}</button>
        <button className="secondary" onClick={copyOutput} disabled={!output}>Copy output</button>
        {operation === "decode" && <button className="secondary" onClick={downloadDecoded} disabled={!lastBytes}>Download decoded bytes</button>}
      </div>

      {error && <p className="error">{error}</p>}

      <div>
        <label>Output</label>
        <textarea value={output} readOnly placeholder="Output will appear here" />
      </div>
    </div>
  );
}
