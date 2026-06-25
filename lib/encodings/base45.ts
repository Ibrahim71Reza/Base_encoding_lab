import type { EncodingEngine } from "./types";

export const BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

export function encodeBase45(input: Uint8Array): string {
  let out = "";
  for (let i = 0; i < input.length; i += 2) {
    if (i + 1 < input.length) {
      let x = (input[i] << 8) + input[i + 1];
      const e = Math.floor(x / (45 * 45));
      x -= e * 45 * 45;
      const d = Math.floor(x / 45);
      const c = x % 45;
      out += BASE45_ALPHABET[c] + BASE45_ALPHABET[d] + BASE45_ALPHABET[e];
    } else {
      const x = input[i];
      out += BASE45_ALPHABET[x % 45] + BASE45_ALPHABET[Math.floor(x / 45)];
    }
  }
  return out;
}

export function decodeBase45(input: string): Uint8Array {
  // RFC 9285 Base45 alphabet includes a literal space character, so spaces must not be stripped.
  // We only ignore line breaks/tabs to support wrapped or copied input without corrupting valid spaces.
  const cleaned = input.replace(/[\r\n\t]/g, "");
  const map = new Map<string, number>();
  [...BASE45_ALPHABET].forEach((char, index) => map.set(char, index));
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; ) {
    const remaining = cleaned.length - i;
    if (remaining === 1) throw new Error("Invalid Base45 length: final group cannot contain one character.");
    const c = map.get(cleaned[i]);
    const d = map.get(cleaned[i + 1]);
    if (c === undefined || d === undefined) throw new Error("Invalid Base45 character.");
    if (remaining >= 3) {
      const e = map.get(cleaned[i + 2]);
      if (e === undefined) throw new Error("Invalid Base45 character.");
      const x = c + d * 45 + e * 45 * 45;
      if (x > 0xffff) throw new Error("Invalid Base45 triplet: value exceeds 16 bits.");
      out.push((x >>> 8) & 255, x & 255);
      i += 3;
    } else {
      const x = c + d * 45;
      if (x > 0xff) throw new Error("Invalid Base45 final pair: value exceeds 8 bits.");
      out.push(x);
      i += 2;
    }
  }
  return new Uint8Array(out);
}

export const base45Engine: EncodingEngine = {
  encode: encodeBase45,
  decode: decodeBase45
};
