import { getConfig } from "./config";

import type * as hljsModuleType from 'highlight.js';
declare const hljs: typeof hljsModuleType;

async function loadScripts(scripts: (string | { code: string })[]) {
    for (const src of scripts) {
        const s = document.createElement('script');
        let waitForLoad;
        
        if (typeof src === 'string') {
            waitForLoad = new Promise<void>(resolve => s.addEventListener('load', () => resolve()));
            s.src = src;
        }
        else {
            s.innerHTML = src.code;
        }

        document.head.appendChild(s);
        await waitForLoad;
    }
}

async function loadStyles(styles: (string | { code: string })[]) {
    for (const src of styles) {
        if (typeof src === 'string') {
            const s = document.createElement('link');
            s.rel = 'stylesheet';
            s.href = src;
            document.head.appendChild(s);
            return s;
        } else {
            const s = document.createElement('style');
            s.innerHTML = src.code;
            document.head.appendChild(s);
            return s;
        }
    }
}

async function loadMarked() {
    if ('marked' in window && !!(window as any).marked) return;
    await loadScripts([
        '//cdn.jsdelivr.net/npm/marked/marked.min.js'
    ]);
}

async function loadPrism() {
    if ('Prism' in window && !!(window as any).Prism) return;
    loadStyles([
        '//cdn.jsdelivr.net/npm/prismjs@1/themes/prism.css'
    ]);
    await loadScripts([
        '//cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js',
        '//cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js',
        { code: `Prism.plugins.autoloader.languages_path = '//cdn.jsdelivr.net/npm/prismjs@1/components/'` },
    ]);
}

async function loadHighlightjs() {
    if ('hljs' in window && !!(window as any).Prism) return;
    loadStyles([
        '//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/styles/default.min.css'
    ]);
    await loadScripts([
        '//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/highlight.min.js'
    ]);
}


async function loadDomPurify() {
    await loadScripts([
        '//cdn.jsdelivr.net/npm/dompurify'
    ]);
}

export async function loadHljsLanguages(langs: string[]) {
    const toLoad = langs.filter(x => !hljs.getLanguage(x)).map(x => `//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/languages/${x}.min.js`);
    await loadScripts(toLoad);
}

export async function loadExternals() {
    const config = getConfig();
    if (config.highlight === 'prism') await loadPrism();
    if (config.highlight === 'hljs') await loadHighlightjs();
    if (config.markdown === 'marked') await loadMarked();
    if (config.sanitize === 'dompurify') await loadDomPurify();
}
