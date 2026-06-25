import EncoderTool from "@/components/EncoderTool";
import { encodingSpecs, getEncodingById } from "@/lib/encodings/registry";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return encodingSpecs.map((spec) => ({ id: spec.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const spec = getEncodingById(params.id);
  return {
    title: spec ? `${spec.shortName} encoder/decoder — BaseForge` : "Encoding — BaseForge",
    description: spec?.summary
  };
}

export default function EncodingDetailPage({ params }: { params: { id: string } }) {
  const spec = getEncodingById(params.id);
  if (!spec) notFound();

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">{spec.category}</div>
            <h1>{spec.name}</h1>
            <p>{spec.summary}</p>
            <div className="badges">
              <span className={spec.status.includes("Official") ? "badge good" : "badge warn"}>{spec.status}</span>
              <span className="badge">{spec.standard}</span>
              <span className="badge">{spec.safeForUrls ? "URL-safe" : "Not fully URL-safe"}</span>
            </div>
          </div>
          <div className="card">
            <h2>Specification facts</h2>
            <div className="kv"><div>Status</div><div>{spec.status}</div></div>
            <div className="kv"><div>Standard/source</div><div>{spec.sourceUrl ? <a className="code" href={spec.sourceUrl}>{spec.standard}</a> : spec.standard}</div></div>
            <div className="kv"><div>Padding</div><div>{spec.padding ?? "None"}</div></div>
            <div className="kv"><div>Alphabet</div><div className="code">{spec.alphabet ?? "Reference-defined"}</div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <EncoderTool defaultEncodingId={spec.id} />
        </div>
      </section>

      <section className="section">
        <div className="container hero-grid">
          <div className="card">
            <h2>Canonical rules</h2>
            <ul className="list">
              {spec.canonicalRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
          <div className="card">
            <h2>Examples</h2>
            {spec.examples.map((example) => (
              <div className="kv" key={example.plain + example.encoded}>
                <div>{example.plain}</div>
                <div className="code">{example.encoded}</div>
              </div>
            ))}
            {spec.caveats && <p>{spec.caveats.join(" ")}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
