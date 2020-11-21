import { getConfig } from "./config";

import type * as hljsModuleType from 'highlight.js';
declare const hljs: typeof hljsModuleType;

const markedScripts = [
    '//cdn.jsdelivr.net/npm/marked/marked.min.js'
];

const prismScripts = [
    '//cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js',
    '//cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js',
    { code: `Prism.plugins.autoloader.languages_path = '//cdn.jsdelivr.net/npm/prismjs@1/components/'` },

];

const prismStyles = [
    '//cdn.jsdelivr.net/npm/prismjs@1/themes/prism.css'
];

const highlightScripts = [
    '//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/highlight.min.js'
];

const highlightStyles = [
    '//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/styles/default.min.css'
];

function loadScript(from: string | { code: string }) {
    if (typeof from === 'string') {
        const s = document.createElement('script');
        s.src = from;
        document.head.appendChild(s);
        return s;
    } else {
        const s = document.createElement('script');
        s.innerHTML = from.code;
        document.head.appendChild(s);
        return s;
    }
}

function loadStyleLink(from: string | { code: string }) {
    if (typeof from === 'string') {
        const s = document.createElement('link');
        s.rel = 'stylesheet';
        s.href = from;
        document.head.appendChild(s);
        return s;
    } else {
        const s = document.createElement('style');
        s.innerHTML = from.code;
        document.head.appendChild(s);
        return s;
    }
}

async function loadScripts(scripts: (string | { code: string })[]) {
    for (const src of scripts) {
        const s = document.createElement('script');
        let waitForLoad;
        
        if (typeof src === 'string') {
            waitForLoad = new Promise(resolve => s.addEventListener('load', () => resolve()));
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
    for (const s of styles) {
        loadStyleLink(s);
    }
}

async function loadMarked() {
    if ('marked' in window && !!(window as any).marked) return;
    await loadScripts(markedScripts);
}

async function loadPrism() {
    if ('Prism' in window && !!(window as any).Prism) return;
    loadStyles(prismStyles);
    await loadScripts(prismScripts);
}

async function loadHighlightjs() {
    if ('hljs' in window && !!(window as any).Prism) return;
    loadStyles(highlightStyles);
    await loadScripts(highlightScripts);
}

export async function loadExternals() {
    const config = getConfig();
    if (config.highlight === 'prism') await loadPrism();
    if (config.highlight === 'hljs') await loadHighlightjs();
    if (config.markdown === 'marked') await loadMarked();
}

export async function loadHljsLanguages(langs: string[]) {
    const toLoad = langs.filter(x => !hljs.getLanguage(x)).map(x => `//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/languages/${x}.min.js`);
    await loadScripts(toLoad);
}