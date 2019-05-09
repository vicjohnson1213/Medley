import { Injectable } from '@angular/core';
import { NoteTreeNode } from '../models';
import { BehaviorSubject, of } from 'rxjs';

@Injectable()
export class AppState {
    private activeNoteSub$ = new BehaviorSubject<NoteTreeNode>(null);
    activeNote$ = this.activeNoteSub$.asObservable();

    private notesSub$ = new BehaviorSubject<NoteTreeNode[]>([]);
    notes$ = this.notesSub$.asObservable();

    constructor() {
        this.initNotes();
    }

    setActiveNote(note: NoteTreeNode) {
        note.Content = `# A header ${note.Path}`;
        this.activeNoteSub$.next(note);
    }

    initNotes() {
        const notes: NoteTreeNode[] = [{
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

        this.notesSub$.next(notes);
    }
}
