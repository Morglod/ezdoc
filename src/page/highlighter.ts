import type * as prismjsModuleType from 'prismjs';
import type * as hljsModuleType from 'highlight.js';
import { getConfig } from './config';
import { loadHljsLanguages } from './loader';

declare const Prism: typeof prismjsModuleType;
declare const hljs: typeof hljsModuleType;

export function initHighlighter() {
    const config = getConfig();

    if (config.highlight === 'hljs') {
        hljs.initHighlightingOnLoad();
    }
}

export function highlightCodePart(code: string, lang: string) {
    const config = getConfig();

    if (config.highlight === 'prism') {
        // return nothing, highlight will done with postViewMount
        return;
    }

    return;
}

export async function afterViewMount() {
    const config = getConfig();

    if (config.highlight === 'prism') {
        Prism.highlightAll();
    }

    if (config.highlight === 'hljs') {
        const mapLangName = {
            'tsx': 'typescript',
            'ts': 'typescript',
        };

        const langs = Array.from(document.querySelectorAll('code[class^="language-"]'))
            .map(x => {
                let lang = x.className.substr('language-'.length);
                if (lang in mapLangName) lang = (mapLangName as any)[lang];
                return lang;
            });
        ;
        if (langs.length !== 0) await loadHljsLanguages(langs);
        hljs.initHighlighting();
    }
}