"use client";

import { useState } from "react";
import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from "@/lib/bytes";
import { decodeCustomBase, encodeCustomBase, validateAlphabet } from "@/lib/encodings/custom";

export default function CustomBaseTool() {
  const [alphabet, setAlphabet] = useState("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
  const [operation, setOperation] = useState<"encode" | "decode">("encode");
  const [inputMode, setInputMode] = useState<"text" | "hex">("text");
  const [outputMode, setOutputMode] = useState<"text" | "hex">("text");
  const [input, setInput] = useState("hello");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const alphabetErrors = validateAlphabet(alphabet);

  function run() {
    setError("");
    setOutput("");
    try {
      if (operation === "encode") {
        const bytes = inputMode === "hex" ? hexToBytes(input) : utf8ToBytes(input);
        setOutput(encodeCustomBase(bytes, alphabet));
      } else {
        const bytes = decodeCustomBase(input, alphabet);
        setOutput(outputMode === "hex" ? bytesToHex(bytes) : bytesToUtf8(bytes));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="tool">
      <div className="row">
        <div>
          <label>Operation</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value as "encode" | "decode")}>
            <option value="encode">Encode bytes to custom base</option>
            <option value="decode">Decode custom base to bytes</option>
          </select>
        </div>
        <div>
          <label>Base size</label>
          <input type="text" value={[...alphabet].length} readOnly />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label>Alphabet</label>
        <textarea value={alphabet} onChange={(e) => setAlphabet(e.target.value)} />
      </div>
      {alphabetErrors.length > 0 && <p className="error">{alphabetErrors.join(" ")}</p>}

      <div className="row">
        <div>
          <label>Input mode</label>
          <select value={inputMode} onChange={(e) => setInputMode(e.target.value as "text" | "hex")} disabled={operation === "decode"}>
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

      <div style={{ marginTop: 14 }}>
        <label>Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      </div>
      <div className="actions">
        <button onClick={run}>Run custom base</button>
        <button className="secondary" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>Copy output</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div>
        <label>Output</label>
        <textarea value={output} readOnly />
      </div>
    </div>
  );
}
