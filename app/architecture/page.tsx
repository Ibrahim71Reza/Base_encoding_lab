export const metadata = {
  title: "Client-side architecture — BaseForge",
  description: "How BaseForge stays fully static, client-side, and safe to host on Vercel static export."
};

export default function ArchitecturePage() {
  return (
    <main className="section">
      <div className="container">
        <div className="eyebrow">Architecture</div>
        <h1>Static website. Browser-only computation.</h1>
        <div className="grid">
          <div className="card"><h2>No server compute</h2><p>No API routes, no server actions, no middleware, no database, and no background jobs. Vercel serves static assets only.</p></div>
          <div className="card"><h2>Uint8Array core</h2><p>Every encoder works from byte arrays, not unsafe binary strings. Text input is converted with TextEncoder and decoded with TextDecoder.</p></div>
          <div className="card"><h2>Variant honesty</h2><p>Official standards, stable specifications, de facto formats, and experimental references are separated so users do not confuse similar-looking encodings.</p></div>
        </div>
        <section className="section card">
          <h2>Deploy rule</h2>
          <pre className="pre"><code>{`// next.config.ts
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true }
};`}</code></pre>
          <p>The build output is the <span className="code">out/</span> directory. Host it as static files on Vercel or any static web host.</p>
        </section>
      </div>
    </main>
  );
}
