import { encodingSpecs } from "../lib/encodings/registry";
import { bytesToHex, hexToBytes, utf8ToBytes } from "../lib/bytes";

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

function bytesForSpec(id: string): Uint8Array {
  if (id === "rfc1924-ipv6-base85") return hexToBytes("00000000000000000000000000000000");
  if (id === "z85-zeromq") return utf8ToBytes("test");
  return utf8ToBytes("Hello Ultimate Lab!");
}

async function main() {
  let checks = 0;
  const statusCounts: Record<string, number> = {};
  const failures: string[] = [];

  for (const spec of encodingSpecs) {
    statusCounts[spec.status] = (statusCounts[spec.status] ?? 0) + 1;

    if (!spec.engine) {
      failures.push(`${spec.id}: missing engine`);
      continue;
    }

    try {
      const input = bytesForSpec(spec.id);
      const encoded = await spec.engine.encode(input, { strict: true, padding: true });
      const decoded = await spec.engine.decode(encoded, { strict: true, padding: true });
      assertEqual(bytesToHex(decoded), bytesToHex(input), `${spec.shortName} round-trip`);
      checks++;
    } catch (err: any) {
      failures.push(`${spec.id} round-trip: ${err?.message ?? String(err)}`);
    }

    for (const example of spec.examples) {
      try {
        const cleanPlain = example.plain.replace(/^hex:\s*/i, "");
        const input = example.inputMode === "hex" ? hexToBytes(cleanPlain) : utf8ToBytes(example.plain);
        const encoded = await spec.engine.encode(input, { strict: true, padding: true });
        assertEqual(encoded, example.encoded, `${spec.shortName} example encode ${example.plain}`);
        const decoded = await spec.engine.decode(example.encoded, { strict: true, padding: true });
        assertEqual(bytesToHex(decoded), bytesToHex(input), `${spec.shortName} example decode ${example.encoded}`);
        checks += 2;
      } catch (err: any) {
        failures.push(`${spec.id} example ${example.plain}: ${err?.message ?? String(err)}`);
      }
    }
  }

  console.log("BaseForge full verification report");
  console.log(JSON.stringify({ specs: encodingSpecs.length, statusCounts, checks, failures }, null, 2));

  if (failures.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
