import { Location as HistoryLocation, Listener, Action as HistoryAction, History, createBrowserHistory, createHashHistory } from 'history';
import { Config, getConfig } from './config';
import { extractPathFromHash, isExternalPath, parentDir, parseQueryParams, sumPaths, tryRelativeFromAbsolutes, _relaxatePathPartsByRef } from "./paths";

export type Router = {
    onRouteChange?: (newRoute: RouteInfo, oldRoute?: RouteInfo) => void,
}

export type RouterInit = {
    /** full url */
    url: string,
    /** http://www.docs.com */
    origin: string,
    /** base app url */
    baseUrl: string,
    /** usually origin + baseUrl */
    viewOrigin: string,
    viewPath: string,
    pathType: 'query' | 'hash',
}

export interface HistoryRouteState {

}

export interface RouteInfo {
    readonly historyState: HistoryRouteState|undefined,
    readonly routerInit: RouterInit,
    
    /** view absolute path */
    viewFileUrl: string,

    /** view path relative to router's viewOrigin */
    viewUrl: string,
}

export function getRouterInit(location: typeof window["location"]): RouterInit {
    const cfg = getConfig();

    let pathType: 'unknown' | 'query' | 'hash'  = 'unknown';
    let viewPath = cfg.defaultViewPath;
    
    const query = parseQueryParams<{
        view: string,
    }>(location.search);
    
    if (query.view) {
        pathType = 'query';
    } else if (!!location.hash) {
        pathType = 'hash';
    } else {
        console.warn('unknown pathType (not query & not hash), fallback to hash');
        location.hash = cfg.defaultViewPath;
        pathType = 'hash';
    }

    if (pathType === 'hash') {
        viewPath = extractPathFromHash(location.hash);
    }

    if (pathType === 'query') {
        viewPath = query.view || cfg.defaultViewPath;
    }

    return {
        url: location.href,
        origin: location.origin,
        baseUrl: location.pathname,
        pathType,
        viewPath,
        viewOrigin: location.origin + location.pathname,
    };
}

export function getViewPath(
    routerInit: RouterInit,
    historyLocation: HistoryLocation|undefined,
    windowLocation: Location|undefined,
    cfg: Config = getConfig(),
): string {
    if (historyLocation) {
        switch (routerInit.pathType) {
        case 'hash':
            // remove '/' from start
            return historyLocation.pathname[0] === '/' ? historyLocation.pathname.substr(1) : historyLocation.pathname;
    
        case 'query':
            const query = parseQueryParams<{
                view: string,
            }>(historyLocation.search);
            return query.view || cfg.defaultViewPath;
        }
    }
    if (windowLocation) {
        switch (routerInit.pathType) {
        case 'hash':
            const newHash = windowLocation.hash;
            return extractPathFromHash(newHash) || cfg.defaultViewPath;
    
        case 'query':
            const query = parseQueryParams<{
                view: string,
            }>(windowLocation.search);
            return query.view || cfg.defaultViewPath;
        }
    }
    return cfg.defaultViewPath;
}

let _currentRoute!: RouteInfo;

export function _getCurrentRoute() {
    return _currentRoute;
}

export function registerRouter(router: Router) {
    const routerInit = getRouterInit(window.location);

    let history: History<HistoryRouteState>;

    switch(routerInit.pathType) {
        case 'hash':
            history = createHashHistory({ window }) as History<HistoryRouteState>;
            break;
        case 'query':
            history = createBrowserHistory({ window }) as History<HistoryRouteState>;
            break;
    }

    let oldRoute: RouteInfo|undefined = undefined;

    const handleRouteChange: Listener<HistoryRouteState> = (update) => {
        if (update && update.action === HistoryAction.Replace) return;

        const _viewPath = getViewPath(routerInit, update && update.location, window.location);
        const viewPath = _relaxatePathPartsByRef(_viewPath.split('/')).join('/');

        // TODO: replace path with relaxed
        // !!it differs from pathType!!
        // if (update && _viewPath !== viewPath) {
        //     history.replace('/' + viewPath);
        // }

        let viewFileUrl = viewPath;

        if (!isExternalPath(viewPath)) {
            viewFileUrl = sumPaths(routerInit.viewOrigin, viewPath);
        }

        const routeInfo: RouteInfo = {
            viewUrl: viewPath,
            viewFileUrl,
            routerInit,
            historyState: update ? update.location.state : undefined
        };
        _currentRoute = routeInfo;

        console.log(routeInfo);
        if (router.onRouteChange) router.onRouteChange(routeInfo, oldRoute);
        oldRoute = routeInfo;
    };

    const unlistenHistory = history.listen(handleRouteChange);

    handleRouteChange(undefined!);

    return () => {
        unlistenHistory();
    };
}

// export function linkToView(viewFileUrl: string) {
//     const currentView = _getCurrentRoute();
//     const currentParentUrl = parentDir(currentView.viewFileUrl);
//     const targetViewPath = tryRelativeFromAbsolutes(currentParentUrl, viewFileUrl);

//     if (currentView.routerInit.pathType === 'hash') {
//         return sumPaths(sumPaths(currentView.routerInit.viewOrigin, '#'), targetViewPath);
//     }

//     if (currentView.routerInit.pathType === 'query') {
//         return currentView.routerInit.viewOrigin + '?view=' + encodeURIComponent(targetViewPath);
//     }

//     return targetViewPath;
// }