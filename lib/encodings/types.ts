export type EncodingStatus =
  | "Official standard"
  | "Stable specification"
  | "Published reference"
  | "De facto standard"
  | "Experimental reference"
  | "Educational / custom";

export type EncodingCategory =
  | "Official standards"
  | "Base32 family"
  | "Base58 / crypto"
  | "Base85 family"
  | "Dense printable encodings"
  | "Rare Unicode lab"
  | "Custom / numeric";

export type EncodeDecodeMode = "text" | "hex" | "file";

export type EngineOptions = {
  strict?: boolean;
  padding?: boolean;
};

export type EncodingEngine = {
  encode(input: Uint8Array, options?: EngineOptions): string | Promise<string>;
  decode(input: string, options?: EngineOptions): Uint8Array | Promise<Uint8Array>;
};

export type EncodingExample = {
  plain: string;
  encoded: string;
  inputMode?: "text" | "hex";
};

export type EncodingSpec = {
  id: string;
  name: string;
  shortName: string;
  category: EncodingCategory;
  status: EncodingStatus;
  standard: string;
  sourceUrl?: string;
  alphabet?: string;
  padding?: string | null;
  safeForUrls: boolean;
  supportsFiles: boolean;
  summary: string;
  canonicalRules: string[];
  examples: EncodingExample[];
  caveats?: string[];
  aliases?: string[];
  tags?: string[];
  recommended?: boolean;
  engine?: EncodingEngine;
};
