export async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("SHA-256 requires Web Crypto. Use a modern browser or Node version with crypto.subtle.");
  }
  const input = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", input);
  return new Uint8Array(digest);
}

export async function doubleSha256(bytes: Uint8Array): Promise<Uint8Array> {
  return sha256(await sha256(bytes));
}
