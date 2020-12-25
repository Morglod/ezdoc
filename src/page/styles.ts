const defaultStyles = `
.ezdoc-view {
    max-width: 1000px;
    margin: 0 auto;
}
`;

export function registerDefaultStyles() {
    const s = document.createElement('style');
    s.innerHTML = defaultStyles;
    document.body.appendChild(s);
}