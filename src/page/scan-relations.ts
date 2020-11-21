import { isAbsolute as isAbsolutePath, join as joinPath, dirname } from 'path';
import { _deprec_absoluteLinkWithHashFromRelativePath, extractPathExt, _deprecate_relaxateLink } from "./paths";
import { requestViewText, ViewExt } from "./views";

const markdownRegex = /(?:[])|\[(?:.*?)\]\(([\w\.\/\%\&]+)\)/gm;
// const markdownRegex = /(?:[])|\[(?:.*?)\]\(([\w\W]+)\)/gm;
const htmlRegex = /<a[\s\w\W]+href=\"([\w\W]+)\"[\s\w\W]+>/g;

const extToRegex: {
    [ext in ViewExt]: RegExp
} = {
    unknown: undefined!,
    html: htmlRegex,
    md: markdownRegex,
};

function findRelationsIn(regex: RegExp, code: string) {
    const hrefs: string[] = [];
    
    let match;
    while ((match = regex.exec(code)) !== null) {
        const href = match[1];
        hrefs.push(href);
    }

    return hrefs;
}

type RelativeView = {
    /** absolute url with hash */
    url: string,

    content: string,

    ext: ViewExt,

    /** original links on view */
    links: string[],
};

export async function findRelativeViews(
    viewPath: string,
    code: string,
    ext: ViewExt,
    recursive: boolean,
    _awaitQueue: Promise<RelativeView[]>[] | undefined = undefined,
    _visited: string[] = [],
) {
    if (ext === 'unknown') return [];
    const curDir = dirname(viewPath);

    let absolutePathWHash = _deprec_absoluteLinkWithHashFromRelativePath(viewPath);

    if (_visited.includes(absolutePathWHash)) return [];
    _visited.push(absolutePathWHash);

    const foundLinks = findRelationsIn(extToRegex[ext], code).filter(x => extractPathExt(x) !== 'unknown');
    const found = [
        {
            url: absolutePathWHash,
            content: code,
            ext: ext as ViewExt,
            links: foundLinks,
        }
    ];
    
    if (recursive) {
        let isRootSearch =  (_awaitQueue === undefined);
        if (!_awaitQueue) _awaitQueue = [];

        for (const link of foundLinks) {
            let href = link;
            if (!isAbsolutePath(link)) {
                href = joinPath(curDir, link);
            }
            _awaitQueue!.push(requestViewText(href).then(childCode => {
                return findRelativeViews(href, childCode, extractPathExt(link), recursive, _awaitQueue, _visited);
            }));
        }

        if (isRootSearch) {
            for await (const links of _awaitQueue) {
                found.push(...links);
            }
        }
    }

    return found;
}
