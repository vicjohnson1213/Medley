import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export const MarkdownImproved = {
    defaultToken: '',
    tokenPostfix: '.md',

    // escape codes
    control: /[\\`*_\[\]{}()#+\-\.!]/,
    noncontrol: /[^\\`*_\[\]{}()#+\-\.!]/,
    escapes: /\\(?:[\\`*_\[\]{}()#+\-\.!])/,

    // escape codes for javascript/CSS strings
    jsescapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,

    // non matched html elements
    empty: [
        'area', 'base', 'basefont', 'br', 'col', 'frame',
        'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param'
    ],
    tokenizer: {
        root: [
            [/^#+.*/, 'md.heading'],
            [/^\s*>+.*/, 'md.blockquote'],
            [/^\s*([\*\-+:]|\d+\.)\s/, 'md.list'],

            [/^\s*~~~\s*((?:\w|[\/\-#])+)?\s*$/, { token: 'md.code.block', next: '@codeblock' }],
            [/^\s*```\s*((?:\w|[\/\-#])+).*$/, { token: 'md.code.block', next: '@codeblockGithub', nextEmbedded: '$1' }],
            [/^\s*```\s*$/, { token: 'md.code.block', next: '@codeblock' }],

            { include: '@lineContent' },
            { include: 'html' },
        ],
        codeblock: [
            [/^\s*~~~\s*$/, { token: 'md.code.block', next: '@pop' }],
            [/^\s*```\s*$/, { token: 'md.code.block', next: '@pop' }],
            [/.*$/, 'md.code.source']
        ],
        codeblockGithub: [
            [/```\s*$/, { token: 'md.code.block', next: '@pop', nextEmbedded: '@pop' }],
            [/[^`]+/, 'md.code.source'],
        ],
        lineContent: [
            [/&\w+;/, 'string.escape'],
            [/@escapes/, 'escape'],

            [/\*\*\*(?:[^\\*]|@escapes)+\*\*\*/, 'md.bolditalic'],
            [/___(?:[^\\_]|@escapes)+___/, 'md.bolditalic'],

            [/\*\*(?:[^\\*]|@escapes)+\*\*/, 'md.bold'],
            [/__(?:[^\\_]|@escapes)+__/, 'md.bold'],

            [/\*(?:[^\\*]|@escapes)+\*/, 'md.italic'],
            [/_(?:[^\\_]|@escapes)+_/, 'md.italic'],
            
            [/~~(?:[^\\~]|@escapes)+~~/, 'md.strikethrough'],

            [/`(?:[^\\`]|@escapes)+`/, 'md.code.inline'],

            [/(!?\[)((?:[^\]]|@escapes)+)(\])([\(\[])((?:[^\)\]]|@escapes)+)([\)\]])/, ['md.link.bracket', 'md.link.text', 'md.link.bracket', 'md.link.bracket', 'md.link.target', 'md.link.bracket']],
            [/(\[)((?:[^\\_]|@escapes)+)(\])/, ['md.link.bracket', 'md.link.target', 'md.link.bracket']]
        ],
        html: [
            [/<(\w+)\/>/, 'md.html.tag'],
            [/<(\w+)/, {
                cases: {
                    '@empty': { token: 'md.html.tag', next: '@tag.$1' },
                    '@default': { token: 'md.html.tag', next: '@tag.$1' }
                }
            }],
            [/<\/(\w+)\s*>/, { token: 'md.html.tag' }],
            [/<!--/, 'md.html.comment', '@comment']
        ],

        comment: [
            [/[^<\-]+/, 'md.html.comment'],
            [/-->/, 'md.html.comment', '@pop'],
            [/<!--/, 'md.html.comment'],
            [/[<\-]/, 'md.html.comment']
        ],
        tag: [
            [/[ \t\r\n]+/, 'white'],
            <monaco.languages.IMonarchLanguageRule>[
                /(type)(\s*=\s*)(")([^"]+)(")/,
                [
                    'md.html.attribute.name',
                    'md.html.attribute.delimiter',
                    'md.html.attribute.value',
                    { token: 'md.html.attribute.value', switchTo: '@tag.$S2.$4' },
                    'md.html.attribute.value'
                ]
            ],
            <monaco.languages.IMonarchLanguageRule>[
                /(type)(\s*=\s*)(')([^']+)(')/,
                [
                    'md.html.attribute.name',
                    'md.html.attribute.delimiter',
                    'md.html.attribute.value',
                    { token: 'md.html.attribute.value', switchTo: '@tag.$S2.$4' },
                    'md.html.attribute.value'
                ]
            ],
            [/(\w+)(\s*=\s*)("[^"]*"|'[^']*')/, ['md.html.attribute.name', 'md.html.attribute.delimiter', 'md.html.attribute.value']],
            [/\w+/, 'md.html.attribute.name'],
            [/\/>/, 'md.html.tag', '@pop'],
            [/>/, {
                cases: {
                    '$S2==style': { token: 'md.html.tag', switchTo: 'embeddedStyle', nextEmbedded: 'text/css' },
                    '$S2==script': {
                        cases: {
                            '$S3': { token: 'md.html.tag', switchTo: 'embeddedScript', nextEmbedded: '$S3' },
                            '@default': { token: 'md.html.tag', switchTo: 'embeddedScript', nextEmbedded: 'text/javascript' }
                        }
                    },
                    '@default': { token: 'md.html.tag', next: '@pop' }
                }
            }],
        ],
        embeddedStyle: [
            [/[^<]+/, ''],
            [/<\/style\s*>/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
            [/</, '']
        ],
        embeddedScript: [
            [/[^<]+/, ''],
            [/<\/script\s*>/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
            [/</, '']
        ],
    }
};
