"use client";

import { useMemo, useState } from "react";
import { bytesToUtf8 } from "@/lib/bytes";
import { encodingSpecs } from "@/lib/encodings/registry";

function classify(specId: string, input: string, decodedLength: number): { confidence: string; reason: string } {
  const trimmed = input.trim();
  if (specId.includes("base64") && /^[A-Za-z0-9+/_-]+={0,2}$/.test(trimmed)) return { confidence: "High", reason: "Alphabet, padding, and length pattern match." };
  if (specId.includes("base16") && /^[0-9a-fA-F\s]+$/.test(input) && trimmed.replace(/\s+/g, "").length % 2 === 0) return { confidence: "High", reason: "Only hex digits and valid even length." };
  if (specId.includes("base32") && decodedLength > 0) return { confidence: "Medium", reason: "Alphabet and decode check passed." };
  if (specId.includes("base58") && decodedLength > 0) return { confidence: "Medium", reason: "Base58 alphabet decode succeeded." };
  return { confidence: "Low", reason: "Decoder accepted it, but this format overlaps with other alphabets." };
}

export default function DetectTool() {
  const [input, setInput] = useState("aGVsbG8=");
  const [results, setResults] = useState<{ id: string; name: string; status: string; confidence: string; reason: string; preview: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const specs = useMemo(() => encodingSpecs.filter((spec) => spec.engine && spec.examples.length > 0), []);

  async function run() {
    setBusy(true);
    setError("");
    setResults([]);
    try {
      const next = [];
      for (const spec of specs) {
        try {
          const decoded = await spec.engine!.decode(input, { strict: true, padding: true });
          const encoded = await spec.engine!.encode(decoded, { strict: true, padding: true });
          const canonicalInput = input.replace(/[\t\r\n ]+/g, "");
          const nearCanonical = encoded === canonicalInput || encoded.replace(/=+$/g, "") === canonicalInput.replace(/=+$/g, "");
          if (!nearCanonical && ["base36", "base58btc", "base58flickr", "base62", "base91"].includes(spec.id) === false) continue;
          const cls = classify(spec.id, input, decoded.length);
          next.push({
            id: spec.id,
            name: spec.shortName,
            status: spec.status,
            confidence: cls.confidence,
            reason: cls.reason,
            preview: bytesToUtf8(decoded).replace(/[\u0000-\u001F\u007F]/g, "·").slice(0, 80)
          });
        } catch {
          // Not a match.
        }
      }
      setResults(next.sort((a, b) => ["High", "Medium", "Low"].indexOf(a.confidence) - ["High", "Medium", "Low"].indexOf(b.confidence)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tool">
      <label>Encoded input</label>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="actions">
        <button onClick={run} disabled={busy}>{busy ? "Detecting..." : "Detect possible encodings"}</button>
      </div>
      <p className="muted">Detection is a ranked guess. Many base encodings share overlapping alphabets, so this tool reports possible matches, not absolute proof.</p>
      {error && <p className="error">{error}</p>}
      {results.length > 0 && (
        <div className="grid">
          {results.map((result) => (
            <div className="card" key={result.id}>
              <div className="badges"><span className="badge good">{result.confidence}</span><span className="badge">{result.status}</span></div>
              <h3>{result.name}</h3>
              <p>{result.reason}</p>
              <div className="code">Preview: {result.preview || "binary / empty preview"}</div>
            </div>
          ))}
        </div>
      )}
      {!busy && results.length === 0 && <p className="muted">Run detection to see candidates.</p>}
    </div>
  );
}
