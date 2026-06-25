declare module "base2048" {
  export function encode(input: Uint8Array): string;
  export function decode(input: string): Uint8Array;
}

declare module "base32768" {
  export function encode(input: Uint8Array): string;
  export function decode(input: string): Uint8Array;
}

declare module "base65536" {
  export function encode(input: Uint8Array): string;
  export function decode(input: string): Uint8Array;
  const base65536: {
    encode: typeof encode;
    decode: typeof decode;
  };
  export default base65536;
}
