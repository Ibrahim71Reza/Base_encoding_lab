import { compactInput } from "@/lib/bytes";
import type { EncodingEngine } from "./types";

// Joachim Henke's basE91 alphabet. The double quote is the final symbol.
export const BASE91_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";

export function encodeBase91(input: Uint8Array): string {
  let b = 0;
  let n = 0;
  let out = "";
  for (const byte of input) {
    b |= byte << n;
    n += 8;
    if (n > 13) {
      let v = b & 8191;
      if (v > 88) {
        b >>= 13;
        n -= 13;
      } else {
        v = b & 16383;
        b >>= 14;
        n -= 14;
      }
      out += BASE91_ALPHABET[v % 91] + BASE91_ALPHABET[Math.floor(v / 91)];
    }
  }
  if (n) {
    out += BASE91_ALPHABET[b % 91];
    if (n > 7 || b > 90) out += BASE91_ALPHABET[Math.floor(b / 91)];
  }
  return out;
}

export function decodeBase91(input: string): Uint8Array {
  const cleaned = compactInput(input);
  const table = new Map<string, number>();
  [...BASE91_ALPHABET].forEach((char, index) => table.set(char, index));
  let v = -1;
  let b = 0;
  let n = 0;
  const out: number[] = [];

  for (const char of cleaned) {
    const c = table.get(char);
    if (c === undefined) throw new Error(`Invalid basE91 character: ${char}`);
    if (v < 0) {
      v = c;
    } else {
      v += c * 91;
      b |= v << n;
      n += (v & 8191) > 88 ? 13 : 14;
      do {
        out.push(b & 255);
        b >>= 8;
        n -= 8;
      } while (n > 7);
      v = -1;
    }
  }

  if (v >= 0) out.push((b | (v << n)) & 255);
  return new Uint8Array(out);
}

export const base91Engine: EncodingEngine = {
  encode: encodeBase91,
  decode: decodeBase91
};
