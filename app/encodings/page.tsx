import EncodingCard from "@/components/EncodingCard";
import { categories, encodingSpecs } from "@/lib/encodings/registry";

export const metadata = {
  title: "Encoding catalog — BaseForge",
  description: "Browse official, stable, de facto, and rare reference base encoding systems."
};

export default function EncodingsPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="eyebrow">Encoding catalog</div>
        <h1>Standards, variants, and rare encodings.</h1>
        <p>
          The catalog separates official standards from de facto and experimental formats so users know exactly which
          variant they are using.
        </p>
        {categories.map((category) => (
          <section className="section" key={category}>
            <h2>{category}</h2>
            <div className="grid">
              {encodingSpecs.filter((item) => item.category === category).map((spec) => <EncodingCard key={spec.id} spec={spec} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
