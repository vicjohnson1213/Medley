const { dialog } = require('electron');
const path = require('path');
const rawFs = require('fs');
const fs = rawFs.promises;
const fsConstants = rawFs.constants;
const frontMatter = require('front-matter');
const EventEmitter = require('events').EventEmitter;

const constants = require('./constants');
const utils = require('./utils');

const batchImportComplete = new EventEmitter();
module.exports.batchImportComplete = batchImportComplete;

module.exports.importFromNotable = importFromNotable;
function importFromNotable() {
    return new Promise((resolve, reject) => {
        dialog.showOpenDialog({
            defaultPath: constants.HOME,
            properties: ['openDirectory', 'showHiddenFiles']
        }, (notableDir) => {
            if (!notableDir) {
                return;
            }

            const notesDir = path.join(notableDir[0], 'notes');
            fs.readdir(notesDir)
                .then(notes => {
                    const notePaths = notes.map(note => path.join(notesDir, note));
                    return Promise.all(notePaths.map(notePath => fs.readFile(notePath, 'utf8')));
                })
                .then(notes => {
                    notes = notes.map(note => {
                        const content = frontMatter(note);
                        return {
                            Name: content.attributes.title,
                            Path: `${path.join(constants.NOTES_DIR, content.attributes.title)}.md`,
                            Tags: content.attributes.tags || [],
                            Content: content.body
                        };
                    });

                    batchAdd(notes)
                        .then(() => {
                            batchImportComplete.emit('complete');
                            resolve();
                        });
                })
                .catch(err => reject(err));
        });
    });
}

function batchAdd(notes) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const existingPaths = manifest.Notes.map(n => n.Path);

    notes.forEach(note => {
        const content = note.Content;
        delete note.Content;

        let attempt = 0;
        while (existingPaths.includes(note.Path)) {
            const filename = note.Name + (attempt > 0 ? ` (${attempt})` : '') + '.md';
            note.Path = path.join(constants.NOTES_DIR, filename);
            attempt++;
        }

        existingPaths.push(note.Path);
        manifest.Notes.push(note);
        fs.writeFile(note.Path, content);
    });

    return fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}

module.exports.getNotes = getNotes;
function getNotes() {
    return new Promise((resolve) => {
        const manifest = utils.requireUncached(constants.MANIFEST_FILE);
        const notes = manifest.Notes.map(note => {
            return {
                Name: note.Name,
                Path: note.Path,
                Tags: note.Tags
            }
        });
    
        resolve(notes);
    });
}

module.exports.loadNote = loadNote;
function loadNote(note) {
    return fs.readFile(note.Path, 'utf-8');
}

module.exports.saveNote = saveNote;
function saveNote(note) {
    const content = note.Content;
    delete note.Content;
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const idx = manifest.Notes.findIndex(n => n.Path === note.Path);
    manifest.Notes.splice(idx, 1, note);
    fs.writeFile(note.Path, content);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}


module.exports.addTagToNote = addTagToNote;
function addTagToNote(tag, note) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const wholeNote = manifest.Notes.find(n => n.Path === note.Path);
    wholeNote.Tags.push(tag);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}

module.exports.createNote = createNote;
function createNote(name) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const existingPaths = manifest.Notes.map(n => n.Path);

    const parts = name.split('/').map(p => p.trim());
    const noteName = parts.pop();
    const tag = parts.join('/');
    let fileName = noteName;
    let fullName = `${fileName}.md`;
    let filepath = path.join(constants.NOTES_DIR, fullName);

    let attempt = 0;
    while (existingPaths.includes(filepath)) {
        fileName = note.Name + (attempt > 0 ? ` (${attempt})` : '');
        fullName = `${fileName}.md`;
        filepath = path.join(constants.NOTES_DIR, fullName);
        attempt++;
    }

    const newNote = {
        Name: noteName,
        Path: filepath,
        Tags: tag.length ? [tag] : []
    };

    manifest.Notes.push(newNote);

    return Promise.all([
        fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2)),
        fs.writeFile(filepath, '', { flag: 'wx' })
    ]).then(() => newNote);
}

module.exports.attachImage = attachImage;
function attachImage() {
    return new Promise((resolve, reject) => {
        dialog.showOpenDialog({ 
            defaultPath: constants.HOME,
            properties: ['openFile']
        }, (imagePath) => {
            if (!imagePath) {
                return;
            }

            const filename = path.basename(imagePath[0]).replace(/\s+/g, '-');
            const newPath = path.join(constants.IMAGES_DIR, filename);
            fs.copyFile(imagePath[0], newPath, fsConstants.COPYFILE_EXCL)
                .then(() => resolve(filename));
        });
    });
}

module.exports.deleteNote = deleteNote
function deleteNote(note) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const idx = manifest.Notes.findIndex(n => n.Path === note.Path);
    manifest.Notes.splice(idx, 1);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2))
        .then(() => fs.unlink(note.Path));
}

module.exports.deleteTagFromNote = deleteTagFromNote;
function deleteTagFromNote(tag, note) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const wholeNote = manifest.Notes.find(n => n.Path === note.Path);
    const tagIdx = wholeNote.Tags.indexOf(tag);
    wholeNote.Tags.splice(tagIdx, 1);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}
