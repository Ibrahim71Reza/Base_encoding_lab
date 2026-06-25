import { compactInput } from "@/lib/bytes";
import type { EncodingEngine } from "./types";

export const BASE58_BTC = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const BASE58_FLICKR = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
export const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function encodeBaseNBigInt(input: Uint8Array, alphabet: string, leadingZeroChar = alphabet[0]): string {
  if (input.length === 0) return "";
  let value = 0n;
  for (const byte of input) value = (value << 8n) + BigInt(byte);
  const base = BigInt(alphabet.length);
  let out = "";
  while (value > 0n) {
    const digit = Number(value % base);
    out = alphabet[digit] + out;
    value /= base;
  }
  for (const byte of input) {
    if (byte === 0) out = leadingZeroChar + out;
    else break;
  }
  return out || leadingZeroChar;
}

export function decodeBaseNBigInt(input: string, alphabet: string, leadingZeroChar = alphabet[0]): Uint8Array {
  const cleaned = compactInput(input);
  if (cleaned.length === 0) return new Uint8Array();
  const map = new Map<string, number>();
  [...alphabet].forEach((char, index) => map.set(char, index));
  const base = BigInt(alphabet.length);
  let value = 0n;
  for (const char of cleaned) {
    const digit = map.get(char);
    if (digit === undefined) throw new Error(`Invalid base-${alphabet.length} character: ${char}`);
    value = value * base + BigInt(digit);
  }
  const bytes: number[] = [];
  while (value > 0n) {
    bytes.unshift(Number(value & 255n));
    value >>= 8n;
  }
  for (const char of cleaned) {
    if (char === leadingZeroChar) bytes.unshift(0);
    else break;
  }
  return new Uint8Array(bytes);
}

export const base58BtcEngine: EncodingEngine = {
  encode: (input) => encodeBaseNBigInt(input, BASE58_BTC, "1"),
  decode: (input) => decodeBaseNBigInt(input, BASE58_BTC, "1")
};

export const base58FlickrEngine: EncodingEngine = {
  encode: (input) => encodeBaseNBigInt(input, BASE58_FLICKR, "1"),
  decode: (input) => decodeBaseNBigInt(input, BASE58_FLICKR, "1")
};

export const base36Engine: EncodingEngine = {
  encode: (input) => encodeBaseNBigInt(input, BASE36, "0"),
  decode: (input) => decodeBaseNBigInt(input.toUpperCase(), BASE36, "0")
};

export const base62Engine: EncodingEngine = {
  encode: (input) => encodeBaseNBigInt(input, BASE62, "0"),
  decode: (input) => decodeBaseNBigInt(input, BASE62, "0")
};
