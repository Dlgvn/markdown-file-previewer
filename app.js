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

    // Tab management
    var tabBar = document.getElementById('tab-bar');
    var tabNewBtn = document.getElementById('tab-new');
    var tabs = [];
    var activeTabId = null;
    var nextTabId = 1;

    function createTab(name, content) {
        var tab = { id: nextTabId++, name: name || 'Untitled', content: content || '' };
        tabs.push(tab);
        renderTabs();
        switchTab(tab.id);
        return tab;
    }

    function switchTab(id) {
        // Save current tab content
        if (activeTabId !== null) {
            var current = tabs.find(function (t) { return t.id === activeTabId; });
            if (current) current.content = editor.value;
        }
        activeTabId = id;
        var tab = tabs.find(function (t) { return t.id === id; });
        if (tab) {
            editor.value = tab.content;
            renderPreview();
        }
        renderTabs();
    }

    function closeTab(id) {
        if (tabs.length <= 1) return; // keep at least one tab
        var idx = tabs.findIndex(function (t) { return t.id === id; });
        if (idx === -1) return;
        tabs.splice(idx, 1);
        if (activeTabId === id) {
            var newIdx = Math.min(idx, tabs.length - 1);
            switchTab(tabs[newIdx].id);
        }
        renderTabs();
    }

    function renderTabs() {
        // Remove all tab elements except the + button
        var existing = tabBar.querySelectorAll('.tab');
        existing.forEach(function (el) { el.remove(); });

        tabs.forEach(function (tab) {
            var el = document.createElement('button');
            el.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
            el.type = 'button';
            el.setAttribute('role', 'tab');
            el.setAttribute('aria-selected', tab.id === activeTabId ? 'true' : 'false');

            var nameSpan = document.createElement('span');
            nameSpan.className = 'tab-name';
            nameSpan.textContent = tab.name;
            el.appendChild(nameSpan);

            if (tabs.length > 1) {
                var closeBtn = document.createElement('span');
                closeBtn.className = 'tab-close';
                closeBtn.textContent = '\u00d7';
                closeBtn.title = 'Close tab';
                closeBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    closeTab(tab.id);
                });
                el.appendChild(closeBtn);
            }

            el.addEventListener('click', function () { switchTab(tab.id); });
            tabBar.insertBefore(el, tabNewBtn);
        });
    }

    tabNewBtn.addEventListener('click', function () {
        createTab();
    });

    // Create initial tab
    createTab('Untitled', '');

    // File loading
    function loadFile(file) {
        if (!file || !file.name.endsWith('.md')) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            createTab(file.name, e.target.result);
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

    // Fullscreen mode
    var editorLayout = document.getElementById('editor-layout');
    var editorPanel = document.getElementById('editor-panel');
    var previewPanel = document.getElementById('preview-panel');
    var fullscreenTarget = null;

    function toggleFullscreen(target) {
        if (fullscreenTarget === target) {
            // Exit fullscreen
            editorLayout.classList.remove('fullscreen-editor', 'fullscreen-preview');
            fullscreenTarget = null;
        } else {
            editorLayout.classList.remove('fullscreen-editor', 'fullscreen-preview');
            if (target === 'editor') {
                editorLayout.classList.add('fullscreen-editor');
            } else {
                editorLayout.classList.add('fullscreen-preview');
            }
            fullscreenTarget = target;
        }
    }

    document.querySelectorAll('.fullscreen-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            toggleFullscreen(btn.dataset.target);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && fullscreenTarget) {
            toggleFullscreen(fullscreenTarget);
        }
    });

    // Search and replace
    var searchBar = document.getElementById('search-bar');
    var searchInput = document.getElementById('search-input');
    var replaceInput = document.getElementById('replace-input');
    var searchCount = document.getElementById('search-count');
    var searchCase = document.getElementById('search-case');
    var searchMatches = [];
    var currentMatchIdx = -1;

    function openSearch() {
        searchBar.style.display = '';
        searchInput.focus();
        searchInput.select();
    }

    function closeSearch() {
        searchBar.style.display = 'none';
        searchMatches = [];
        currentMatchIdx = -1;
        searchCount.textContent = '';
        editor.focus();
    }

    function findMatches() {
        var query = searchInput.value;
        if (!query) {
            searchMatches = [];
            currentMatchIdx = -1;
            searchCount.textContent = '';
            return;
        }
        var text = editor.value;
        var caseSensitive = searchCase.checked;
        var flags = caseSensitive ? 'g' : 'gi';
        var regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        searchMatches = [];
        var match;
        while ((match = regex.exec(text)) !== null) {
            searchMatches.push({ start: match.index, end: match.index + match[0].length });
        }
        if (searchMatches.length > 0) {
            currentMatchIdx = 0;
            highlightMatch();
        } else {
            currentMatchIdx = -1;
        }
        updateSearchCount();
    }

    function updateSearchCount() {
        if (searchMatches.length === 0 && searchInput.value) {
            searchCount.textContent = 'No results';
        } else if (searchMatches.length > 0) {
            searchCount.textContent = (currentMatchIdx + 1) + ' of ' + searchMatches.length;
        } else {
            searchCount.textContent = '';
        }
    }

    function highlightMatch() {
        if (currentMatchIdx < 0 || currentMatchIdx >= searchMatches.length) return;
        var m = searchMatches[currentMatchIdx];
        editor.focus();
        editor.selectionStart = m.start;
        editor.selectionEnd = m.end;
        // Scroll to selection
        var lineHeight = parseInt(getComputedStyle(editor).lineHeight) || 20;
        var textBefore = editor.value.substring(0, m.start);
        var lineNum = textBefore.split('\n').length;
        editor.scrollTop = Math.max(0, (lineNum - 3) * lineHeight);
    }

    function goToNextMatch() {
        if (searchMatches.length === 0) return;
        currentMatchIdx = (currentMatchIdx + 1) % searchMatches.length;
        highlightMatch();
        updateSearchCount();
    }

    function goToPrevMatch() {
        if (searchMatches.length === 0) return;
        currentMatchIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
        highlightMatch();
        updateSearchCount();
    }

    function replaceCurrent() {
        if (currentMatchIdx < 0 || currentMatchIdx >= searchMatches.length) return;
        var m = searchMatches[currentMatchIdx];
        editor.value = editor.value.substring(0, m.start) + replaceInput.value + editor.value.substring(m.end);
        renderPreview();
        findMatches();
    }

    function replaceAll() {
        if (searchMatches.length === 0) return;
        var query = searchInput.value;
        var caseSensitive = searchCase.checked;
        var flags = caseSensitive ? 'g' : 'gi';
        var regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        editor.value = editor.value.replace(regex, replaceInput.value);
        renderPreview();
        findMatches();
    }

    searchInput.addEventListener('input', findMatches);
    searchCase.addEventListener('change', findMatches);
    document.getElementById('search-next').addEventListener('click', goToNextMatch);
    document.getElementById('search-prev').addEventListener('click', goToPrevMatch);
    document.getElementById('replace-btn').addEventListener('click', replaceCurrent);
    document.getElementById('replace-all-btn').addEventListener('click', replaceAll);
    document.getElementById('search-close').addEventListener('click', closeSearch);

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToNextMatch();
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    });

    replaceInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Keyboard shortcuts help modal
    var shortcutsModal = document.getElementById('shortcuts-modal');

    function openShortcuts() {
        shortcutsModal.style.display = '';
    }

    function closeShortcuts() {
        shortcutsModal.style.display = 'none';
    }

    document.getElementById('shortcuts-close').addEventListener('click', closeShortcuts);
    shortcutsModal.addEventListener('click', function (e) {
        if (e.target === shortcutsModal) closeShortcuts();
    });

    // Download current file
    function downloadFile() {
        var currentTab = tabs.find(function (t) { return t.id === activeTabId; });
        var name = currentTab && currentTab.name !== 'Untitled' ? currentTab.name : 'document.md';
        var blob = new Blob([editor.value], { type: 'text/markdown' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        var mod = e.ctrlKey || e.metaKey;

        // Search shortcuts
        if (mod && e.key === 'f') {
            e.preventDefault();
            openSearch();
            return;
        }
        if (mod && e.key === 'h') {
            e.preventDefault();
            openSearch();
            setTimeout(function () { replaceInput.focus(); }, 50);
            return;
        }

        // Formatting shortcuts (only when editor is focused)
        if (mod && document.activeElement === editor) {
            if (e.key === 'b') {
                e.preventDefault();
                toolbarActions.bold();
                return;
            }
            if (e.key === 'i') {
                e.preventDefault();
                toolbarActions.italic();
                return;
            }
            if (e.key === 'k') {
                e.preventDefault();
                toolbarActions.link();
                return;
            }
            if (e.shiftKey && (e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
                toolbarActions.code();
                return;
            }
        }

        // Download
        if (mod && e.key === 's') {
            e.preventDefault();
            downloadFile();
            return;
        }

        // Fullscreen toggle
        if (mod && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
            e.preventDefault();
            toggleFullscreen(fullscreenTarget ? fullscreenTarget : 'editor');
            return;
        }

        // Help overlay
        if (mod && e.key === '/') {
            e.preventDefault();
            if (shortcutsModal.style.display === 'none') {
                openShortcuts();
            } else {
                closeShortcuts();
            }
            return;
        }

        // Escape
        if (e.key === 'Escape') {
            if (shortcutsModal.style.display !== 'none') {
                closeShortcuts();
            }
        }
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
