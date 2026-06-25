import { decodeBaseNBigInt, encodeBaseNBigInt } from "./base58";

export function validateAlphabet(alphabet: string): string[] {
  const errors: string[] = [];
  const chars = [...alphabet];
  if (chars.length < 2) errors.push("Alphabet must contain at least 2 symbols.");
  if (chars.length !== new Set(chars).size) errors.push("Alphabet contains duplicate symbols.");
  if (/\s/.test(alphabet)) errors.push("Whitespace inside the alphabet is unsafe for a general converter.");
  return errors;
}

export function encodeCustomBase(input: Uint8Array, alphabet: string): string {
  const errors = validateAlphabet(alphabet);
  if (errors.length) throw new Error(errors.join(" "));
  return encodeBaseNBigInt(input, alphabet, [...alphabet][0]);
}

export function decodeCustomBase(input: string, alphabet: string): Uint8Array {
  const errors = validateAlphabet(alphabet);
  if (errors.length) throw new Error(errors.join(" "));
  return decodeBaseNBigInt(input, alphabet, [...alphabet][0]);
}
