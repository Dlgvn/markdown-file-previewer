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
        updateWordCount();
    }

    // Word and character count
    var wordCountEl = document.getElementById('word-count');
    var charCountEl = document.getElementById('char-count');

    function updateWordCount() {
        var text = editor.value.trim();
        var words = text ? text.split(/\s+/).length : 0;
        var chars = editor.value.length;
        wordCountEl.textContent = words + (words === 1 ? ' word' : ' words');
        charCountEl.textContent = chars + (chars === 1 ? ' character' : ' characters');
    }

    editor.addEventListener('input', renderPreview);

    // Toolbar formatting
    function insertAtCursor(before, after, defaultText) {
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var selected = editor.value.substring(start, end);
        var text = selected || defaultText || '';
        var replacement = before + text + (after || '');
        editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
        // Place cursor: select the inserted text (not the wrappers)
        editor.selectionStart = start + before.length;
        editor.selectionEnd = start + before.length + text.length;
        editor.focus();
        renderPreview();
    }

    function insertLinePrefix(prefix) {
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var val = editor.value;
        // Find the start of the current line
        var lineStart = val.lastIndexOf('\n', start - 1) + 1;
        var selectedLines = val.substring(lineStart, end);
        var lines = selectedLines.split('\n');
        var result = lines.map(function (line) { return prefix + line; }).join('\n');
        editor.value = val.substring(0, lineStart) + result + val.substring(end);
        editor.selectionStart = lineStart;
        editor.selectionEnd = lineStart + result.length;
        editor.focus();
        renderPreview();
    }

    var toolbarActions = {
        bold: function () { insertAtCursor('**', '**', 'bold text'); },
        italic: function () { insertAtCursor('*', '*', 'italic text'); },
        heading: function () { insertLinePrefix('## '); },
        link: function () { insertAtCursor('[', '](url)', 'link text'); },
        image: function () { insertAtCursor('![', '](url)', 'alt text'); },
        code: function () { insertAtCursor('`', '`', 'code'); },
        codeblock: function () { insertAtCursor('\n```\n', '\n```\n', 'code'); },
        ul: function () { insertLinePrefix('- '); },
        ol: function () {
            var start = editor.selectionStart;
            var end = editor.selectionEnd;
            var val = editor.value;
            var lineStart = val.lastIndexOf('\n', start - 1) + 1;
            var selectedLines = val.substring(lineStart, end);
            var lines = selectedLines.split('\n');
            var result = lines.map(function (line, i) { return (i + 1) + '. ' + line; }).join('\n');
            editor.value = val.substring(0, lineStart) + result + val.substring(end);
            editor.selectionStart = lineStart;
            editor.selectionEnd = lineStart + result.length;
            editor.focus();
            renderPreview();
        },
        blockquote: function () { insertLinePrefix('> '); },
        hr: function () { insertAtCursor('\n---\n', '', ''); }
    };

    document.querySelector('.toolbar').addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-action]');
        if (!btn) return;
        var action = toolbarActions[btn.dataset.action];
        if (action) action();
    });

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

    // Scroll sync
    var scrollSyncToggle = document.getElementById('scroll-sync-toggle');
    var scrollSyncEnabled = true;
    var isScrolling = false;

    scrollSyncToggle.addEventListener('click', function () {
        scrollSyncEnabled = !scrollSyncEnabled;
        scrollSyncToggle.classList.toggle('active', scrollSyncEnabled);
    });

    editor.addEventListener('scroll', function () {
        if (!scrollSyncEnabled || isScrolling) return;
        isScrolling = true;
        var ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
        preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
        isScrolling = false;
    });

    preview.addEventListener('scroll', function () {
        if (!scrollSyncEnabled || isScrolling) return;
        isScrolling = true;
        var ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
        editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
        isScrolling = false;
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
