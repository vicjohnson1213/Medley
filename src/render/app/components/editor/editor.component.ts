import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { EditorComponent as MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';
import { AppState } from '../../services';
import { Note } from '../../models';

@Component({
    selector: 'md-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
    @Input() resize$: Observable<void>;
    @ViewChild(MonacoEditorComponent) monacoEditor: MonacoEditorComponent;

    private noteSubscription: Subscription;
    private valueSubscription: Subscription;

    note: Note;
    form: FormGroup;

    editorOptions = {
        language: 'markdown-improved',
        theme: 'light-theme',

        autoIndent: true,
        colorDecorators: false,
        contextmenu: false,
        copyWithSyntaxHighlighting: false,
        disableLayerHinting: true,
        dragAndDrop: false,
        folding: false,
        highlightActiveIndentGuide: false,
        hover: {
          enabled: false
        },
        iconsInSuggestions: false,
        lightbulb: {
            enabled: false
        },
        lineDecorationsWidth: 0,
        lineNumbers: 'off',
        links: true,
        minimap: {
            enabled: false
        },
        occurrencesHighlight: false,
        scrollbar: {
            useShadows: false,
            horizontalScrollbarSize: 12,
            verticalScrollbarSize: 12
        },
        snippetSuggestions: 'none',
        wordBasedSuggestions: false,
        wordWrap: 'on',
        wrappingIndent: 'same',
    };

    constructor(
        private fb: FormBuilder,
        private state: AppState) {}

    ngOnInit() {
        this.form = this.fb.group({
            content: ['']
        });

        this.valueSubscription = this.form.get('content').valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(value => {
            this.note.Content = value;
            this.state.saveNote(this.note);
        });

        this.noteSubscription = this.state.activeNote$.pipe(
            filter(note => !!note)
        ).subscribe(note => {
            this.note = note;
            this.form.patchValue({
                content: note.Content
            });
        });
    }

    ngOnDestroy() {
        this.noteSubscription.unsubscribe();
        this.valueSubscription.unsubscribe();
    }

    focus() {
        this.monacoEditor.focus();
    }
}
