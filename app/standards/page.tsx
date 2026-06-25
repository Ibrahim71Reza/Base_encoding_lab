import { categories, encodingSpecs } from "@/lib/encodings/registry";

export const metadata = {
  title: "Standards matrix — BaseForge",
  description: "Official, stable, de facto, published reference, and experimental base encoding status matrix."
};

export default function StandardsPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="eyebrow">Specification matrix</div>
        <h1>Know exactly which variant you are using.</h1>
        <p>BaseForge does not hide variant differences. Each tool is labeled by status, source, alphabet, padding rule, and caveats.</p>
        {categories.map((category) => (
          <section className="section" key={category}>
            <h2>{category}</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Encoding</th><th>Status</th><th>Standard/source</th><th>Padding</th><th>URL-safe</th></tr></thead>
                <tbody>
                  {encodingSpecs.filter((spec) => spec.category === category).map((spec) => (
                    <tr key={spec.id}>
                      <td><a className="code" href={`/encodings/${spec.id}/`}>{spec.shortName}</a></td>
                      <td>{spec.status}</td>
                      <td>{spec.sourceUrl ? <a href={spec.sourceUrl}>{spec.standard}</a> : spec.standard}</td>
                      <td>{spec.padding ?? "None"}</td>
                      <td>{spec.safeForUrls ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
