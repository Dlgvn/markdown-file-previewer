# Markdown File Previewer

A web-based tool that lets you preview Markdown files rendered as HTML directly in your browser. Upload a file, drag and drop, or type Markdown live — with syntax highlighting, theming, and PDF export.

## Features

- **File Upload** — Select `.md` files via a file picker to render them as HTML using `marked.js`
- **Drag & Drop** — Drag `.md` files onto the drop zone with visual feedback (blue highlight)
- **Live Editor** — Type or paste Markdown in a side-by-side editor with real-time preview
- **Syntax Highlighting** — Fenced code blocks are highlighted with `highlight.js` (language-specific and auto-detected)
- **Dark/Light Theme** — Toggle between dark and light themes; preference is saved in `localStorage`
- **Export to PDF** — Export the rendered preview as a PDF via the browser's print dialog
- **Responsive Design** — Clean typography, centered layout, and mobile-friendly breakpoints

## Usage

1. Open `index.html` in your browser
2. Upload a `.md` file using the file picker or drag and drop it onto the drop zone
3. Alternatively, type or paste Markdown directly into the editor on the left
4. The rendered preview updates in real-time on the right

## Tech Stack

- [marked.js](https://github.com/markedjs/marked) — Markdown to HTML parsing
- [highlight.js](https://highlightjs.org/) — Syntax highlighting for code blocks
- Vanilla HTML, CSS, and JavaScript — no build tools required
