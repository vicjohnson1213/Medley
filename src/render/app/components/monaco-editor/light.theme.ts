import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

const WHITE = 'FFFFFF';
const BLACK = '111111';
const RED = 'DF3B57';
const ORANGE = 'E56E3B';
const TEAL = '0F7173';
const GREEN = '418E54';
const YELLOW = 'E2C044';
const BLUE = '226CE0';
const LIGHT_GRAY = 'CCCCCC';
const MEDIUM_GRAY = '999999';
const DARK_GRAY = '444444';

export const LightTheme: monaco.editor.IStandaloneThemeData = { base: 'vs',
    inherit: true,
    colors: {
        'editor.foreground': '#4D4D4C',
        'editor.background': '#F5F5F5',
        'editor.selectionBackground': '#00000010',
        'editor.lineHighlightBackground': '#00000004',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#D1D1D1' }, 
    rules: [
        { token: '', foreground: BLACK },
        { token: 'md.heading', foreground: RED },
        { token: 'md.blockquote', foreground: MEDIUM_GRAY, fontStyle: 'italic' },
        { token: 'md.list', foreground: RED },
        { token: 'md.code.block', foreground: MEDIUM_GRAY },
        { token: 'md.code.inline', foreground: ORANGE },
        { token: 'md.bolditalic', foreground: BLUE, fontStyle: 'bold italic' },
        { token: 'md.bold', foreground: YELLOW, fontStyle: 'bold' },
        { token: 'md.italic', foreground: TEAL, fontStyle: 'italic' },
        { token: 'md.strikethrough', foreground: MEDIUM_GRAY },
        { token: 'md.link.bracket', foreground: DARK_GRAY },
        { token: 'md.link.text', foreground: BLUE },
        { token: 'md.link.target', foreground: GREEN },
        { token: 'md.html.tag', foreground: BLUE },
        { token: 'md.html.attribute.name', foreground: BLUE },
        { token: 'md.html.attribute.delimiter', foreground: MEDIUM_GRAY },
        { token: 'md.html.attribute.value', foreground: ORANGE },

        { foreground: '8e908c', token: 'comment' },
        { foreground: '666969', token: 'keyword.operator.class' },
        { foreground: '666969', token: 'constant.other' },
        { foreground: '666969', token: 'source.php.embedded.line' },
        { foreground: 'c82829', token: 'variable' },
        { foreground: 'c82829', token: 'support.other.variable' },
        { foreground: 'c82829', token: 'string.other.link' },
        { foreground: 'c82829', token: 'string.regexp' },
        { foreground: 'c82829', token: 'entity.name.tag' },
        { foreground: 'c82829', token: 'entity.other.attribute-name' },
        { foreground: 'c82829', token: 'meta.tag' },
        { foreground: 'c82829', token: 'declaration.tag' },
        { foreground: 'f5871f', token: 'constant.numeric' },
        { foreground: 'f5871f', token: 'constant.language' },
        { foreground: 'f5871f', token: 'support.constant' },
        { foreground: 'f5871f', token: 'constant.character' },
        { foreground: 'f5871f', token: 'variable.parameter' },
        { foreground: 'f5871f', token: 'punctuation.section.embedded' },
        { foreground: 'f5871f', token: 'keyword.other.unit' },
        { foreground: 'c99e00', token: 'entity.name.class' },
        { foreground: 'c99e00', token: 'entity.name.type.class' },
        { foreground: 'c99e00', token: 'support.type' },
        { foreground: 'c99e00', token: 'support.class' },
        { foreground: '718c00', token: 'string' },
        { foreground: '718c00', token: 'constant.other.symbol' },
        { foreground: '718c00', token: 'entity.other.inherited-class' },
        { foreground: '718c00', token: 'markup.heading' },
        { foreground: '3e999f', token: 'keyword.operator' },
        { foreground: '3e999f', token: 'constant.other.color' },
        { foreground: '4271ae', token: 'entity.name.function' },
        { foreground: '4271ae', token: 'meta.function-call' },
        { foreground: '4271ae', token: 'support.function' },
        { foreground: '4271ae', token: 'keyword.other.special-method' },
        { foreground: '4271ae', token: 'meta.block-level' },
        { foreground: '8959a8', token: 'keyword' },
        { foreground: '8959a8', token: 'storage' },
        { foreground: '8959a8', token: 'storage.type' },
        { foreground: 'ffffff', background: 'c82829', token: 'invalid' },
        { foreground: 'ffffff', background: '4271ae', token: 'meta.separator' },
        { foreground: 'ffffff', background: '8959a8', token: 'invalid.deprecated' }
    ]
}
