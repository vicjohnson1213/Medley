import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export const MarkdownImproved = {
    defaultToken: '',
    tokenPostfix: '.md',

    // escape codes
	control: /[\\`*_\[\]{}()#+\-\.!]/,
	noncontrol: /[^\\`*_\[\]{}()#+\-\.!]/,
	escapes: /\\(?:@control)/,

    // escape codes for javascript/CSS strings
    jsescapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,

    // non matched html elements
    empty: [
        'area', 'base', 'basefont', 'br', 'col', 'frame',
        'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param'
    ],
    tokenizer: {
        root: [
            [/^#+/, 'md.heading'],
            [/^\s*>+.*/, 'md.blockquote'],
            [/^\s*([\*\-+:]|\d+\.)\s/, 'md.list'],

            [/^\s*~~~\s*((?:\w|[\/\-#])+)?\s*$/, { token: 'md.code.block', next: '@codeblock' }],
            [/^\s*```\s*((?:\w|[\/\-#])+).*$/, { token: 'md.code.block', next: '@codeblockGithub', nextEmbedded: '$1' }],
            [/^\s*```\s*$/, { token: 'md.code.block', next: '@codeblock' }],

            [/^\-\-\-/, 'md.hr'],
            [/^___/, 'md.hr'],
            [/^\*\*\*/, 'md.hr'],

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

            [/(?:\*\*\*|___)/, 'md.bolditalic', '@bolditalic'],
            [/(?:\*\*|__)/, 'md.bold', '@bold'],
            [/(?:\*|_)/, 'md.italic', '@italic'],

            [/~~(?:[^\\~]|@escapes)+~~/, 'md.strikethrough'],

            [/`/, { token: 'md.code.inline', next: '@inlineCode' }],

            [/!?\[/, { token: 'md.link.bracket', next: '@linkText' }],
        ],

        bolditalic: [
            [/`/, { token: 'md.code.inline', next: '@inlineCode' }],
            [/(?:[^\\*_]|@escapes)/, 'md.bolditalic'],
            [/(?:\*\*\*|___)/, 'md.bolditalic', '@pop']
        ],
        bold: [
            [/`/, { token: 'md.code.inline', next: '@inlineCode' }],
            [/(?:[^\\*_]|@escapes)/, 'md.bold'],
            [/(?:\*\*|__)/, 'md.bold', '@pop']
        ],
        italic: [
            [/`/, { token: 'md.code.inline', next: '@inlineCode' }],
            [/(?:[^\\*_]|@escapes)/, 'md.italic'],
            [/(?:\*|_)/, 'md.italic', '@pop']
        ],

        linkText: [
            [/`/, { token: 'md.code.inline', next: '@inlineCode' }],
            [/(?:[^\\\]]|@escapes)/, 'md.link.text'],
            [/\][\[\(]/, { token: 'md.link.bracket', next: '@linkTarget' }],
            [/\]/, { token: 'md.link.bracket', next: '@pop' }]
        ],
        linkTarget: [
            [/(?:[^\\\]\)]|@escapes)/, 'md.link.target'],
            [/[\]\)]/, { token: 'md.link.bracket', next: '@popall' }],
        ],

        inlineCode: [
            [/(?:[^\\`]|@escapes)/, 'md.code.inline'],
            [/`/, { token: 'md.code.inline', next: '@pop' }]
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
