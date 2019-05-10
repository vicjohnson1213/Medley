import { Injectable, NgZone } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Note } from '../models';
import { BehaviorSubject, of } from 'rxjs';

const notes: Note[] = [{
    Name: 'First',
    Path: 'path/first',
    Children: [{
        Name: 'Second',
        Path: 'path/second',
        Children: [{
            Name: 'Third',
            Path: 'path/third'
        }]
    }, {
        Name: 'Fourth',
        Path: 'path/fourth'
    }, {
        Name: 'Fifth',
        Path: 'path/fifth'
    }]
}, {
    Name: 'Other',
    Path: 'path/other'
}];

@Injectable()
export class AppState {
    private ipc: IpcRenderer;

    private activeNoteSub$ = new BehaviorSubject<Note>(null);
    activeNote$ = this.activeNoteSub$.asObservable();

    private notesSub$ = new BehaviorSubject<Note[]>([]);
    notes$ = this.notesSub$.asObservable();

    constructor(private zone: NgZone) {
        this.ipc = (<any>window).require('electron').ipcRenderer;
        this.initNotes();

        this.ipc.on('getNotesResponse', (events, tree) => {
            this.zone.run(() => {
                notes.push({ Name: 'new', Path: `new x ${notes.length}`});
                this.notesSub$.next(tree);
            });
        });

        this.ipc.on('loadNoteResponse', (event, content) => {
            const note = this.activeNoteSub$.value;
            note.Content = content;
            this.activeNoteSub$.next(note);
        });
    }

    setActiveNote(note: Note) {
        this.activeNoteSub$.next(note);
        this.ipc.send('loadNote', note.Path);
    }

    saveNote(note: Note) {
        this.ipc.send('saveNote', note);
    }

    initNotes() {
        this.ipc.send('getNotes');
    }
}
