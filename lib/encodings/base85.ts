import { compactInput } from "@/lib/bytes";
import type { EncodingEngine } from "./types";

export const ASCII85_ALPHABET = Array.from({ length: 85 }, (_, i) => String.fromCharCode(i + 33)).join("");
export const Z85_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
export const RFC1924_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";

function encodeBase85Blocks(input: Uint8Array, alphabet: string, requireMultipleOfFour: boolean): string {
  if (requireMultipleOfFour && input.length % 4 !== 0) {
    throw new Error("This Base85 variant requires input length to be a multiple of 4 bytes.");
  }
  let out = "";
  for (let i = 0; i < input.length; i += 4) {
    const remain = Math.min(4, input.length - i);
    const b0 = input[i] ?? 0;
    const b1 = input[i + 1] ?? 0;
    const b2 = input[i + 2] ?? 0;
    const b3 = input[i + 3] ?? 0;
    let value = (((b0 * 256 + b1) * 256 + b2) * 256 + b3) >>> 0;
    const chars = Array(5);
    for (let j = 4; j >= 0; j--) {
      chars[j] = alphabet[value % 85];
      value = Math.floor(value / 85);
    }
    out += remain < 4 ? chars.join("").slice(0, remain + 1) : chars.join("");
  }
  return out;
}

function decodeBase85Blocks(input: string, alphabet: string, requireMultipleOfFive: boolean): Uint8Array {
  const cleaned = compactInput(input);
  if (requireMultipleOfFive && cleaned.length % 5 !== 0) {
    throw new Error("This Base85 variant requires encoded length to be a multiple of 5 characters.");
  }
  const map = new Map<string, number>();
  [...alphabet].forEach((char, index) => map.set(char, index));
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i += 5) {
    const chunk = cleaned.slice(i, i + 5);
    const padded = chunk.padEnd(5, alphabet[84]);
    let value = 0;
    for (const char of padded) {
      const digit = map.get(char);
      if (digit === undefined) throw new Error(`Invalid Base85 character: ${char}`);
      value = value * 85 + digit;
    }
    const bytes = [
      (value >>> 24) & 255,
      (value >>> 16) & 255,
      (value >>> 8) & 255,
      value & 255
    ];
    out.push(...(chunk.length < 5 ? bytes.slice(0, chunk.length - 1) : bytes));
  }
  return new Uint8Array(out);
}

function encodeAscii85Raw(input: Uint8Array, adobe: boolean): string {
  let out = "";
  for (let i = 0; i < input.length; i += 4) {
    const remain = Math.min(4, input.length - i);
    const b0 = input[i] ?? 0;
    const b1 = input[i + 1] ?? 0;
    const b2 = input[i + 2] ?? 0;
    const b3 = input[i + 3] ?? 0;
    const value = (((b0 * 256 + b1) * 256 + b2) * 256 + b3) >>> 0;
    if (remain === 4 && value === 0) {
      out += "z";
      continue;
    }
    let v = value;
    const chars = Array<string>(5);
    for (let j = 4; j >= 0; j--) {
      chars[j] = String.fromCharCode((v % 85) + 33);
      v = Math.floor(v / 85);
    }
    out += remain < 4 ? chars.join("").slice(0, remain + 1) : chars.join("");
  }
  return adobe ? `<~${out}~>` : out;
}

function decodeAscii85Raw(input: string): Uint8Array {
  let cleaned = input.trim();
  if (cleaned.startsWith("<~") && cleaned.endsWith("~>")) cleaned = cleaned.slice(2, -2);
  cleaned = cleaned.replace(/\s+/g, "");
  const out: number[] = [];
  let group = "";

  function flush(final = false) {
    if (!group) return;
    if (group.length === 1) throw new Error("Invalid Ascii85 final group of one character.");
    const originalLength = group.length;
    while (group.length < 5) group += "u";
    let value = 0;
    for (const char of group) {
      const code = char.charCodeAt(0);
      if (code < 33 || code > 117) throw new Error(`Invalid Ascii85 character: ${char}`);
      value = value * 85 + (code - 33);
    }
    const bytes = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
    out.push(...(final && originalLength < 5 ? bytes.slice(0, originalLength - 1) : bytes));
    group = "";
  }

  for (const char of cleaned) {
    if (char === "z") {
      if (group.length) throw new Error("Ascii85 'z' shorthand can only appear between groups.");
      out.push(0, 0, 0, 0);
      continue;
    }
    group += char;
    if (group.length === 5) flush(false);
  }
  flush(true);
  return new Uint8Array(out);
}

export const ascii85Engine: EncodingEngine = {
  encode: (input) => encodeAscii85Raw(input, false),
  decode: decodeAscii85Raw
};

export const adobeAscii85Engine: EncodingEngine = {
  encode: (input) => encodeAscii85Raw(input, true),
  decode: decodeAscii85Raw
};

export const z85Engine: EncodingEngine = {
  encode: (input) => encodeBase85Blocks(input, Z85_ALPHABET, true),
  decode: (input) => decodeBase85Blocks(input, Z85_ALPHABET, true)
};

export const rfc1924Engine: EncodingEngine = {
  encode: (input) => {
    if (input.length !== 16) throw new Error("RFC 1924 IPv6 Base85 mode requires exactly 16 bytes.");
    let value = 0n;
    for (const byte of input) value = (value << 8n) + BigInt(byte);
    let out = "";
    for (let i = 0; i < 20; i++) {
      out = RFC1924_ALPHABET[Number(value % 85n)] + out;
      value /= 85n;
    }
    return out;
  },
  decode: (input) => {
    const cleaned = compactInput(input);
    if (cleaned.length !== 20) throw new Error("RFC 1924 IPv6 Base85 encoded input must be exactly 20 characters.");
    const map = new Map<string, number>();
    [...RFC1924_ALPHABET].forEach((char, index) => map.set(char, index));
    let value = 0n;
    for (const char of cleaned) {
      const digit = map.get(char);
      if (digit === undefined) throw new Error(`Invalid RFC 1924 character: ${char}`);
      value = value * 85n + BigInt(digit);
    }
    const out = new Uint8Array(16);
    for (let i = 15; i >= 0; i--) {
      out[i] = Number(value & 255n);
      value >>= 8n;
    }
    return out;
  }
};
