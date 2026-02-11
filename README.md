# KinyaFresh

KinyaFresh is a small, static web app for learning basic Kinyarwanda vocabulary. It shows word cards with an image, meaning, example sentence, and optional audio pronunciation. There's also a simple ABCs image gallery.

## Features
- Learn view: interactive word cards rendered from .
- Audio playback for words that include an audio file.
- ABCs gallery with single-image and grid views.

## Quick start
1. Open [index.html](index.html) in a web browser (no server required for local testing).
2. The main UI is implemented in [app.js](app.js); words come from [words.json](words.json).
3. ABCs gallery is available at [ABCs/ABCs.html](ABCs/ABCs.html) and driven by [ABCs/ABCs.js](ABCs/ABCs.js).

## Project structure
- index.html — main app UI ([styles.css](styles.css), [app.js](app.js))
- words.json — vocabulary data (images in /images, audio in /Audio)
- ABCs/ — image gallery (ABCs.html, ABCs.js, ABCs.css)
- images/, Audio/ — media assets

## Notes for contributors
- To update vocabulary, edit [words.json](words.json). The app uses the `words` array in [app.js](app.js) and the rendering function [`showLearn`](app.js).
- ABCs gallery navigation is implemented in [`renderSingle`](ABCs/ABCs.js) and related handlers.
