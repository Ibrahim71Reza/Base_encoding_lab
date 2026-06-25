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
cd D:\Base_encoding_lab
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

The homepage is the main encoder/decoder workspace.

Users can:

```txt
Search encodings
Pick an encoding
Encode text
Decode encoded data
Switch output between text and hex
Copy output
Download output
Load examples
View compact format details
```

### Compare Tool

The compare page lets users enter one input and compare outputs across multiple encodings.

Useful for:

```txt
Developers
Students
Cybersecurity learners
CTF users
Debugging encoding differences
```

### Detect Tool

The detector guesses possible matching encodings.

> [!NOTE]
> **Detection is best-effort, not guaranteed.** Many encodings share similar alphabets, so the app shows possible matches instead of pretending to know with 100% certainty.

### Custom Base Tool

The custom base tool lets users test custom alphabets and custom radix-style conversions.

Useful for:

```txt
Custom alphabets
Educational experiments
Alphabet validation
Rare/custom base systems
```

### Standards Page

The standards page explains which encodings are official standards and which are de facto, reference, or experimental.

### Validation Page

The validation page shows known test vectors and helps prove that official encodings are implemented correctly.

---

## Tech Stack

```txt
Next.js
TypeScript
React
Client-side JavaScript
Static export / static rendering
```

The app is designed as a browser-side/static project. It does not require a Node.js server for users to encode or decode data.

---

## Requirements

Recommended:

```txt
Node.js 20 or newer
npm
Git
```

Check versions:

```powershell
node -v
npm -v
git --version
```

---

## Installation

Open PowerShell and go to the project folder:

```powershell
cd D:\Base_encoding_lab
```

Set npm to use the public npm registry:

```powershell
npm config set registry https://registry.npmjs.org/
```

Install dependencies:

```powershell
npm install
```

---

## Development Server

Run:

```powershell
npm run dev
```

Open:

```txt
http://localhost:3000
```

Stop the server with:

```txt
Ctrl + C
```

---

## Testing and Verification

Run basic encoder tests:

```powershell
npm run test:encoders
```

Run full verification tests:

```powershell
npm run test:full
```

Run all tests:

```powershell
npm run test:all
```

Expected output:

```txt
All encoder tests passed.
All full verification tests passed.
```

The full test checks official and public reference vectors, including:

```txt
RFC 4648 Base16
RFC 4648 Base32
RFC 4648 Base32hex
RFC 4648 Base64
RFC 4648 Base64url
RFC 9285 Base45
ZeroMQ Z85
RFC 1924 IPv6 Base85
Base58BTC public reference
Round-trip checks for all loaded encodings
```

Current verified summary:

```txt
25 encoding specifications
10 official standard profiles
8 de facto standard profiles
3 published reference profiles
1 stable specification profile
3 experimental reference profiles
```

---

## Production Build

Run:

```powershell
npm run build
```

A successful build should show static/SSG output similar to:

```txt
○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML
```

This means the website is ready for static/client-side deployment.

---

## Vercel Deployment

Ultimate Base Lab is suitable for Vercel because encoding and decoding happen in the browser.

Deployment steps:

```txt
1. Push the project to GitHub.
2. Go to Vercel.
3. Click Add New Project.
4. Import the GitHub repository.
5. Keep Framework Preset as Next.js.
6. Install command: npm install
7. Build command: npm run build
8. Deploy.
```

Normal users encoding and decoding text or files will not create backend function load because there are no API routes or server-side encoding operations.

---

## GitHub Upload Guide

Before pushing, make sure these folders are not uploaded:

```txt
node_modules
.next
out
```

They should be ignored by `.gitignore`.

Initialize Git:

```powershell
cd D:\Base_encoding_lab
git init
git add .
git commit -m "Initial release of Ultimate Base Lab v1"
```

Connect to GitHub:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

Replace:

```txt
YOUR_USERNAME
YOUR_REPOSITORY_NAME
```

with your actual GitHub username and repository name.

---

## Recommended `.gitignore`

```gitignore
# Dependencies
node_modules/

# Next.js build output
.next/
out/

# Vercel
.vercel/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
*.log

# OS files
.DS_Store
Thumbs.db
desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo

# TypeScript cache
*.tsbuildinfo

# Optional coverage output
coverage/

# Temporary files
tmp/
temp/
.cache/
```

---

## Project Structure

```txt
app/
  architecture/
  compare/
  custom-base/
  detect/
  encodings/
  standards/
  validation/
  layout.tsx
  page.tsx

components/
  MainLab.tsx
  EncodingSelector.tsx
  OutputPanel.tsx
  ShareTools.tsx

lib/
  bytes.ts
  encodings/
    registry.ts
    types.ts
    base16.ts
    base32.ts
    base45.ts
    base58.ts
    base64.ts
    base85.ts
    base91.ts
    customBase.ts

tests/
  encoders.test.ts
  full.test.ts

public/
  manifest.json
  robots.txt
```

---

## Development Rules

When adding or changing encodings:

```txt
Use official standards when available.
Do not invent outputs.
Do not mix different variants under one name.
Clearly label de facto and experimental encodings.
Add test vectors when available.
Use Uint8Array internally.
Do not use normal strings for raw binary data.
Keep processing client-side.
Do not add API routes.
Do not add Server Actions.
Do not add database dependency.
```

Example:

```txt
Base64 RFC 4648
Base64url RFC 4648
MIME Base64 RFC 2045
PEM Base64 RFC 7468
```

These should stay separate because their formatting rules are different.

---

## How to Add a New Encoding

1. Add the encoder/decoder engine inside:

```txt
lib/encodings/
```

2. Add the spec to:

```txt
lib/encodings/registry.ts
```

3. Include metadata:

```txt
Name
Short name
Status
Standard/source
Alphabet
Padding rule
Canonical rules
Example input
Example output
```

4. Add tests inside:

```txt
tests/encoders.test.ts
tests/full.test.ts
```

5. Run:

```powershell
npm run test:all
npm run build
```

Only release the encoding after tests pass.

---

## Share Feature Notes

The app includes:

```txt
Share link
Copy share code
Import share code
```

On localhost, some browsers may block clipboard/share features depending on browser permissions.

On HTTPS deployment, share and clipboard behavior usually works better.

Even if automatic share is blocked, the visible share code and share link can still be copied manually.

---

## Troubleshooting

### `tsx is not recognized`

Run:

```powershell
npm install
```

Then run the test again.

### npm uses the wrong registry

Run:

```powershell
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

### Windows `.next` build lock error

If you see:

```txt
EBUSY: resource busy or locked
```

Run:

```powershell
taskkill /F /IM node.exe /T
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
npm run build
```

If `node.exe not found` appears, that is okay. It only means no Node process was running.

### Old favicon still showing

Browsers cache favicons strongly.

Try:

```txt
Ctrl + F5
Incognito mode
Clear browser cache
```

---

## Version Rule

This project is currently:

```txt
Ultimate Base Lab v1
```

Keep the public version as `v1` until the first real GitHub/Vercel launch is complete.

Private/internal improvements can be made without changing the public version number.

---

## Final Launch Checklist

Before public launch, run:

```powershell
npm install
npm run test:all
npm run build
```

Then confirm:

```txt
Tests passed
Build passed
GitHub repo pushed
Vercel deployment successful
Share link works on HTTPS
Favicon updated
README updated
No private files uploaded
```

---

## License

Recommended license:

```txt
MIT License
```

If you use MIT, add a `LICENSE` file to the repository before public release.

---

<div align="center">

**Ultimate Base Lab v1 — Built for speed, privacy, and accuracy.**

</div>