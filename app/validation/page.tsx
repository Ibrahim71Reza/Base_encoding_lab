import ValidationTool from "@/components/ValidationTool";

export const metadata = {
  title: "Validation and test vectors — BaseForge",
  description: "Run browser-side test vectors for BaseForge official and reference base encoding implementations."
};

export default function ValidationPage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Trust center</div>
            <h1>Validation and test vectors.</h1>
            <p>Run the same examples shown in the catalog against the live client-side engines. This helps users verify that outputs are stable in their browser.</p>
          </div>
          <div className="notice">
            <h2>Standards-first promise</h2>
            <p>Official standards are implemented as named variants. Experimental encodings are marked as reference-package based instead of being presented as universal standards.</p>
          </div>
        </div>
      </section>
      <section className="section"><div className="container"><ValidationTool /></div></section>
    </main>
  );
}
