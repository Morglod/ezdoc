import { dirname, isAbsolute as isAbsolutePath, join as joinPath, relative as relativePath } from 'path';
import { ViewExt, viewExts } from "./views";

export function _deprec_currentBasePath() {
    return window.location.pathname;
}

export function _deprec_currentViewPathPart() {
    const relativeViewPath = extractPathFromHash(window.location.hash);
    return _deprecate_relaxateLink(relativeViewPath);
}

export function _deprec_currentViewPathAbsolutePathWithHash() {
    return _deprec_currentBasePath() + '#/' + _deprec_currentViewPathPart();
}

// #/../test.md
// #../test.md
export function extractPathFromHash(path: string) {
    const ind = path.indexOf('#/');
    return path.substr(ind + 2);
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
export function _deprecate_relaxateLink(link: string) {
    if (!isAbsolutePath(link)) {
        const inBasePath = joinPath(_deprec_currentBasePath(), link);
        return relativePath(_deprec_currentBasePath(), inBasePath);
    }
    return link;
}

export function _deprec_absoluteLinkWithHashFromRelativePath(relativePath: string) {
    const currentBase = _deprec_currentBasePath();
    if (relativePath.startsWith(currentBase)) return relativePath;

    relativePath = (relativePath ? _deprecate_relaxateLink(relativePath) : '');
    if (relativePath[0] === '/') relativePath = relativePath.substr(1);
    const r = currentBase + '#/' + relativePath;
    return r;
}

export function parseQueryParams<T = { [k: string]: any }>(query: string): Partial<T> {
    if (query === '') return ({} as any as T);
    const qind = query.indexOf('?');
    if (qind !== -1) query = query.substr(qind + 1);
    return query.split('&').reduce((sum, kv) => {
        let [ k, v ] = kv.split('=') as any[];
        if (v === undefined) v = true;
        return Object.assign(sum, { [k]: v });
    }, {} as any as T);
}

/** sum puth with only one '/' in between it */
export function sumPaths(a: string, b: string) {
    if (
        (a.endsWith('/') && !b.startsWith('/')) ||
        (!a.endsWith('/') && b.startsWith('/'))
    ) return a+b;
    return a + '/' + b;
}

const _webProtocolRegexp = /^(http|https|file)\:\/\//;

/**
 * path with protocol specified is external path
 */
export function isExternalPath(path: string) {
    return _webProtocolRegexp.test(path);
}

/** relax '..' & '.' path parts */
export function _relaxatePathPartsByRef(pathParts: string[]) {
    for (let i = 0; i < pathParts.length; ++i) {
        if (pathParts[i] === '.') {
            pathParts.splice(i, 1);
            --i;
            continue;
        }
        if (pathParts[i] === '..' && i !== 0) {
            pathParts.splice(i - 1, 2);
            --i;
            --i;
            continue;
        }
    }
    return pathParts;
}

/**
 * good
 * ```
 * origin= http://192.168.0.42:8080/example/  
 * other=  http://192.168.0.42:8080/example/../hello/../doc.md  
 * returns ../doc.md  
 * ```
 * 
 * bad
 * ```
 * origin= http://192.168.0.42:8080/example/  
 * other=  /example/../hello/../doc.md  
 * returns /example/../hello/../doc.md  
 * ```
 */
export function tryRelativeFromAbsolutes(origin: string, other: string) {
    if (!other.startsWith(origin)) return other;
    other = other.substr(origin.length);
    return _relaxatePathPartsByRef(other.split('/')).join('/');
}

export function parentDir(path: string) {
    return dirname(path);
}