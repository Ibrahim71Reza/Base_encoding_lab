import { bytesToHex, hexToBytes } from "@/lib/bytes";
import type { EncodingEngine } from "./types";

export function encodeBase16(input: Uint8Array, uppercase = true): string {
  return bytesToHex(input, uppercase);
}

export function decodeBase16(input: string): Uint8Array {
  return hexToBytes(input);
}

export const base16UpperEngine: EncodingEngine = {
  encode: (input) => encodeBase16(input, true),
  decode: (input, options) => {
    const cleaned = input.replace(/\s+/g, "");
    if (options?.strict && /[a-f]/.test(cleaned)) {
      throw new Error("Strict Base16 uppercase mode rejects lowercase hex digits.");
    }
    return decodeBase16(cleaned);
  }
};

export const base16LowerEngine: EncodingEngine = {
  encode: (input) => encodeBase16(input, false),
  decode: (input, options) => {
    const cleaned = input.replace(/\s+/g, "");
    if (options?.strict && /[A-F]/.test(cleaned)) {
      throw new Error("Strict Base16 lowercase mode rejects uppercase hex digits.");
    }
    return decodeBase16(cleaned);
  }
};
