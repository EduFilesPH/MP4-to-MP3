# MP4 to MP3

A browser-based MP4/video to MP3 converter built with Vite and ffmpeg.wasm.

## Live app

https://mp4-to-mp3-chi.vercel.app

## Privacy

Media conversion happens client-side in the user's browser. Selected media files are not uploaded to this app.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The FFmpeg WebAssembly core is bundled into the production build and served from the same origin as the app, avoiding runtime CDN dependency.

Use only media you own or have permission to convert.
