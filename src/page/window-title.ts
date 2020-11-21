import { getConfig } from "./config";
import type { RouteInfo } from "./router";

export function updateWindowTitle(currentRoute: RouteInfo|undefined) {
    const cfg = getConfig();
    const currentViewPath = currentRoute ? currentRoute.viewUrl : cfg.defaultViewPath;

    if (typeof cfg.title === 'function') {
        document.title = cfg.title(currentViewPath);
    }
    else if (cfg.title === 'auto') {
        document.title = 'Docs ' + currentViewPath;
    }
    else {
        document.title = cfg.title;
    }
}