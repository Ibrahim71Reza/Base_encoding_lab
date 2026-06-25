import { compactInput } from "@/lib/bytes";
import type { EncodingEngine } from "./types";

const RFC4648 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const RFC4648_HEX = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ZBASE32 = "ybndrfg8ejkmcpqxot1uwisza345h769";

function encodeBase32Generic(input: Uint8Array, alphabet: string, padding: boolean): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of input) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += alphabet[(value << (5 - bits)) & 31];
  }
  if (padding) {
    while (out.length % 8 !== 0) out += "=";
  }
  return out;
}

function decodeBase32Generic(input: string, alphabet: string, strict: boolean, padding: boolean, aliases?: Record<string, string>): Uint8Array {
  let cleaned = compactInput(input);
  if (!padding) cleaned = cleaned.replace(/=+$/g, "");
  if (padding && cleaned.length % 8 !== 0) throw new Error("Padded Base32 input length must be a multiple of 8.");
  const firstPad = cleaned.indexOf("=");
  if (firstPad !== -1 && !/^=+$/.test(cleaned.slice(firstPad))) {
    throw new Error("Base32 padding must appear only at the end.");
  }
  const unpadded = cleaned.replace(/=+$/g, "");
  const map = new Map<string, number>();
  [...alphabet].forEach((char, index) => {
    map.set(char, index);
    if (!strict) map.set(char.toLowerCase(), index);
  });
  if (aliases) {
    for (const [from, to] of Object.entries(aliases)) {
      const target = map.get(to);
      if (target !== undefined) map.set(from, target);
    }
  }
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of unpadded) {
    const digit = map.get(char);
    if (digit === undefined) throw new Error(`Invalid Base32 character: ${char}`);
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export const base32Engine: EncodingEngine = {
  encode: (input, options) => encodeBase32Generic(input, RFC4648, options?.padding ?? true),
  decode: (input, options) => decodeBase32Generic(input, RFC4648, options?.strict ?? true, options?.padding ?? true)
};

export const base32HexEngine: EncodingEngine = {
  encode: (input, options) => encodeBase32Generic(input, RFC4648_HEX, options?.padding ?? true),
  decode: (input, options) => decodeBase32Generic(input, RFC4648_HEX, options?.strict ?? true, options?.padding ?? true)
};

export const crockfordBase32Engine: EncodingEngine = {
  encode: (input) => encodeBase32Generic(input, CROCKFORD, false),
  decode: (input, options) => decodeBase32Generic(input.toUpperCase(), CROCKFORD, options?.strict ?? false, false, {
    O: "0",
    o: "0",
    I: "1",
    i: "1",
    L: "1",
    l: "1"
  })
};

export const zBase32Engine: EncodingEngine = {
  encode: (input) => encodeBase32Generic(input, ZBASE32, false),
  decode: (input, options) => decodeBase32Generic(input, ZBASE32, options?.strict ?? true, false)
};
