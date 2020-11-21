import { Location, Listener, Action } from 'history';
import { createHashHistory } from 'history';

import { absoluteLinkWithHashFromRelativePath, extractPathExt, extractPathFromHash, relaxateLink } from "./paths";
import { renderViewFromUrl } from "./views";

export type Router = {
    onHashChange?: (oldHash: string, newHash: string) => void,
    onViewChange?: (viewPath: string, newViewHTML: string) => void,
}

export function registerRouter(router: Router) {
    const history = createHashHistory();

    let oldHash = window.location.hash;
    const handleHashChange: Listener<any> = (update) => {
        const newHash = window.location.hash;
        const viewPath = extractPathFromHash(newHash);

        if (update && update.action === Action.Push) {
            const relaxedViewPath = relaxateLink(extractPathFromHash(newHash));
            if (viewPath !== relaxedViewPath) {
                const newHash = '#/' + relaxedViewPath;
                history.replace({ hash: newHash });
            }
        }
        if (router.onHashChange) router.onHashChange(oldHash, newHash);

        renderViewFromUrl(viewPath, extractPathExt(viewPath)).then(html => {
            if (router.onViewChange) router.onViewChange(viewPath, html);
        });

        oldHash = newHash;
    };

    const unlisten = history.listen(handleHashChange);

    handleHashChange(undefined!);

    return () => {
        unlisten();
    };
}