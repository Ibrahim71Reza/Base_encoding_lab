import { compactInput } from "@/lib/bytes";
import type { EncodingEngine } from "./types";

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const B64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function encodeWithAlphabet(input: Uint8Array, alphabet: string, padding: boolean): string {
  let out = "";
  for (let i = 0; i < input.length; i += 3) {
    const b0 = input[i];
    const b1 = i + 1 < input.length ? input[i + 1] : 0;
    const b2 = i + 2 < input.length ? input[i + 2] : 0;
    const chunk = (b0 << 16) | (b1 << 8) | b2;
    out += alphabet[(chunk >>> 18) & 63];
    out += alphabet[(chunk >>> 12) & 63];
    out += i + 1 < input.length ? alphabet[(chunk >>> 6) & 63] : "=";
    out += i + 2 < input.length ? alphabet[chunk & 63] : "=";
  }
  return padding ? out : out.replace(/=+$/g, "");
}

function decodeWithAlphabet(input: string, alphabet: string, strict: boolean, requirePadding: boolean): Uint8Array {
  let cleaned = compactInput(input);
  if (!requirePadding) {
    const missing = cleaned.length % 4;
    if (missing === 1) throw new Error("Invalid Base64 length.");
    if (missing > 0) cleaned += "=".repeat(4 - missing);
  }
  if (cleaned.length % 4 !== 0) throw new Error("Base64 input length must be a multiple of 4 in padded mode.");
  const valid = new RegExp(`^[${escapeRegExp(alphabet)}]*={0,2}$`);
  if (!valid.test(cleaned)) throw new Error("Input contains characters outside the selected Base64 alphabet.");
  if (strict) {
    const firstPad = cleaned.indexOf("=");
    if (firstPad !== -1 && !/^={1,2}$/.test(cleaned.slice(firstPad))) {
      throw new Error("Padding must appear only at the end.");
    }
    if (requirePadding && cleaned.length > 0 && cleaned.length % 4 !== 0) {
      throw new Error("Strict padded Base64 requires length multiple of 4.");
    }
  }
  const map = new Map<string, number>();
  [...alphabet].forEach((c, i) => map.set(c, i));
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    const c0 = cleaned[i];
    const c1 = cleaned[i + 1];
    const c2 = cleaned[i + 2];
    const c3 = cleaned[i + 3];
    const v0 = map.get(c0);
    const v1 = map.get(c1);
    const v2 = c2 === "=" ? 0 : map.get(c2);
    const v3 = c3 === "=" ? 0 : map.get(c3);
    if (v0 === undefined || v1 === undefined || v2 === undefined || v3 === undefined) {
      throw new Error("Invalid Base64 symbol.");
    }
    const chunk = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    bytes.push((chunk >>> 16) & 255);
    if (c2 !== "=") bytes.push((chunk >>> 8) & 255);
    if (c3 !== "=") bytes.push(chunk & 255);
  }
  return new Uint8Array(bytes);
}

function escapeRegExp(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|\-]/g, "\\$&");
}

export const base64Engine: EncodingEngine = {
  encode: (input, options) => encodeWithAlphabet(input, B64, options?.padding ?? true),
  decode: (input, options) => decodeWithAlphabet(input, B64, options?.strict ?? true, options?.padding ?? true)
};

export const base64UrlEngine: EncodingEngine = {
  encode: (input, options) => encodeWithAlphabet(input, B64URL, options?.padding ?? true),
  decode: (input, options) => decodeWithAlphabet(input, B64URL, options?.strict ?? true, options?.padding ?? true)
};


function wrapLines(value: string, width: number): string {
  if (width <= 0) return value;
  const parts: string[] = [];
  for (let i = 0; i < value.length; i += width) parts.push(value.slice(i, i + width));
  return parts.join("\r\n");
}

function extractPemBase64(input: string): string {
  const withoutBoundaries = input
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "");
  return compactInput(withoutBoundaries);
}

export const base64MimeEngine: EncodingEngine = {
  encode: (input) => wrapLines(encodeWithAlphabet(input, B64, true), 76),
  decode: (input, options) => decodeWithAlphabet(input, B64, options?.strict ?? true, true)
};

export const base64PemBodyEngine: EncodingEngine = {
  encode: (input) => wrapLines(encodeWithAlphabet(input, B64, true), 64),
  decode: (input, options) => decodeWithAlphabet(extractPemBase64(input), B64, options?.strict ?? true, true)
};

function decodeBase64UrlNoPad(input: string, strict: boolean): Uint8Array {
  if (strict && /=/.test(input)) throw new Error("Canonical JOSE/JWT Base64url must not contain '=' padding.");
  return decodeWithAlphabet(input, B64URL, strict, false);
}

export const base64UrlNoPadEngine: EncodingEngine = {
  encode: (input) => encodeWithAlphabet(input, B64URL, false),
  decode: (input, options) => decodeBase64UrlNoPad(input, options?.strict ?? true)
};
