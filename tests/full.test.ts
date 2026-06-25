import assert from "node:assert/strict";
import { encodingSpecs } from "../lib/encodings/registry";
import type { EncodingSpec } from "../lib/encodings/types";
import { bytesToHex, hexToBytes, utf8ToBytes } from "../lib/bytes";

function sameBytes(actual: Uint8Array, expected: Uint8Array, label: string): void {
  assert.equal(bytesToHex(actual), bytesToHex(expected), label);
}

async function encode(spec: EncodingSpec, input: Uint8Array, options = { strict: true, padding: true }): Promise<string> {
  assert.ok(spec.engine, `${spec.id} has no engine`);
  return await spec.engine.encode(input, options);
}

async function decode(spec: EncodingSpec, input: string, options = { strict: true, padding: true }): Promise<Uint8Array> {
  assert.ok(spec.engine, `${spec.id} has no engine`);
  return await spec.engine.decode(input, options);
}

function mustGet(id: string): EncodingSpec {
  const spec = encodingSpecs.find((item) => item.id === id);
  assert.ok(spec, `Missing encoding spec: ${id}`);
  assert.ok(spec.engine, `Missing engine for: ${id}`);
  return spec;
}

async function testExactVectors(id: string, vectors: Array<[string, string]>, options = { strict: true, padding: true }): Promise<void> {
  const spec = mustGet(id);
  for (const [plain, expected] of vectors) {
    const input = utf8ToBytes(plain);
    const encoded = await encode(spec, input, options);
    assert.equal(encoded, expected, `${spec.shortName} encode failed for ${JSON.stringify(plain)}`);
    const decoded = await decode(spec, expected, options);
    sameBytes(decoded, input, `${spec.shortName} decode failed for ${JSON.stringify(expected)}`);
  }
}

async function testRoundTrip(spec: EncodingSpec, input: Uint8Array, options = { strict: true, padding: true }): Promise<void> {
  const encoded = await encode(spec, input, options);
  const decoded = await decode(spec, encoded, options);
  sameBytes(decoded, input, `${spec.shortName} round-trip failed. Encoded value: ${encoded}`);
}

