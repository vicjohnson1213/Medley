import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { filter, debounceTime, tap, switchMap } from 'rxjs/operators';

import { AppState } from '../../services';
import { Note } from '../../models';

@Component({
    selector: 'md-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
    @Input() resize$: Observable<void>;

    private noteSubscription: Subscription;
    private valueSubscription: Subscription;

    note$: Observable<Note>;

    content: FormControl;

    editorOptions = {
        autoIndent: true,
        contextmenu: false,
        dragAndDrop: false,
        language: 'markdown',
        lineNumbers: 'off',
        links: true,
        minimap: {
            enabled: false
        },
        renderWhitespace: 'all',
        wordWrap: 'on',
    };

    constructor(private state: AppState) {}

    ngOnInit() {
        this.note$ = this.state.activeNote$;
        this.noteSubscription = this.note$.pipe(
            filter(note => !!note)
        ).subscribe(note => {
            this.content = new FormControl(note.Content);
            this.valueSubscription = this.content.valueChanges.pipe(
                debounceTime(1000)
            ).subscribe(value => {
                note.Content = value;
                this.state.saveNote(note);
            });
        });
    }

    ngOnDestroy() {
        this.noteSubscription.unsubscribe();
        this.valueSubscription.unsubscribe();
    }
}
