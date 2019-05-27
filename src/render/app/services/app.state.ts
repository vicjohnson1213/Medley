import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject, Observable, Observer } from 'rxjs';

import { Note, Config } from '../models';

@Injectable()
export class AppState {
    private ipc: IpcRenderer;

    private selectedTagSub$ = new BehaviorSubject<string>('_All');
    selectedTag$ = this.selectedTagSub$.asObservable();

    private activeNoteSub$ = new BehaviorSubject<Note>(null);
    activeNote$ = this.activeNoteSub$.asObservable();

    private notesSub$ = new BehaviorSubject<Note[]>([]);
    notes$ = this.notesSub$.asObservable();

    createNoteRequest = new EventEmitter();
    updateAvailable = new EventEmitter();
    config: Config;

    constructor(private zone: NgZone) {
        this.ipc = (<any>window).require('electron').ipcRenderer;



        this.ipc.on('getNotesResponse', (events, notes) => {
            this.zone.run(() => {
                this.notesSub$.next(notes);
            });
        });

        this.ipc.on('loadNoteResponse', (event, content) => {
            this.zone.run(() => {
                const note = this.activeNoteSub$.value;
                note.Content = content;
                this.activeNoteSub$.next(note);
            });
        });

        this.ipc.on('createNoteRequest', () => {
            this.createNoteRequest.emit();
        });

        this.ipc.on('noteCreated', (event, note) => {
            this.zone.run(() => {
                const notes = this.notesSub$.value;
                notes.push(note);
                this.notesSub$.next(notes);
                this.activeNoteSub$.next(note);
                this.selectedTagSub$.next(note.Tags[0] || '_All');
            });
        });

        this.ipc.on('updateAvailable', () => {
            this.updateAvailable.emit();
        });
    }

    loadConfig(): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            this.ipc.on('getConfigResponse', (event, config) => {
                this.config = config;
                observer.next()
                observer.complete();
            });

            this.ipc.send('getConfig');
        });
    }

    setActiveNote(note?: Note) {
        this.activeNoteSub$.next(note);
        if (note) {
            this.ipc.send('loadNote', note);
        }
    }

    setSelectedTag(tag?: string) {
        this.selectedTagSub$.next(tag);
    }

    addTagToNote(tag: string, note: Note) {
        if (!note.Tags.includes(tag)) {
            note.Tags.push(tag);
            this.notesSub$.next(this.notesSub$.value);
            this.ipc.send('addTagToNoteRequest', tag, note);
        }
    }

    deleteTagFromNote(tag: string, note: Note) {
        const idx = note.Tags.indexOf(tag);
        note.Tags.splice(idx, 1);
        this.notesSub$.next(this.notesSub$.value);
        this.ipc.send('deleteTagFromNoteRequest', tag, note);
    }

    saveNote(note: Note) {
        this.ipc.send('saveNote', note);
    }

    createNote(name: string) {
        this.ipc.send('createNoteRequest', name);
    }

    attachImage() {
        this.ipc.send('attachImage');
    }

    deleteNote(note: Note) {
        let notes = this.notesSub$.value;
        const idx = notes.indexOf(note);
        notes.splice(idx, 1);
        this.notesSub$.next(notes);
        this.ipc.send('deleteNoteRequest', note);
    }

    initNotes() {
        this.ipc.send('getNotes');
    }
}
