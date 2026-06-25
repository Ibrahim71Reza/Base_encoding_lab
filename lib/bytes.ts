export function utf8ToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function bytesToHex(bytes: Uint8Array, uppercase = true): string {
  const table = uppercase ? "0123456789ABCDEF" : "0123456789abcdef";
  let out = "";
  for (const byte of bytes) {
    out += table[byte >>> 4] + table[byte & 15];
  }
  return out;
}

export function hexToBytes(input: string): Uint8Array {
  const normalized = input.replace(/\s+/g, "");
  if (normalized.length % 2 !== 0) {
    throw new Error("Hex input must contain an even number of digits.");
  }
  if (!/^[0-9a-fA-F]*$/.test(normalized)) {
    throw new Error("Hex input contains non-hexadecimal characters.");
  }
  const out = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function groupLines(value: string, width: number): string {
  if (!width || width < 1) return value;
  const parts: string[] = [];
  for (let i = 0; i < value.length; i += width) {
    parts.push(value.slice(i, i + width));
  }
  return parts.join("\n");
}

export function compactInput(value: string): string {
  return value.replace(/[\t\r\n ]+/g, "");
}

export function downloadBytes(filename: string, bytes: Uint8Array): void {
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([body], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
