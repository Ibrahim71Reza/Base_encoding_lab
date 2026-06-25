import { doubleSha256 } from "@/lib/crypto";
import type { EncodingEngine } from "./types";
import { BASE58_BTC, decodeBaseNBigInt, encodeBaseNBigInt } from "./base58";

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export async function encodeBase58Check(payload: Uint8Array): Promise<string> {
  const checksum = (await doubleSha256(payload)).slice(0, 4);
  return encodeBaseNBigInt(concat(payload, checksum), BASE58_BTC, "1");
}

export async function decodeBase58Check(input: string): Promise<Uint8Array> {
  const all = decodeBaseNBigInt(input, BASE58_BTC, "1");
  if (all.length < 5) throw new Error("Base58Check data is too short to contain a 4-byte checksum.");
  const payload = all.slice(0, -4);
  const checksum = all.slice(-4);
  const expected = (await doubleSha256(payload)).slice(0, 4);
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expected[i]) throw new Error("Base58Check checksum verification failed.");
  }
  return payload;
}

export const base58CheckEngine: EncodingEngine = {
  encode: encodeBase58Check,
  decode: decodeBase58Check
};
