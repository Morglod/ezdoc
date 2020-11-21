declare const ezdoc_config: {
    /** github path */
    repo: string,

    /** boolean | path */
    sidebar: boolean | string,

    markdown: false | 'marked',

    highlight: 'prism' | 'hljs',
};

export const getConfig = () => ezdoc_config;