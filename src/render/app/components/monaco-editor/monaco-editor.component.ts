import { Component, ViewChild, ElementRef, Input, AfterViewInit, NgZone, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription, merge, fromEvent, Observable, of } from 'rxjs';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { Command } from 'monaco-editor/esm/vs/editor/browser/editorExtensions.js';

import { LightTheme } from './light.theme';
import { MarkdownImproved } from './markdown-improved';

@Component({
    selector: 'md-monaco-editor',
    templateUrl: './monaco-editor.component.html',
    styleUrls: ['./monaco-editor.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MonacoEditorComponent), multi: true }
    ]
})
export class MonacoEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
    private _value = '';
    private _editor: monaco.editor.IStandaloneCodeEditor;
    private _windowResizeSubscription: Subscription;

    @ViewChild('editorContainer') _editorContainer: ElementRef;
    @Input() resize$: Observable<void> = of();
    @Input() options: monaco.editor.IEditorOptions;
    @Input() keybindingOverrides: { [command: string]: false };

    propagateChange = (_: any) => {};
    onTouched = () => {};

    constructor(private zone: NgZone) {}

    ngAfterViewInit() {
        (<any>window).amdRequire(['vs/editor/editor.main'], () => {
            this.initMonaco();
            this.updateKeybinds();
        });
    }

    ngOnDestroy() {
        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }

        if (this._editor) {
            this._editor.dispose();
            this._editor = null;
        }
    }

    writeValue(value: any): void {
        this._value = value || '';
        if (this._editor) {
            this._editor.setValue(this._value);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    focus() {
        if (this._editor) {
            this._editor.focus();
        }
    }

    private initMonaco() {
        const monaco = (<any>window).monaco;

        monaco.editor.defineTheme('light-theme', LightTheme);
        monaco.editor.setTheme('light-theme');
        monaco.languages.register({ id: 'markdown-improved' });
        monaco.languages.setMonarchTokensProvider('markdown-improved', <monaco.languages.IMonarchLanguage>MarkdownImproved);

        this._editor = monaco.editor.create(this._editorContainer.nativeElement, this.options);

        this._editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
            const value = this._editor.getValue();
            this.propagateChange(value);
            this.zone.run(() => this._value = value);
        });

        this._editor.onDidBlurEditorWidget(() => {
            this.onTouched();
        });

        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }

        this._windowResizeSubscription = merge(
            fromEvent(window, 'resize'),
            this.resize$
        ).subscribe(() => this._editor.layout());
    }

    private updateKeybinds() {
        Object.keys(this.keybindingOverrides).forEach(override => {
            if (this.keybindingOverrides[override] === false) {
                // Workaround to disable command from here: https://github.com/Microsoft/monaco-editor/issues/287#issuecomment-331447475
                (<any>this._editor)._standaloneKeybindingService.addDynamicKeybinding(`-${override}`)
            }
        });
    }
}