async function main(): Promise<void> {
  assert.ok(Array.isArray(encodingSpecs), "encodingSpecs export is not an array");
  assert.ok(encodingSpecs.length > 0, "No encoding specs found in lib/encodings/registry.ts");

  console.log(`Loaded ${encodingSpecs.length} encoding specs.`);

  await testExactVectors("base16-rfc4648", [
    ["", ""],
    ["f", "66"],
    ["fo", "666F"],
    ["foo", "666F6F"],
    ["foob", "666F6F62"],
    ["fooba", "666F6F6261"],
    ["foobar", "666F6F626172"],
  ]);

  await testExactVectors("base32-rfc4648", [
    ["", ""],
    ["f", "MY======"],
    ["fo", "MZXQ===="],
    ["foo", "MZXW6==="],
    ["foob", "MZXW6YQ="],
    ["fooba", "MZXW6YTB"],
    ["foobar", "MZXW6YTBOI======"],
  ]);

  await testExactVectors("base32hex-rfc4648", [
    ["", ""],
    ["f", "CO======"],
    ["fo", "CPNG===="],
    ["foo", "CPNMU==="],
    ["foob", "CPNMUOG="],
    ["fooba", "CPNMUOJ1"],
    ["foobar", "CPNMUOJ1E8======"],
  ]);

  await testExactVectors("base64-rfc4648", [
    ["", ""],
    ["f", "Zg=="],
    ["fo", "Zm8="],
    ["foo", "Zm9v"],
    ["foob", "Zm9vYg=="],
    ["fooba", "Zm9vYmE="],
    ["foobar", "Zm9vYmFy"],
  ]);

  const base64url = mustGet("base64url-rfc4648");
  assert.equal(await encode(base64url, new Uint8Array([0xfb, 0xff]), { strict: true, padding: true }), "-_8=", "Base64url padded alphabet vector failed");
  sameBytes(await decode(base64url, "-_8=", { strict: true, padding: true }), new Uint8Array([0xfb, 0xff]), "Base64url padded decode failed");

  const base64urlNoPad = mustGet("base64url-jose-rfc7515");
  assert.equal(await encode(base64urlNoPad, new Uint8Array([0xfb, 0xff]), { strict: true, padding: false }), "-_8", "JOSE Base64url no-padding vector failed");
  sameBytes(await decode(base64urlNoPad, "-_8", { strict: true, padding: false }), new Uint8Array([0xfb, 0xff]), "JOSE Base64url no-padding decode failed");

  const mime = mustGet("base64-mime-rfc2045");
  const longMimeInput = utf8ToBytes("a".repeat(60));
  const mimeEncoded = await encode(mime, longMimeInput);
  assert.ok(mimeEncoded.includes("\r\n"), "MIME Base64 should wrap long output using CRLF");
  sameBytes(await decode(mime, mimeEncoded), longMimeInput, "MIME Base64 wrapped decode failed");

  const pem = mustGet("base64-pem-rfc7468");
  const longPemInput = utf8ToBytes("a".repeat(60));
  const pemEncoded = await encode(pem, longPemInput);
  assert.ok(pemEncoded.includes("\r\n"), "PEM Base64 body should wrap long output using CRLF");
  sameBytes(await decode(pem, `-----BEGIN TEST-----\n${pemEncoded}\n-----END TEST-----`), longPemInput, "PEM armored body decode failed");

  await testExactVectors("base45-rfc9285", [
    ["AB", "BB8"],
    ["Hello!!", "%69 VD92EX0"],
    ["base-45", "UJCLQE7W581"],
  ]);

  const z85 = mustGet("z85-zeromq");
  const z85Bytes = new Uint8Array([0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59, 0xf7, 0x5b]);
  assert.equal(await encode(z85, z85Bytes), "HelloWorld", "Z85 official reference vector failed");
  sameBytes(await decode(z85, "HelloWorld"), z85Bytes, "Z85 official reference decode failed");

  const rfc1924 = mustGet("rfc1924-ipv6-base85");
  const ipv6Bytes = hexToBytes("108000000000000000080800200C417A");
  assert.equal(await encode(rfc1924, ipv6Bytes), "4)+k&C#VzJ4br>0wv%Yp", "RFC1924 IPv6 Base85 vector failed");
  sameBytes(await decode(rfc1924, "4)+k&C#VzJ4br>0wv%Yp"), ipv6Bytes, "RFC1924 IPv6 Base85 decode failed");

  const base58btc = mustGet("base58btc");
  assert.equal(await encode(base58btc, utf8ToBytes("hello world")), "StV1DL6CwTryKyV", "Base58BTC public reference vector failed");
  sameBytes(await decode(base58btc, "StV1DL6CwTryKyV"), utf8ToBytes("hello world"), "Base58BTC public reference decode failed");

  const failures: string[] = [];
  for (const spec of encodingSpecs) {
    try {
      if (spec.id === "z85-zeromq") {
        await testRoundTrip(spec, utf8ToBytes("ABCD1234"));
      } else if (spec.id === "rfc1924-ipv6-base85") {
        await testRoundTrip(spec, hexToBytes("108000000000000000080800200C417A"));
      } else {
        await testRoundTrip(spec, utf8ToBytes("Hello Ultimate Base Lab!"));
      }
    } catch (error) {
      failures.push(`${spec.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    console.error("Round-trip failures:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  const statusCounts = encodingSpecs.reduce<Record<string, number>>((acc, spec) => {
    acc[spec.status] = (acc[spec.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log("All full verification tests passed.");
  console.log(JSON.stringify({ specs: encodingSpecs.length, statusCounts }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
