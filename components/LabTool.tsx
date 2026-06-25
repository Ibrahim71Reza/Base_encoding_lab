"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { bytesToHex, bytesToUtf8, downloadBytes, hexToBytes, utf8ToBytes } from "@/lib/bytes";
import { categories, encodingSpecs } from "@/lib/encodings/registry";
import type { EncodeDecodeMode, EncodingSpec } from "@/lib/encodings/types";

type Operation = "encode" | "decode";
type DetectionResult = {
  id: string;
  label: string;
  status: string;
  confidence: "High" | "Medium" | "Low";
  preview: string;
  reason: string;
};

type ShareState = {
  e: string;
  op: Operation;
  im: EncodeDecodeMode;
  strict: boolean;
  padding: boolean;
  batch?: boolean;
  input: string;
};

type SharePanelState = {
  url: string;
  code: string;
};

const SHARE_PREFIX = "ubl1:";
const CONFIDENCE_ORDER = { High: 0, Medium: 1, Low: 2 } as const;
const OFFICIAL_STATUS = "Official standard";
const TRUSTED_STATUSES = new Set(["Official standard", "Stable specification", "Published reference", "De facto standard"]);

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function copyTextFallback(value: string): boolean {
  if (!isBrowser()) return false;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

async function writeClipboard(value: string): Promise<boolean> {
  if (!isBrowser()) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back below for insecure contexts or blocked permissions.
  }
  return copyTextFallback(value);
}

function makeShareCode(state: ShareState): string {
  return SHARE_PREFIX + toBase64Url(JSON.stringify(state));
}

function parseShareCode(code: string): ShareState | null {
  try {
    const clean = code.trim().replace(/^#s=/, "");
    const body = clean.startsWith(SHARE_PREFIX) ? clean.slice(SHARE_PREFIX.length) : clean;
    const parsed = JSON.parse(fromBase64Url(body)) as Partial<ShareState>;
    if (!parsed.e || !parsed.op || typeof parsed.input !== "string") return null;
    return {
      e: parsed.e,
      op: parsed.op === "decode" ? "decode" : "encode",
      im: parsed.im === "hex" ? "hex" : "text",
      strict: parsed.strict !== false,
      padding: parsed.padding !== false,
      batch: parsed.batch === true,
      input: parsed.input
    };
  } catch {
    return null;
  }
}

function matchSpec(spec: EncodingSpec, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    spec.name,
    spec.shortName,
    spec.category,
    spec.status,
    spec.standard,
    spec.alphabet ?? "",
    ...(spec.aliases ?? []),
    ...(spec.tags ?? [])
  ].join(" ").toLowerCase();
  return haystack.includes(q);
}

