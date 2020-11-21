import { absoluteLinkWithHashFromRelativePath, currentViewPathAbsolutePathWithHash, extractRelativePartFromAbsolutePathWithHash } from "./paths";
import { renderMarkdown } from "./view-md";

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
            baseUrl: currentViewPathAbsolutePathWithHash(),
        }, viewContent)
    },
    unknown: content => content,
};

export async function renderViewFromUrl(viewUrl: string, viewExt: ViewExt) {
    const content = await requestViewText(viewUrl);
    return renderViewContent(content, viewExt);
}

export function renderViewContent(viewContent: string, viewExt: ViewExt) {
    if (viewExt in viewRenders) {
        return viewRenders[viewExt](viewContent);
    } else {
        return viewRenders['unknown'](viewContent);
    }
}
