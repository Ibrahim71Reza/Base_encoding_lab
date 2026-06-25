# Ultimate Base Lab v1 Verification

This project includes two encoder test commands:

```bash
npm run test:encoders
npm run test:full
```

## Latest verification result

- `npm run test:encoders`: passed
- `npm run test:full`: passed
- `npm run build`: passed

Full verification currently checks:

- 25 encoding specifications
- 10 official standard profiles
- 8 de facto standard profiles
- 3 published reference profiles
- 1 stable specification profile
- 3 experimental reference profiles
- 77 round-trip/example checks

## Important fix included

Base45 was corrected so that a literal space inside encoded Base45 data is preserved. This matters because RFC 9285 Base45 includes space in the official alphabet. The decoder now ignores line breaks/tabs for copied wrapped text, but it does not strip spaces.

## Trust model

- Official standards are labeled as official standards only when backed by RFC or stable spec text.
- De facto formats are labeled as de facto, not official.
- Rare Unicode formats are labeled experimental/reference and use their public reference npm packages.
