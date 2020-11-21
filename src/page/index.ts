import { registerRouter } from "./router";
import { getConfig } from "./config";
import { initHighlighter, afterViewMount } from "./highlighter";
import { loadExternals } from "./loader";
import { findRelativeViews } from "./scan-relations";
import { absoluteLinkWithHashFromRelativePath, extractRelativePartFromAbsolutePathWithHash } from "./paths";

async function init() {
    const config = getConfig();

    await loadExternals();
    initHighlighter();

    registerRouter({
        async onViewChange(viewUrl, newViewHTML) {
            const links = await findRelativeViews(viewUrl, newViewHTML, 'html', true);
            document.body.innerHTML = newViewHTML + '<hr>' + links.map(x => `<a href="${absoluteLinkWithHashFromRelativePath(x.url)}">${extractRelativePartFromAbsolutePathWithHash(x.url)}</a>`).join('<br>');
            afterViewMount();
        }
    });
}

init();