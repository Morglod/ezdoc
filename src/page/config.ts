declare const ezdoc_config: {
    /** github path */
    repo: string,

    /** boolean | path */
    sidebar: boolean | string,

    markdown: false | 'marked',

    highlight: false | 'prism' | 'hljs',

    /**
     * path to main view for '/' route  
     * eg '/readme.md'
     */
    defaultViewPath: string,

    loadExternals: boolean,

    title: 'auto' | ((viewPath: string) => string) | string,

    sanitize: false | 'dompurify',
};

export type Config = typeof ezdoc_config;

const defaultConfig: Config = {
    repo: '',
    sidebar: true,
    markdown: 'marked',
    highlight: 'prism',
    defaultViewPath: '../readme.md',
    loadExternals: true,
    title: 'auto',
    sanitize: 'dompurify'
};

// apply default config values
Object.assign(ezdoc_config, defaultConfig, ezdoc_config);

export const getConfig = () => ezdoc_config;