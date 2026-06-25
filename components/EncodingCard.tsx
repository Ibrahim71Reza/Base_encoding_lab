import Link from "next/link";
import type { EncodingSpec } from "@/lib/encodings/types";

export default function EncodingCard({ spec }: { spec: EncodingSpec }) {
  return (
    <Link className="card" href={`/encodings/${spec.id}/`}>
      <div className="badges" style={{ marginTop: 0 }}>
        <span className={spec.status.includes("Official") ? "badge good" : "badge warn"}>{spec.status}</span>
        <span className="badge">{spec.category}</span>
      </div>
      <h3 style={{ marginTop: 18 }}>{spec.shortName}</h3>
      <p>{spec.summary}</p>
      <div className="code">{spec.alphabet ? spec.alphabet.slice(0, 80) : spec.standard}</div>
    </Link>
  );
}
