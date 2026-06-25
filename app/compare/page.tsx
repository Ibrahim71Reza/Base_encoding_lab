import CompareTool from "@/components/CompareTool";

export const metadata = {
  title: "Compare base encodings — BaseForge",
  description: "Compare Base64, Base32, Base58, Base85, Base91, Base65536 and other encodings locally in the browser."
};

export default function ComparePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Comparison lab</div>
            <h1>Compare encodings side by side.</h1>
            <p>Enter bytes once and see character length, UTF-8 storage size, and output across recommended official, de facto, and rare encodings.</p>
          </div>
          <div className="notice">
            <h2>Why this matters</h2>
            <p>Unicode encodings such as Base65536 can look shorter by visible character count while using more UTF-8 bytes. This page makes that visible.</p>
          </div>
        </div>
      </section>
      <section className="section"><div className="container"><CompareTool /></div></section>
    </main>
  );
}
