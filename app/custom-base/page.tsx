import CustomBaseTool from "@/components/CustomBaseTool";

export const metadata = {
  title: "Custom Base Converter — BaseForge",
  description: "Create a browser-only custom base encoder/decoder with your own unique alphabet."
};

export default function CustomBasePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Custom base laboratory</div>
            <h1>Build a custom alphabet encoder.</h1>
            <p>
              This tool is intentionally separated from official standards. It is useful for custom IDs, experiments,
              and education, but official encodings should use the catalog pages.
            </p>
          </div>
          <div className="notice">
            <h2>Important distinction</h2>
            <p>
              Custom radix conversion is not the same as an RFC-defined binary-to-text standard. For public protocols,
              tokens, certificates, QR codes, or crypto addresses, use the official variant page.
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <CustomBaseTool />
        </div>
      </section>
    </main>
  );
}
