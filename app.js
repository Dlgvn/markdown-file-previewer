(function () {
    'use strict';

    // Check that required libraries loaded
    if (typeof marked === 'undefined' || typeof hljs === 'undefined') {
        var container = document.querySelector('.container');
        var banner = document.createElement('div');
        banner.className = 'error-banner';
        banner.textContent = 'Failed to load required libraries (marked.js / highlight.js). Please check your internet connection and refresh.';
        container.insertBefore(banner, container.firstChild);
        return;
    }

    var fileInput = document.getElementById('file-input');
    var editor = document.getElementById('editor');
    var preview = document.getElementById('preview');
    var themeToggle = document.getElementById('theme-toggle');
    var hljsTheme = document.getElementById('hljs-theme');
    var dropZone = document.getElementById('drop-zone');

    // Theme
    function setTheme(dark) {
        document.body.classList.toggle('dark', dark);
        themeToggle.querySelector('span').textContent = dark ? 'Light' : 'Dark';
        hljsTheme.href = dark
            ? 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css'
            : 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css';
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', function () {
        setTheme(!document.body.classList.contains('dark'));
    });

    setTheme(localStorage.getItem('theme') === 'dark');

    // Export PDF
    document.getElementById('export-pdf').addEventListener('click', function () {
        var printWindow = window.open('', '_blank');
        printWindow.document.write('<!DOCTYPE html><html><head><title>Markdown Preview</title>');
        printWindow.document.write('<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:2rem;color:#333}pre{background:#f0f0f0;padding:1em;border-radius:6px;overflow-x:auto}code{background:#f0f0f0;padding:0.15em 0.4em;border-radius:3px;font-size:0.9em}pre code{background:none;padding:0}blockquote{border-left:4px solid #ddd;padding-left:1em;color:#666}img{max-width:100%;height:auto}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(preview.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });

    // Markdown rendering
    marked.setOptions({
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        }
    });

    function renderPreview() {
        preview.innerHTML = marked.parse(editor.value);
    }

    editor.addEventListener('input', renderPreview);

    // File loading
    function loadFile(file) {
        if (!file || !file.name.endsWith('.md')) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            editor.value = e.target.result;
            renderPreview();
        };
        reader.readAsText(file);
    }

    fileInput.addEventListener('change', function (event) {
        loadFile(event.target.files[0]);
    });

    // Drag and drop
    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        loadFile(e.dataTransfer.files[0]);
    });

    // Keyboard accessibility
    dropZone.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    document.querySelector('.file-input-label').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });
})();
