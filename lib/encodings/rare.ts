import type { EncodingEngine } from "./types";

type RareModule = {
  encode?: (input: Uint8Array) => string;
  decode?: (input: string) => Uint8Array;
  default?: {
    encode?: (input: Uint8Array) => string;
    decode?: (input: string) => Uint8Array;
  };
};

async function importRare(packageName: "base2048" | "base32768" | "base65536"): Promise<RareModule> {
  if (packageName === "base2048") return (await import("base2048")) as RareModule;
  if (packageName === "base32768") return (await import("base32768")) as RareModule;
  return (await import("base65536")) as RareModule;
}

async function loadEngine(packageName: "base2048" | "base32768" | "base65536"): Promise<Required<EncodingEngine>> {
  const mod = await importRare(packageName);
  const encode = mod.encode ?? mod.default?.encode;
  const decode = mod.decode ?? mod.default?.decode;
  if (!encode || !decode) {
    throw new Error(`${packageName} did not expose encode/decode functions. Check the package version.`);
  }
  return { encode, decode };
}

export function makeRarePackageEngine(packageName: "base2048" | "base32768" | "base65536"): EncodingEngine {
  return {
    async encode(input) {
      const engine = await loadEngine(packageName);
      return engine.encode(input);
    },
    async decode(input) {
      const engine = await loadEngine(packageName);
      return engine.decode(input);
    }
  };
}
