# Windows Install Guide

Open PowerShell inside the project folder.

## 1. Use the public npm registry

```powershell
npm config set registry https://registry.npmjs.org/
npm cache clean --force
```

## 2. Clean old install files if you copied over an older ZIP

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
```

## 3. Install dependencies

```powershell
npm install
```

## 4. Run locally

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. Run encoder tests

```powershell
npm run test:encoders
```

## 6. Static production build

```powershell
npm run build
```

The exported static site will be inside:

```text
out/
```

## Notes

If you see `'tsx' is not recognized`, it means `npm install` did not finish successfully. Run the install command again after fixing internet or registry issues.
