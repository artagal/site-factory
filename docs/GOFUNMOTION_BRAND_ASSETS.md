# GoFunMotion Brand Assets

Generated on 2026-06-01 with `scripts/generate-gofunmotion-assets.py`.

## Web Assets

- Brand mark SVG: `apps/website/public/brand/gofunmotion-mark.svg`
- Wordmark SVG: `apps/website/public/brand/gofunmotion-wordmark.svg`
- Static splash PNG: `apps/website/public/brand/gofunmotion-splash.png`
- Animated splash GIF: `apps/website/public/brand/gofunmotion-splash-motion.gif`
- Splash GIF preview PNG: `apps/website/public/brand/gofunmotion-splash-motion-preview.png`
- OG image: `apps/website/public/og/gofunmotion-og.png`
- Favicon: `apps/website/public/favicon.ico`
- Apple touch icon: `apps/website/public/apple-touch-icon.png`
- PWA icons: `apps/website/public/icon-192.png`, `apps/website/public/icon-512.png`, `apps/website/public/maskable-icon-512.png`
- Full icon set: `apps/website/public/icons/gofunmotion-icon-*.png`

## FlutterFlow Assets

Mirrored files for FlutterFlow Builder upload/use:

- App icon: `gofunmotion-ffai/assets/brand/gofunmotion-app-icon-1024.png`
- Maskable icon: `gofunmotion-ffai/assets/brand/gofunmotion-maskable-icon-512.png`
- Static splash: `gofunmotion-ffai/assets/brand/gofunmotion-splash.png`
- Animated splash GIF: `gofunmotion-ffai/assets/brand/gofunmotion-splash-motion.gif`
- Brand mark: `gofunmotion-ffai/assets/brand/gofunmotion-mark.svg`
- OG/reference image: `gofunmotion-ffai/assets/brand/gofunmotion-og.png`

## Usage Notes

- The website metadata, PWA manifest, favicon, Apple icon, and navbar mark now point at the generated assets.
- FlutterFlow commit `0LmSN7gNC3FeveuF3USY` adds `SplashPage` as the initial page. It uses `gofunmotion-splash-motion.gif`, waits briefly, then routes to `DiscoverPage`.
- Native app launch splash screens usually require static images, so `gofunmotion-splash.png` is configured for the native splash image path while the GIF is used for the Builder-native animated intro page.
- Regenerate the full pack with:

```powershell
& 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\generate-gofunmotion-assets.py
```