function classifyCandidate(spec: EncodingSpec, input: string, decoded: Uint8Array): DetectionResult["confidence"] {
  const compact = input.replace(/[\t\r\n ]+/g, "");
  if (spec.id.includes("base64") && /^[A-Za-z0-9+/_-]+={0,2}$/.test(compact)) return "High";
  if (spec.id.includes("base16") && /^[0-9a-fA-F]+$/.test(compact) && compact.length % 2 === 0) return "High";
  if (spec.id.includes("base45") && decoded.length > 0) return "High";
  if (spec.id.includes("base32") && decoded.length > 0) return "Medium";
  if (spec.id.includes("base58") && decoded.length > 0) return "Medium";
  return "Low";
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value)) return "0 B";
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[index]}`;
}

function safeInputBytes(input: string, operation: Operation, inputMode: EncodeDecodeMode): number {
  try {
    if (operation === "encode" && inputMode === "hex") return hexToBytes(input).length;
    return utf8ToBytes(input).length;
  } catch {
    return utf8ToBytes(input).length;
  }
}

function cleanPreview(bytes: Uint8Array): string {
  return bytesToUtf8(bytes).replace(/[\u0000-\u001F\u007F]/g, "·").slice(0, 90);
}

export default function LabTool() {
  const [encodingId, setEncodingId] = useState("base64-rfc4648");
  const [operation, setOperation] = useState<Operation>("encode");
  const [inputMode, setInputMode] = useState<EncodeDecodeMode>("text");
  const [strict, setStrict] = useState(true);
  const [padding, setPadding] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [input, setInput] = useState("Hello Ultimate Lab!");
  const [output, setOutput] = useState("");
  const [outputBytes, setOutputBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [viewHex, setViewHex] = useState(false);
  const [notice, setNotice] = useState("");
  const [sharePanel, setSharePanel] = useState<SharePanelState | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [hideExperimental, setHideExperimental] = useState(false);
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const runId = useRef(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedSpec = useMemo(
    () => encodingSpecs.find((item) => item.id === encodingId) ?? encodingSpecs[0],
    [encodingId]
  );

  const filteredByCategory = useMemo(() => {
    return categories
      .map((category) => {
        const items = encodingSpecs
          .filter((spec) => spec.category === category)
          .filter((spec) => !officialOnly || spec.status === OFFICIAL_STATUS)
          .filter((spec) => !hideExperimental || TRUSTED_STATUSES.has(spec.status))
          .filter((spec) => !recommendedOnly || spec.recommended)
          .filter((spec) => matchSpec(spec, query))
          .sort((a, b) => {
            const af = favoriteIds.includes(a.id) ? 0 : 1;
            const bf = favoriteIds.includes(b.id) ? 0 : 1;
            if (af !== bf) return af - bf;
            return a.shortName.localeCompare(b.shortName);
          });
        return { category, items };
      })
      .filter((group) => group.items.length > 0);
  }, [query, officialOnly, hideExperimental, recommendedOnly, favoriteIds]);

  const recentSpecs = useMemo(() => {
    return recentIds
      .map((id) => encodingSpecs.find((spec) => spec.id === id))
      .filter((spec): spec is EncodingSpec => Boolean(spec))
      .slice(0, 5);
  }, [recentIds]);

  const renderedOutput = useMemo(() => {
    if (!viewHex) return output;
    if (outputBytes) return bytesToHex(outputBytes, true);
    return bytesToHex(utf8ToBytes(output), true);
  }, [output, outputBytes, viewHex]);

  const inputByteCount = useMemo(() => safeInputBytes(input, operation, inputMode), [input, operation, inputMode]);
  const outputByteCount = outputBytes ? outputBytes.length : utf8ToBytes(output).length;
  const expansionRatio = inputByteCount > 0 ? outputByteCount / inputByteCount : 0;
  const isFavorite = favoriteIds.includes(encodingId);

  useEffect(() => {
    if (!isBrowser()) return;
    try {
      const favorites = JSON.parse(window.localStorage.getItem("ubl:favorites") ?? "[]") as unknown;
      if (Array.isArray(favorites)) setFavoriteIds(favorites.filter((item): item is string => typeof item === "string"));
      const recents = JSON.parse(window.localStorage.getItem("ubl:recents") ?? "[]") as unknown;
      if (Array.isArray(recents)) setRecentIds(recents.filter((item): item is string => typeof item === "string"));
    } catch {
      // Local storage can be disabled; the lab still works without it.
    }
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;
    setRecentIds((current) => {
      const next = [encodingId, ...current.filter((id) => id !== encodingId)].slice(0, 8);
      try {
        window.localStorage.setItem("ubl:recents", JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, [encodingId]);

  useEffect(() => {
    if (!isBrowser()) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#s=")) return;
    const parsed = parseShareCode(hash.slice(3));
    if (!parsed) return;
    const exists = encodingSpecs.some((spec) => spec.id === parsed.e);
    if (exists) setEncodingId(parsed.e);
    setOperation(parsed.op);
    setInputMode(parsed.im);
    setStrict(parsed.strict);
    setPadding(parsed.padding);
    setBatchMode(parsed.batch === true);
    setInput(parsed.input);
    setNotice("Share code loaded.");
  }, []);

  useEffect(() => {
    const currentRun = ++runId.current;
    async function run() {
      setError("");
      setOutput("");
      setOutputBytes(null);
      if (!input && operation === "decode") return;
      try {
        if (!selectedSpec.engine) throw new Error("This item is documentation-only.");
        if (batchMode) {
          const lines = input.split(/\r?\n/);
          const processed: string[] = [];
          for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            if (line.length === 0) {
              processed.push("");
              continue;
            }
            try {
              if (operation === "encode") {
                const bytes = inputMode === "hex" ? hexToBytes(line) : utf8ToBytes(line);
                processed.push(await selectedSpec.engine.encode(bytes, { strict, padding }));
              } else {
                const decoded = await selectedSpec.engine.decode(line, { strict, padding });
                processed.push(bytesToUtf8(decoded));
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              processed.push(`[Line ${index + 1} error: ${message}]`);
            }
          }
          if (currentRun !== runId.current) return;
          const joined = processed.join("\n");
          setOutput(joined);
          setOutputBytes(utf8ToBytes(joined));
          return;
        }
        if (operation === "encode") {
          const bytes = inputMode === "hex" ? hexToBytes(input) : utf8ToBytes(input);
          const encoded = await selectedSpec.engine.encode(bytes, { strict, padding });
          if (currentRun !== runId.current) return;
          setOutput(encoded);
          setOutputBytes(utf8ToBytes(encoded));
        } else {
          const decoded = await selectedSpec.engine.decode(input, { strict, padding });
          if (currentRun !== runId.current) return;
          setOutputBytes(decoded);
          setOutput(bytesToUtf8(decoded));
        }
      } catch (err) {
        if (currentRun !== runId.current) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    }
    void run();
  }, [selectedSpec, operation, inputMode, strict, padding, batchMode, input]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && renderedOutput) {
        event.preventDefault();
        void copy(renderedOutput, "Output");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [renderedOutput]);

  function pickSpec(id: string) {
    setEncodingId(id);
    setDetectionResults([]);
  }

  async function copy(value: string, label: string) {
    const copied = await writeClipboard(value);
    setNotice(copied ? `${label} copied.` : `Could not auto-copy ${label.toLowerCase()}. Select it manually.`);
  }

  async function pasteInput() {
    try {
      const value = await navigator.clipboard.readText();
      setInput(value);
      setNotice("Clipboard pasted into input.");
    } catch {
      setNotice("Paste failed. Use Ctrl+V inside the input box.");
    }
  }

  async function shareLink() {
    const code = makeShareCode({ e: encodingId, op: operation, im: inputMode, strict, padding, batch: batchMode, input });
    const url = `${window.location.origin}${window.location.pathname}#s=${code}`;
    setSharePanel({ url, code });
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ultimate Base Lab", text: `${selectedSpec.shortName} ${operation} workspace`, url });
        setNotice("Share sheet opened. The fallback share link is also shown below.");
        return;
      }
    } catch {
      // User cancellation or unsupported share target should not break fallback sharing.
    }
    const copied = await writeClipboard(url);
    setNotice(copied ? "Share link copied and shown below." : "Share link is shown below. Copy it manually if needed.");
  }

  async function copyShareCode() {
    const code = makeShareCode({ e: encodingId, op: operation, im: inputMode, strict, padding, batch: batchMode, input });
    const url = `${window.location.origin}${window.location.pathname}#s=${code}`;
    setSharePanel({ url, code });
    await copy(code, "Share code");
  }

  async function copyVerificationReport() {
    const report = {
      tool: "Ultimate Base Lab",
      privacy: "client-side only; no server encode/decode request",
      encoding: selectedSpec.name,
      status: selectedSpec.status,
      standard: selectedSpec.standard,
      sourceUrl: selectedSpec.sourceUrl ?? null,
      alphabet: selectedSpec.alphabet ?? null,
      padding: selectedSpec.padding ?? null,
      operation,
      inputMode,
      strict,
      paddingEnabled: padding,
      batchMode,
      inputChars: input.length,
      inputBytes: inputByteCount,
      outputChars: renderedOutput.length,
      outputBytes: outputByteCount,
      output: renderedOutput
    };
    await copy(JSON.stringify(report, null, 2), "Verification report");
  }

  function importShareCode() {
    const pasted = window.prompt("Paste a share code or share link:");
    if (!pasted) return;
    const maybeCode = pasted.includes("#s=") ? pasted.split("#s=").pop() ?? pasted : pasted;
    const parsed = parseShareCode(maybeCode);
    if (!parsed) {
      setNotice("Invalid share code.");
      return;
    }
    if (encodingSpecs.some((spec) => spec.id === parsed.e)) setEncodingId(parsed.e);
    setOperation(parsed.op);
    setInputMode(parsed.im);
    setStrict(parsed.strict);
    setPadding(parsed.padding);
    setBatchMode(parsed.batch === true);
    setInput(parsed.input);
    setSharePanel(null);
    setNotice("Share code imported.");
  }

  function toggleFavorite() {
    setFavoriteIds((current) => {
      const next = current.includes(encodingId)
        ? current.filter((id) => id !== encodingId)
        : [encodingId, ...current].slice(0, 20);
      try {
        window.localStorage.setItem("ubl:favorites", JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      setNotice(next.includes(encodingId) ? "Format saved to favorites." : "Format removed from favorites.");
      return next;
    });
  }

  async function runMagicDecoder() {
    setDetecting(true);
    setDetectionResults([]);
    setNotice("");
    try {
      const results: DetectionResult[] = [];
      for (const spec of encodingSpecs) {
        if (!spec.engine) continue;
        try {
          const decoded = await spec.engine.decode(input, { strict: true, padding: true });
          const reencoded = await spec.engine.encode(decoded, { strict: true, padding: true });
          const compactInput = input.replace(/[\t\r\n ]+/g, "");
          const compactReencoded = reencoded.replace(/[\t\r\n ]+/g, "");
          const canonicalish = compactInput === compactReencoded || compactInput.replace(/=+$/g, "") === compactReencoded.replace(/=+$/g, "");
          const broadFamilies = ["base36", "base58btc", "base58flickr", "base62", "base91"];
          if (!canonicalish && !broadFamilies.includes(spec.id)) continue;
          const confidence = classifyCandidate(spec, input, decoded);
          results.push({
            id: spec.id,
            label: spec.shortName,
            status: spec.status,
            confidence,
            preview: cleanPreview(decoded),
            reason: canonicalish ? "Decoder accepted it and re-encode check matched." : "Decoder accepted it; alphabet overlaps with other bases."
          });
        } catch {
          // Not a candidate.
        }
      }
      results.sort((a, b) => CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence]);
      setDetectionResults(results.slice(0, 12));
      setOperation("decode");
      setNotice(results.length ? "Magic decoder found possible matches." : "No confident match found.");
    } finally {
      setDetecting(false);
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    try {
      if (!selectedSpec.engine) throw new Error("This item is documentation-only.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const encoded = await selectedSpec.engine.encode(bytes, { strict, padding });
      setOperation("encode");
      setInputMode("text");
      setBatchMode(false);
      setInput(`[File loaded locally: ${file.name}, ${bytes.length} bytes]`);
      setOutput(encoded);
      setOutputBytes(utf8ToBytes(encoded));
      setNotice("File encoded in your browser only. No upload happened.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function downloadOutput() {
    if (operation === "decode" && outputBytes && !batchMode) {
      downloadBytes("decoded.bin", outputBytes);
      return;
    }
    downloadBytes(operation === "decode" ? "decoded.txt" : "encoded.txt", utf8ToBytes(renderedOutput));
  }

  function useOutputAsInput() {
    if (!renderedOutput) return;
    if (operation === "encode") {
      setInput(output);
      setOperation("decode");
      setInputMode("text");
      setViewHex(false);
      setNotice("Output moved to input and switched to Decode.");
      return;
    }
    if (outputBytes) {
      setInput(bytesToHex(outputBytes, false));
      setOperation("encode");
      setInputMode("hex");
      setViewHex(false);
      setNotice("Decoded bytes moved to input as hex and switched to Encode.");
    }
  }

  function clearWorkspace() {
    setInput("");
    setOutput("");
    setOutputBytes(null);
    setError("");
    setNotice("Workspace cleared.");
    setSharePanel(null);
    setDetectionResults([]);
  }

  function compactCurrentInput() {
    setInput((value) => value.replace(/[\t\r\n ]+/g, ""));
    setNotice("Whitespace removed from input.");
  }

  function loadExample(exampleIndex: number, targetOperation: Operation) {
    const example = selectedSpec.examples[exampleIndex];
    if (!example) return;
    setOperation(targetOperation);
    setBatchMode(false);
    setDetectionResults([]);
    if (targetOperation === "encode") {
      if (example.inputMode === "hex") {
        setInputMode("hex");
        setInput(example.plain.replace(/^hex:\s*/i, ""));
      } else {
        setInputMode("text");
        setInput(example.plain);
      }
    } else {
      setInputMode("text");
      setInput(example.encoded);
    }
    setNotice(`${targetOperation === "encode" ? "Encode" : "Decode"} example loaded.`);
  }

  const outputCharCount = renderedOutput.length;
  const inputCharCount = input.length;
  const outputLabel = viewHex ? "Hex View" : operation === "decode" ? "Decoded Text" : selectedSpec.shortName;
  const ratioLabel = inputByteCount > 0 ? `${expansionRatio.toFixed(2)}×` : "—";

  return (
    <main className="lab-shell">
      <aside className="lab-sidebar">
        <div className="lab-brand">
          <div className="lab-brand-title">Ultimate Base Lab</div>
          <div className="lab-brand-subtitle">100% Client-Side Engine</div>
        </div>

        <div className="lab-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search formats...  Ctrl+K"
            aria-label="Search encoding formats"
          />
        </div>

        <div className="sidebar-filters" aria-label="Format filters">
          <label><input type="checkbox" checked={officialOnly} onChange={(e) => setOfficialOnly(e.target.checked)} /> Official only</label>
          <label><input type="checkbox" checked={hideExperimental} onChange={(e) => setHideExperimental(e.target.checked)} /> Hide experimental</label>
          <label><input type="checkbox" checked={recommendedOnly} onChange={(e) => setRecommendedOnly(e.target.checked)} /> Recommended</label>
        </div>

        {recentSpecs.length > 0 && (
          <div className="recent-strip" aria-label="Recently used encodings">
            {recentSpecs.map((spec) => (
              <button type="button" key={spec.id} onClick={() => pickSpec(spec.id)} className={spec.id === encodingId ? "active" : ""}>
                {spec.shortName}
              </button>
            ))}
          </div>
        )}

        <div className="lab-format-list">
          {filteredByCategory.map((group) => (
            <section key={group.category} className="lab-format-group">
              <h2>{group.category}</h2>
              {group.items.map((spec) => (
                <button
                  type="button"
                  key={spec.id}
                  onClick={() => pickSpec(spec.id)}
                  className={spec.id === encodingId ? "format-item active" : "format-item"}
                  title={`${spec.name} — ${spec.status}`}
                >
                  <span>{favoriteIds.includes(spec.id) ? "★ " : ""}{spec.shortName}</span>
                </button>
              ))}
            </section>
          ))}
        </div>

        <div className="lab-sidebar-footer">
          <button className="magic-button" onClick={runMagicDecoder} disabled={detecting}>
            {detecting ? "Checking..." : "✨ Magic Decoder"}
          </button>
          <div className="side-links">
            <Link href="/standards/">Standards</Link>
            <Link href="/validation/">Validation</Link>
            <Link href="/compare/">Compare</Link>
            <Link href="/architecture/">Privacy</Link>
          </div>
        </div>
      </aside>

      <section className="lab-main">
        <header className="lab-topbar">
          <div>
            <h1>{selectedSpec.shortName}</h1>
            <div className="lab-meta">
              <span>{selectedSpec.status}</span>
              <span>{selectedSpec.standard}</span>
              <span>{selectedSpec.safeForUrls ? "URL-safe" : "Not URL-safe"}</span>
            </div>
          </div>

          <div className="lab-top-actions">
            <button className="compact-button" onClick={toggleFavorite}>{isFavorite ? "★ Saved" : "☆ Save"}</button>
            <button className="compact-button" onClick={shareLink}>⤴ Share</button>
            <button className="compact-button" onClick={copyShareCode}>Copy Code</button>
            <button className="compact-button" onClick={importShareCode}>Import</button>
            <div className="segmented" role="group" aria-label="Operation">
              <button className={operation === "encode" ? "active" : ""} onClick={() => setOperation("encode")}>Encode</button>
              <button className={operation === "decode" ? "active" : ""} onClick={() => setOperation("decode")}>Decode</button>
            </div>
          </div>
        </header>

        <div className="lab-options-row">
          <div className="segmented small" role="group" aria-label="Input mode">
            <button className={inputMode === "text" ? "active" : ""} onClick={() => setInputMode("text")} disabled={operation === "decode"}>Text</button>
            <button className={inputMode === "hex" ? "active" : ""} onClick={() => setInputMode("hex")} disabled={operation === "decode"}>Hex Bytes</button>
          </div>
          <label className="mini-check"><input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} /> Strict</label>
          <label className="mini-check"><input type="checkbox" checked={padding} onChange={(e) => setPadding(e.target.checked)} /> Padding</label>
          <label className="mini-check"><input type="checkbox" checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)} /> Batch lines</label>
          {operation === "encode" && selectedSpec.supportsFiles && <label className="file-chip">Load file<input type="file" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} /></label>}
          <button className="inline-action" onClick={pasteInput}>Paste</button>
          <button className="inline-action" onClick={compactCurrentInput}>Remove spaces</button>
          <button className="inline-action" onClick={useOutputAsInput} disabled={!renderedOutput}>Swap</button>
          <button className="inline-action" onClick={clearWorkspace}>Clear</button>
          <Link className="source-link" href={`/encodings/${selectedSpec.id}/`}>Format details</Link>
        </div>

        {notice && <div className="notice-strip">{notice}</div>}
        {error && <div className="error-strip">{error}</div>}
        {sharePanel && (
          <section className="share-fallback" aria-label="Share link and code">
            <div>
              <strong>Share link</strong>
              <input readOnly value={sharePanel.url} onFocus={(event) => event.currentTarget.select()} />
            </div>
            <div>
              <strong>Share code</strong>
              <input readOnly value={sharePanel.code} onFocus={(event) => event.currentTarget.select()} />
            </div>
            <button className="inline-action" onClick={() => copy(sharePanel.url, "Share link")}>Copy link</button>
            <button className="inline-action" onClick={() => setSharePanel(null)}>Close</button>
          </section>
        )}

        <div className="workspace-grid">
          <section className="work-panel">
            <div className="panel-head">
              <span>{operation === "encode" ? `Input (${inputMode === "hex" ? "Hex Bytes" : "Text"})` : "Input (Encoded Text)"}</span>
              <span>{inputCharCount} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              placeholder={operation === "encode" ? "Type or paste text here..." : "Paste encoded text here..."}
            />
          </section>

          <section className="work-panel">
            <div className="panel-head">
              <span>Output ({outputLabel})</span>
              <span>{outputCharCount} chars</span>
              <button className="tiny-button" onClick={() => setViewHex((value) => !value)}>
                {viewHex ? "View Output Text" : "View Output Hex"}
              </button>
            </div>
            <textarea value={renderedOutput} readOnly spellCheck={false} placeholder="Output will appear here..." />
            <div className="panel-actions">
              <button onClick={() => copy(renderedOutput, "Output")} disabled={!renderedOutput}>Copy Output</button>
              <button onClick={copyVerificationReport} disabled={!renderedOutput}>Copy Report</button>
              <button onClick={downloadOutput} disabled={!renderedOutput}>Download</button>
            </div>
          </section>
        </div>

        <details className="bottom-details">
          <summary>
            <span>Format details, examples & stats</span>
            <small>{formatBytes(inputByteCount)} input → {formatBytes(outputByteCount)} output · {ratioLabel}</small>
          </summary>

          <div className="stats-strip compact-stats">
            <div><strong>{inputCharCount}</strong><span>input chars</span></div>
            <div><strong>{formatBytes(inputByteCount)}</strong><span>input bytes</span></div>
            <div><strong>{outputCharCount}</strong><span>output chars</span></div>
            <div><strong>{formatBytes(outputByteCount)}</strong><span>output bytes</span></div>
            <div><strong>{ratioLabel}</strong><span>{operation === "encode" ? "expansion" : "decoded/input"}</span></div>
          </div>

          <div className="trust-strip">
            <div><strong>Source</strong><span>{selectedSpec.sourceUrl ? <a href={selectedSpec.sourceUrl} target="_blank" rel="noreferrer">{selectedSpec.standard}</a> : selectedSpec.standard}</span></div>
            <div><strong>Alphabet</strong><span className="mono-overflow">{selectedSpec.alphabet ?? "Reference implementation"}</span></div>
            <div><strong>Padding</strong><span>{selectedSpec.padding ?? "None"}</span></div>
            <div><strong>Mode</strong><span>{strict ? "Strict canonical" : "Forgiving decode"}</span></div>
          </div>

          {selectedSpec.examples.length > 0 && (
            <div className="example-strip">
              <span>Examples</span>
              {selectedSpec.examples.slice(0, 3).map((example, index) => (
                <div className="example-pair" key={`${example.encoded}-${index}`}>
                  <button onClick={() => loadExample(index, "encode")}>Encode sample</button>
                  <button onClick={() => loadExample(index, "decode")}>Decode sample</button>
                </div>
              ))}
            </div>
          )}

          {selectedSpec.canonicalRules.length > 0 && (
            <section className="rules-strip">
              <strong>Canonical rules</strong>
              <ul>
                {selectedSpec.canonicalRules.slice(0, 3).map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
            </section>
          )}
        </details>

        {detectionResults.length > 0 && (
          <section className="magic-results">
            <div className="panel-head"><span>Magic Decoder Candidates</span><span>{detectionResults.length} possible</span></div>
            <div className="candidate-grid">
              {detectionResults.map((result) => (
                <button
                  key={result.id}
                  className="candidate-card"
                  onClick={() => {
                    setEncodingId(result.id);
                    setOperation("decode");
                  }}
                >
                  <strong>{result.label}</strong>
                  <span>{result.confidence} confidence · {result.status}</span>
                  <small>{result.preview || "binary / empty preview"}</small>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
