import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';
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
    editorOptions = getEditorOptions();
    keybindings = getKeybindings();

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

        this.noteSubscription = this.state.activeNote$.subscribe(note => {
            this.note = note;

            if (this.note) {
                this.form.patchValue({
                    content: note.Content
                });
            }
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

function getEditorOptions(): monaco.editor.IEditorOptions {
    return <monaco.editor.IEditorOptions>{
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
        lineDecorationsWidth: 8,
        lineNumbers: 'off',
        links: true,
        minimap: {
            enabled: false
        },
        occurrencesHighlight: false,
        scrollbar: {
            useShadows: false,
            horizontalScrollbarSize: 6,
            verticalScrollbarSize: 6
        },
        smoothScrolling: true,
        snippetSuggestions: 'none',
        wordBasedSuggestions: false,
        wordWrap: 'on',
        wrappingIndent: 'same',
    };
}

function getKeybindings(): { [command: string]: boolean } {
    return {
        'actions.find': false,
        'actions.findWithSelection': false,
        'cancelSelection': false,
        'closeFindWidget': false,
        'cursorColumnSelectDown': false,
        'cursorColumnSelectLeft': false,
        'cursorColumnSelectPageDown': false,
        'cursorColumnSelectPageUp': false,
        'cursorColumnSelectRight': false,
        'cursorColumnSelectUp': false,
        'editor.action.changeAll': false,
        'editor.action.copyLinesDownAction': false,
        'editor.action.copyLinesUpAction': false,
        'editor.action.deleteLines': false,
        'editor.action.diffReview.next': false,
        'editor.action.diffReview.prev': false,
        'editor.action.indentLines': false,
        'editor.action.insertCursorAtEndOfEachLineSelected': false,
        'editor.action.joinLines': false,
        'editor.action.moveSelectionToNextFindMatch': false,
        'editor.action.nextMatchFindAction': false,
        'editor.action.nextSelectionMatchFindAction': false,
        'editor.action.outdentLines': false,
        'editor.action.previousMatchFindAction': false,
        'editor.action.previousSelectionMatchFindAction': false,
        'editor.action.replaceAll': false,
        'editor.action.replaceOne': false,
        'editor.action.selectAllMatches': false,
        'editor.action.startFindReplaceAction': false,
        'editor.action.trimTrailingWhitespace': false,
        'expandLineSelection': false,
        'lineBreakInsert': false,
        'removeSecondaryCursors': false,
        'scrollLineDown': false,
        'scrollLineUp': false,
        'scrollPageDown': false,
        'scrollPageUp': false,
        'toggleFindCaseSensitive': false,
        'toggleFindInSelection': false,
        'toggleFindRegex': false,
        'toggleFindWholeWord': false,
    };
}