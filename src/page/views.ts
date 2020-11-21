import { getConfig } from "./config";
import { _deprec_absoluteLinkWithHashFromRelativePath, _deprec_currentViewPathAbsolutePathWithHash } from "./paths";
import { renderMarkdown } from "./view-md";
import type DOMPurifyModuleType from 'dompurify';
import { _getCurrentRoute } from "./router";
declare const DOMPurify: typeof DOMPurifyModuleType;

export const requestViewText = (url: string) => fetch(url).then(x => x.text());

export const viewExts = [ 'html', 'md', 'unknown' ] as const;
export type ViewExt = (typeof viewExts)[any];

export type ViewRenderOpts = {
    baseUrl?: string,
};

export interface View {
    /** absolute url */
    absoluteUrl: string,

    content: string,

    ext: ViewExt,

    renderedHTML: string,

    /** original links on view */
    foundLinks: string[],
};

/** view raw content -> html */
const viewRenders: {
    [ext in ViewExt]: (content: string) => Promise<string>|string;
} = {
    html: content => content,
    md: viewContent => {
        return renderMarkdown({
            // baseUrl: currentViewPathAbsolutePathWithHash(),
            baseUrl: _getCurrentRoute().routerInit.viewOrigin + '#/' + _getCurrentRoute().viewUrl,
        }, viewContent)
    },
    unknown: content => content,
};

export async function renderViewFromUrl(viewUrl: string, viewExt: ViewExt) {
    const content = await requestViewText(viewUrl);
    return renderViewContent(content, viewExt);
}

export async function renderViewContent(viewContent: string, viewExt: ViewExt) {
    const cfg = getConfig();
    let html = '';
    
    if (viewExt in viewRenders) {
        html = await viewRenders[viewExt](viewContent);
    } else {
        html = await viewRenders['unknown'](viewContent);
    }

    if (cfg.sanitize === 'dompurify') {
        html = DOMPurify.sanitize(html);
    }

    return html;
}
