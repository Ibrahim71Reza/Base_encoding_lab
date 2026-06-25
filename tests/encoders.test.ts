import { utf8ToBytes, bytesToUtf8, bytesToHex, hexToBytes } from "../lib/bytes";
import { base16UpperEngine } from "../lib/encodings/base16";
import { base32Engine, base32HexEngine } from "../lib/encodings/base32";
import { base45Engine } from "../lib/encodings/base45";
import { base64Engine, base64MimeEngine, base64PemBodyEngine, base64UrlEngine, base64UrlNoPadEngine } from "../lib/encodings/base64";
import { adobeAscii85Engine, ascii85Engine, rfc1924Engine, z85Engine } from "../lib/encodings/base85";
import { base36Engine, base58BtcEngine, base58FlickrEngine, base62Engine } from "../lib/encodings/base58";
import { base58CheckEngine } from "../lib/encodings/base58check";
import { base91Engine } from "../lib/encodings/base91";

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

async function roundTrip(label: string, engine: { encode(input: Uint8Array): string | Promise<string>; decode(input: string): Uint8Array | Promise<Uint8Array> }, text: string) {
  const encoded = await engine.encode(utf8ToBytes(text));
  const decoded = await engine.decode(encoded);
  assertEqual(bytesToUtf8(decoded), text, label);
}

async function main() {

  const rfc4648Texts = ["", "f", "fo", "foo", "foob", "fooba", "foobar"];
  const rfc4648Base16 = ["", "66", "666F", "666F6F", "666F6F62", "666F6F6261", "666F6F626172"];
  const rfc4648Base32 = ["", "MY======", "MZXQ====", "MZXW6===", "MZXW6YQ=", "MZXW6YTB", "MZXW6YTBOI======"];
  const rfc4648Base32hex = ["", "CO======", "CPNG====", "CPNMU===", "CPNMUOG=", "CPNMUOJ1", "CPNMUOJ1E8======"];
  const rfc4648Base64 = ["", "Zg==", "Zm8=", "Zm9v", "Zm9vYg==", "Zm9vYmE=", "Zm9vYmFy"];
  for (let i = 0; i < rfc4648Texts.length; i++) {
    assertEqual(await base16UpperEngine.encode(utf8ToBytes(rfc4648Texts[i])), rfc4648Base16[i], `RFC4648 Base16 vector ${i}`);
    assertEqual(await base32Engine.encode(utf8ToBytes(rfc4648Texts[i]), { padding: true }), rfc4648Base32[i], `RFC4648 Base32 vector ${i}`);
    assertEqual(await base32HexEngine.encode(utf8ToBytes(rfc4648Texts[i]), { padding: true }), rfc4648Base32hex[i], `RFC4648 Base32hex vector ${i}`);
    assertEqual(await base64Engine.encode(utf8ToBytes(rfc4648Texts[i]), { padding: true }), rfc4648Base64[i], `RFC4648 Base64 vector ${i}`);
  }
  assertEqual(await base16UpperEngine.encode(utf8ToBytes("hello")), "68656C6C6F", "Base16 hello");
  assertEqual(bytesToUtf8(await base16UpperEngine.decode("68656C6C6F")), "hello", "Base16 decode hello");

  assertEqual(await base64Engine.encode(utf8ToBytes("hello"), { padding: true }), "aGVsbG8=", "Base64 hello");
  assertEqual(bytesToUtf8(await base64Engine.decode("aGVsbG8=", { padding: true })), "hello", "Base64 decode hello");
  assertEqual(await base64UrlEngine.encode(new Uint8Array([251, 255]), { padding: true }), "-_8=", "Base64url symbols");
  assertEqual(await base64UrlNoPadEngine.encode(utf8ToBytes("hello")), "aGVsbG8", "Base64url no-pad hello");
  assertEqual(bytesToUtf8(await base64UrlNoPadEngine.decode("aGVsbG8")), "hello", "Base64url no-pad decode hello");
  assertEqual(await base64MimeEngine.encode(utf8ToBytes("hello")), "aGVsbG8=", "MIME Base64 short hello");
  assertEqual(bytesToUtf8(await base64MimeEngine.decode("aGVs\r\nbG8=")), "hello", "MIME Base64 decode wrapped hello");
  assertEqual(await base64PemBodyEngine.encode(utf8ToBytes("hello")), "aGVsbG8=", "PEM Base64 body short hello");
  assertEqual(bytesToUtf8(await base64PemBodyEngine.decode("-----BEGIN TEST-----\naGVsbG8=\n-----END TEST-----")), "hello", "PEM Base64 body decode armor");

  assertEqual(await base32Engine.encode(utf8ToBytes("hello"), { padding: true }), "NBSWY3DP", "Base32 hello");
  assertEqual(bytesToUtf8(await base32Engine.decode("NBSWY3DP", { padding: true })), "hello", "Base32 decode hello");
  assertEqual(await base32HexEngine.encode(utf8ToBytes("hello"), { padding: true }), "D1IMOR3F", "Base32hex hello");

  assertEqual(await base45Engine.encode(utf8ToBytes("AB")), "BB8", "Base45 AB");
  assertEqual(bytesToUtf8(await base45Engine.decode("BB8")), "AB", "Base45 decode AB");

  assertEqual(await z85Engine.encode(utf8ToBytes("test")), "By/Jn", "Z85 test");
  assertEqual(bytesToUtf8(await z85Engine.decode("By/Jn")), "test", "Z85 decode test");

  assertEqual(await ascii85Engine.encode(utf8ToBytes("hello")), "BOu!rDZ", "Ascii85 hello");
  assertEqual(bytesToUtf8(await ascii85Engine.decode("BOu!rDZ")), "hello", "Ascii85 decode hello");
  assertEqual(await adobeAscii85Engine.encode(utf8ToBytes("hello")), "<~BOu!rDZ~>", "Adobe Ascii85 hello");
  assertEqual(bytesToUtf8(await adobeAscii85Engine.decode("<~BOu!rDZ~>")), "hello", "Adobe Ascii85 decode hello");

  const zero16 = hexToBytes("00000000000000000000000000000000");
  assertEqual(await rfc1924Engine.encode(zero16), "00000000000000000000", "RFC1924 zeros");
  assertEqual(bytesToHex(await rfc1924Engine.decode("00000000000000000000")), "00000000000000000000000000000000", "RFC1924 decode zeros");

  assertEqual(await base58BtcEngine.encode(utf8ToBytes("hello")), "Cn8eVZg", "Base58BTC hello");
  assertEqual(await base58FlickrEngine.encode(utf8ToBytes("hello")), "cM8DuyF", "Base58Flickr hello");
  assertEqual(await base36Engine.encode(utf8ToBytes("hello")), "5PZCSZU7", "Base36 hello");
  assertEqual(await base62Engine.encode(utf8ToBytes("hello")), "7tQLFHz", "Base62 hello");
  await roundTrip("Base58BTC", base58BtcEngine, "hello");
  await roundTrip("Base62", base62Engine, "hello");

  assertEqual(await base58CheckEngine.encode(hexToBytes("00")), "1Wh4bh", "Base58Check single zero payload");
  assertEqual(bytesToHex(await base58CheckEngine.decode("1Wh4bh")), "00", "Base58Check decode single zero payload");

  assertEqual(await base91Engine.encode(utf8ToBytes("hello")), "TPwJh>A", "basE91 hello");
  assertEqual(bytesToUtf8(await base91Engine.decode("TPwJh>A")), "hello", "basE91 decode hello");

  console.log("All encoder tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
