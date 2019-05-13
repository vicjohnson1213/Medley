import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs';

import { Note } from '../models';

@Injectable()
export class AppState {
    private ipc: IpcRenderer;

    private activeNoteSub$ = new BehaviorSubject<Note>(null);
    activeNote$ = this.activeNoteSub$.asObservable();

    private selectedGroupSub$ = new BehaviorSubject<Note>(null);
    selectedGroup$ = this.selectedGroupSub$.asObservable();

    private notesSub$ = new BehaviorSubject<Note[]>([]);
    notes$ = this.notesSub$.asObservable();

    createNoteRequest = new EventEmitter();

    constructor(private zone: NgZone) {
        this.ipc = (<any>window).require('electron').ipcRenderer;
        this.initNotes();

        this.ipc.on('getNotesResponse', (events, tree) => {
            this.zone.run(() => {
                this.notesSub$.next(tree);
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
                this.activeNoteSub$.next(note);
                const selectedGroup = this.selectedGroupSub$.value;
                selectedGroup.Children.push(note);
                this.selectedGroupSub$.next(selectedGroup);
            });
        });
    }

    setActiveNote(note: Note) {
        this.activeNoteSub$.next(note);
        this.ipc.send('loadNote', note.Path);
    }

    setSelectedGroup(note: Note) {
        this.selectedGroupSub$.next(note);
    }

    saveNote(note: Note) {
        this.ipc.send('saveNote', note);
    }

    createNote(name: string, parent?: string) {
        this.ipc.send('createNoteRequest', name, parent);
    }

    initNotes() {
        this.ipc.send('getNotes');
    }
}
