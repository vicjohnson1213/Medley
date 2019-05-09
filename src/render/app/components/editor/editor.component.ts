import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter, debounceTime, tap, switchMap } from 'rxjs/operators';

import { AppState } from '../../services';
import { NoteTreeNode } from '../../models';

@Component({
    selector: 'md-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
    note$: Observable<NoteTreeNode>;
    content: FormControl;

    editorOptions = {
        autoIndent: true,
        contextmenu: false,
        dragAndDrop: false,
        language: 'markdown',
        lineNumbers: 'off',
        minimap: {
            enabled: false
        },
        renderWhitespace: 'all',
        wordWrap: 'on',
    };

    constructor(private state: AppState) {}

    ngOnInit() {
        this.note$ = this.state.activeNote$;
        this.note$.pipe(
            filter(note => !!note),
            tap(note => this.content = new FormControl(note.Content)),
            switchMap(() => this.content.valueChanges),
            debounceTime(1000)
        ).subscribe(value => {
            // save the updated content here.
        });
    }

    ngOnDestroy() {
    }
}
