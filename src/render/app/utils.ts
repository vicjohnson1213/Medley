import { Note } from './models';

export  function cleanTag(tag: string) {
    return tag.replace(/(?:[^\/]+\/)+/, '');
}

export function padTag(tag: string) {
    const search = /[^\/]+\//g;
    let matches = 0;
    while (search.exec(tag)) {
        matches++;
    }

    return (matches * 16) + 8;
}

export function createTags(notes: Note[]) {
    const tags = [];
    const parts = notes.map(n => n.Tags)
        .reduce((p, c) => p.concat(c), [])
        .map(t => t.split('/'));

    parts.forEach(p => p.reduce((prev, curr) => {
        const joined = prev ? `${prev}/${curr}` : curr;
        tags.push(joined);
        return joined;
    }, ''));

    const uniq = [...new Set(tags)];
    return uniq;
}

export function notesForTag(tag: string, notes: Note[]): Note[] {
    if (!notes) {
        return [];
    }

    if (tag === '_All') {
        return notes;
    } else if (tag === '_Untagged') {
        return notes.filter(n => n.Tags.length === 0);
    }

    return notes.filter(n => n.Tags.some(t => t.startsWith(tag)));
}