<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:000000,100:333333&height=200&section=header&text=Ultimate%20Base%20Lab&fontSize=70&fontAlignY=35&animation=twinkling&fontColor=ffffff" alt="Ultimate Base Lab Banner" width="100%">

**A standards-first, privacy-focused, client-side base encoding and decoding lab.**

[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg?style=for-the-badge)](#)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tests](https://img.shields.io/badge/Tests-Passed-success.svg?style=for-the-badge)](#)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-black.svg?style=for-the-badge&logo=vercel)](#)

</div>

---

> [!IMPORTANT]
>
> ## 100% Client-Side and Privacy-Focused
>
> Ultimate Base Lab runs entirely inside the user's browser.
>
> • No text is sent to a server.  
> • No files are uploaded to a backend.  
> • No database is used.  
> • No API routes are used.  
> • No Server Actions are used.  
> • No backend encoding or decoding is performed.  
>
> All encoding and decoding happens locally using JavaScript and `Uint8Array` byte handling.

---

## What Is Ultimate Base Lab?

**Ultimate Base Lab v1** is an all-in-one base encoding and decoding website built for developers, cybersecurity learners, CTF players, data engineers, students, and technical users.

The goal is simple:

> Provide a trustworthy base encoding lab where official standards are clearly separated from de facto, reference, and experimental encodings.

The interface is designed to stay simple. A new user can paste text, choose an encoding, encode or decode, and copy the result without needing deep technical knowledge.

---

## Quick Start

```powershell
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd Base_encoding_lab
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

To test everything:

```powershell
npm run test:all
```

To build for production:

```powershell
npm run build
```

---

## Main Features

| Core Tools                     | Advanced Tools             | Trust and SEO                 |
| :----------------------------- | :------------------------- | :---------------------------- |
| Encode and decode base formats | Magic decoder              | Standards page                |
| Clean single-page lab UI       | Possible encoding detector | Validation page               |
| Quick encoding search          | Compare encodings          | Individual encoding pages     |
| Encode / Decode toggle         | Custom base alphabet tool  | Architecture page             |
| Copy output                    | Share link                 | Static/SSG pages              |
| Download output                | Share code import/export   | PWA-ready files               |
| File encoding in browser       | Output text/hex switch     | Official/reference test suite |

---

## Supported Encoding Groups

Ultimate Base Lab separates encodings by trust/status so users know exactly what they are using.

### Official Standards

These encodings are based on official standards such as RFCs.

| Encoding                            | Reference |
| :---------------------------------- | :-------- |
| Base16 / Hex                        | RFC 4648  |
| Base32                              | RFC 4648  |
| Base32hex                           | RFC 4648  |
| Base64                              | RFC 4648  |
| Base64url                           | RFC 4648  |
| Base45                              | RFC 9285  |
| MIME Base64                         | RFC 2045  |
| PEM Base64 body                     | RFC 7468  |
| Base64url no-padding / JOSE profile | RFC 7515  |
| RFC1924 IPv6 Base85                 | RFC 1924  |

### Stable Specification

| Encoding | Reference                |
| :------- | :----------------------- |
| Z85      | ZeroMQ Z85 specification |

### De Facto / Publicly Used Formats

| Encoding         | Common Use                        |
| :--------------- | :-------------------------------- |
| Base58BTC        | Bitcoin/IPFS-style ecosystems     |
| Base58Flickr     | Flickr-style Base58 alphabet      |
| Base58Check      | Bitcoin-style checksummed Base58  |
| Base36           | Short IDs and alphanumeric values |
| Base62           | Short URLs and public IDs         |
| Ascii85          | Legacy binary-to-text encoding    |
| Adobe Ascii85    | Adobe/PDF-style Ascii85 variant   |
| Crockford Base32 | Human-friendly Base32             |
| z-base-32        | Human-oriented Base32 variant     |

### Published / Experimental References

These are included for rare users and technical exploration. They are clearly labeled so users do not confuse them with official RFC standards.

| Encoding  | Status                                   |
| :-------- | :--------------------------------------- |
| Base91    | Published/reference-style implementation |
| Base2048  | Experimental Unicode-based encoding      |
| Base32768 | Experimental Unicode-based encoding      |
| Base65536 | Experimental Unicode-based encoding      |

---

## Included Pages and Tools

### Main Lab
The homepage is the main encoder/decoder workspace. Search, encode, decode, switch outputs, and download files.

### Compare Tool
Enter one input and compare outputs across multiple encodings. Perfect for CTF players and debugging.

### Detect Tool
Guesses possible matching encodings based on input alphabets.
> [!NOTE]
> **Detection is best-effort, not guaranteed.** Many encodings share similar alphabets.

### Custom Base Tool
Test custom alphabets and custom radix-style conversions.

### Standards & Validation Pages
Explains which encodings are official and publicly verifies their accuracy against known test vectors.

---

## Project Structure

```txt
app/
  architecture/      # Architecture documentation
  compare/           # Compare tool UI
  custom-base/       # Custom alphabet testing
  detect/            # Encoding detection logic
  encodings/         # Individual SEO pages
  standards/         # Standards reference page
  validation/        # Public test vectors page

components/          # Reusable UI elements (MainLab, Panels, etc.)
lib/                 # Core client-side logic
  bytes.ts           # Uint8Array handlers
  encodings/         # Encoding engine (Base64, Base58, etc.)
tests/               # Jest/Vitest test suites
public/              # Static PWA assets (manifest, robots)
```

---

## Development Rules

When contributing or modifying encodings, please follow these guidelines:

1. **Use official standards** when available. Do not invent outputs.
2. **Do not mix variants.** (e.g., MIME Base64 and standard Base64 are separate).
3. **Use `Uint8Array` internally.** Do not use normal strings for raw binary data.
4. **Keep processing client-side.** No API routes, Server Actions, or databases.
5. **Always add test vectors** when adding a new encoding.

---

## Vercel Deployment

Ultimate Base Lab is perfectly suited for Vercel's static hosting because encoding happens entirely in the browser.

1. Push your code to GitHub.
2. Go to Vercel and click **Add New Project**.
3. Import the GitHub repository.
4. Keep the Framework Preset as **Next.js**.
5. Deploy.

*Normal users encoding and decoding text or files will not create backend compute load.*

---

## Troubleshooting

### Windows `.next` build lock error
If you see `EBUSY: resource busy or locked` during build on Windows, clear the Next.js cache:
```powershell
taskkill /F /IM node.exe /T
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
npm run build
```

### Share / Clipboard features failing
On localhost, some browsers may block clipboard or share API features. These work reliably once deployed to HTTPS.

---

## License

This project is licensed under the **MIT License**.

<div align="center">

**Ultimate Base Lab v1 — Built for speed, privacy, and accuracy.**

</div>
