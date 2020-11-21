import * as pathModule from 'path';
import { ViewExt, viewExts } from "./views";

export function currentBasePath() {
    return window.location.pathname;
}

export function currentViewPathPart() {
    const relativeViewPath = extractPathFromHash(window.location.hash);
    return relaxateLink(relativeViewPath);
}

export function currentViewPathAbsolutePathWithHash() {
    return currentBasePath() + '#/' + currentViewPathPart();
}

// #/../test.md
// #../test.md
export function extractPathFromHash(hash: string) {
    const path = hash.replace(/^\#\/?/, '');
    return path;
}

export function extractPathExt(path: string): ViewExt {
    const extMatch = path.match(/\.(\w+)$/);
    if (extMatch) {
        const [,ext] = extMatch;
        if (viewExts.includes(ext as any)) return ext as ViewExt;
    }
    return 'unknown';
}

/** docs/#/../docs/file.md -> docs/#/file.md */
export function relaxateLink(link: string) {
    if (!pathModule.isAbsolute(link)) {
        const inBasePath = pathModule.join(currentBasePath(), link);
        return pathModule.relative(currentBasePath(), inBasePath);
    }
    return link;
}

export function absoluteLinkWithHashFromRelativePath(relativePath: string) {
    const currentBase = currentBasePath();
    if (relativePath.startsWith(currentBase)) return relativePath;

    relativePath = (relativePath ? relaxateLink(relativePath) : '');
    if (relativePath[0] === '/') relativePath = relativePath.substr(1);
    const r = currentBase + '#/' + relativePath;
    return r;
}

export function extractRelativePartFromAbsolutePathWithHash(path: string) {
    const ind = path.indexOf('#/');
    return path.substr(ind + 2);
}