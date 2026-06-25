import DetectTool from "@/components/DetectTool";

export const metadata = {
  title: "Detect possible base encoding — BaseForge",
  description: "Guess whether input may be Base64, Base32, Hex, Base58, Base85, Base91 or another base encoding."
};

export default function DetectPage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Decoder assistant</div>
            <h1>Detect possible base encodings.</h1>
            <p>Paste an unknown encoded string and get ranked candidates. The detector uses alphabet checks and round-trip validation where practical.</p>
          </div>
          <div className="notice">
            <h2>Honest detection</h2>
            <p>Detection can never be perfect because many encodings share the same characters. BaseForge labels results as possible matches, not guaranteed facts.</p>
          </div>
        </div>
      </section>
      <section className="section"><div className="container"><DetectTool /></div></section>
    </main>
  );
}
