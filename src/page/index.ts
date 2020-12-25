import { registerRouter } from "./router";
import { getConfig } from "./config";
import { initHighlighter, afterViewMount } from "./highlighter";
import { loadExternals } from "./loader";
import { findRelativeViews } from "./scan-relations";
import { _deprec_absoluteLinkWithHashFromRelativePath, extractPathExt } from "./paths";
import { renderViewFromUrl } from "./views";
import { updateWindowTitle } from "./window-title";
import { registerDefaultStyles } from "./styles";

async function init() {
    const config = getConfig();

    if (config.loadExternals) await loadExternals();
    if (config.highlight) initHighlighter();

    let contentViewDiv = document.querySelector('.ezdoc-view')!;
    if (!contentViewDiv) {
        contentViewDiv = document.createElement('div');
        contentViewDiv.className = 'ezdoc-view';
        document.body.appendChild(contentViewDiv);
    }

    contentViewDiv.classList.add('markdown-body');

    registerDefaultStyles();

    registerRouter({
        async onRouteChange(newRoute) {
            const ext = extractPathExt(newRoute.viewFileUrl);
            updateWindowTitle(newRoute);

            const html = await renderViewFromUrl(newRoute.viewFileUrl, ext);
            // const links = await findRelativeViews(newRoute.viewFileUrl, html, 'html', true);
            contentViewDiv.innerHTML = html; // + '<hr>' + links.map(x => `<a href="${absoluteLinkWithHashFromRelativePath(x.url)}">${extractRelativePartFromAbsolutePathWithHash(x.url)}</a>`).join('<br>');
            afterViewMount();

            for (const cb of config.afterRouteChange) cb(newRoute);
        }
    });
}

init();