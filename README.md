# Markdown File Previewer

A web-based tool that lets you preview Markdown files rendered as HTML directly in your browser. Upload a file, drag and drop, or type Markdown live — with syntax highlighting, theming, formatting toolbar, and much more.

## Features

### Core
- **File Upload** — Select `.md` files via a file picker to render them as HTML using `marked.js`
- **Drag & Drop** — Drag `.md` files onto the drop zone with visual feedback
- **Live Editor** — Type or paste Markdown in a side-by-side editor with real-time preview
- **Syntax Highlighting** — Fenced code blocks are highlighted with `highlight.js` (language-specific and auto-detected)
- **Dark/Light Theme** — Toggle between dark and light themes; preference is saved in `localStorage`
- **Export to PDF** — Export the rendered preview as a PDF via the browser's print dialog

### Editor
- **Formatting Toolbar** — Buttons for Bold, Italic, Heading, Link, Image, Inline Code, Code Block, Lists, Blockquote, and Horizontal Rule. Inserts syntax at cursor or wraps selected text
- **Multiple File Tabs** — Open and switch between multiple Markdown files with a tab bar. Each tab preserves its own content independently
- **Word & Character Count** — Live word and character count displayed in a status bar below the editor
- **Search & Replace** — Find text with match count and navigation, replace individually or all at once, with a case-sensitivity toggle. Open with `Ctrl/Cmd+F` (find) or `Ctrl/Cmd+H` (replace)

### View
- **Scroll Sync** — Synchronized scrolling between the editor and preview panes, with a toggle button to enable/disable
- **Full-Screen Mode** — Expand the editor or preview to fill the viewport for distraction-free writing. Exit with `Escape`

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + Shift + C` | Inline code |
| `Ctrl/Cmd + F` | Find |
| `Ctrl/Cmd + H` | Find & Replace |
| `Ctrl/Cmd + S` | Download file |
| `Ctrl/Cmd + Shift + F` | Toggle full-screen |
| `Ctrl/Cmd + /` | Show keyboard shortcuts |
| `Escape` | Exit full-screen / close dialogs |

### Design & Accessibility
- **Modern UI** — CSS custom properties design system with 8px spacing grid, polished buttons, panels, and shadows
- **Responsive Design** — Mobile-friendly layout with proper breakpoints
- **Accessibility** — Semantic HTML, ARIA labels, keyboard-navigable controls, focus indicators, and `prefers-reduced-motion` support
- **Error Handling** — User-friendly error banner if CDN libraries fail to load

## Usage

1. Open `index.html` in your browser
2. Upload a `.md` file using the file picker or drag and drop it onto the drop zone
3. Alternatively, type or paste Markdown directly into the editor on the left
4. The rendered preview updates in real-time on the right
5. Use the toolbar or keyboard shortcuts to format text
6. Press `Ctrl/Cmd + /` to view all keyboard shortcuts

## Tech Stack

- [marked.js](https://github.com/markedjs/marked) — Markdown to HTML parsing
- [highlight.js](https://highlightjs.org/) — Syntax highlighting for code blocks
- Vanilla HTML, CSS, and JavaScript — no build tools required
