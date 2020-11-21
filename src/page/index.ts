import { registerRouter } from "./router";
import { getConfig } from "./config";
import { initHighlighter, afterViewMount } from "./highlighter";
import { loadExternals } from "./loader";
import { findRelativeViews } from "./scan-relations";
import { _deprec_absoluteLinkWithHashFromRelativePath, extractPathExt } from "./paths";
import { renderViewFromUrl } from "./views";
import { updateWindowTitle } from "./window-title";

async function init() {
    const config = getConfig();

    if (config.loadExternals) await loadExternals();
    if (config.highlight) initHighlighter();

    registerRouter({
        async onRouteChange(newRoute) {
            const ext = extractPathExt(newRoute.viewFileUrl);
            updateWindowTitle(newRoute);

            const html = await renderViewFromUrl(newRoute.viewFileUrl, ext);
            // const links = await findRelativeViews(newRoute.viewFileUrl, html, 'html', true);
            document.body.innerHTML = html; // + '<hr>' + links.map(x => `<a href="${absoluteLinkWithHashFromRelativePath(x.url)}">${extractRelativePartFromAbsolutePathWithHash(x.url)}</a>`).join('<br>');
            afterViewMount();
        }
    });
}

init();