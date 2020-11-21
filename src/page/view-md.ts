import type markedModule from 'marked';
import * as dompurify from 'dompurify';
import { ViewRenderOpts } from './views';
import { highlightCodePart } from './highlighter';

declare const marked: typeof markedModule;

export function renderMarkdown(viewOpts: ViewRenderOpts, mdStr: string) {
    return marked(mdStr, {
        baseUrl: viewOpts.baseUrl,
        headerIds: true,
        gfm: true,
        sanitizer: dompurify.sanitize,
        highlight: (code, lang, callback) => {
            return highlightCodePart(code, lang);
        }
    });
}