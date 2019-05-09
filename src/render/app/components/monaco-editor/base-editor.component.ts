import { AfterViewInit, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxMonacoEditorConfig } from './config';


let loadedMonaco = false;
let loadPromise: Promise<void>;
declare const require: any;

export abstract class BaseEditor implements AfterViewInit, OnDestroy {
    @ViewChild('editorContainer') _editorContainer: ElementRef;
    @Output() onInit = new EventEmitter<any>();
    protected _editor: any;
    private _options: any;
    protected _windowResizeSubscription: Subscription;

    @Input('options')
    set options(options: any) {
        this._options = Object.assign({}, this.config.defaultOptions, options);
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(options);
        }
    }

    get options(): any {
        return this._options;
    }

    constructor(private config: NgxMonacoEditorConfig) { }

    ngAfterViewInit(): void {
        // const onGotAmdLoader = () => {
        //     // Load monaco
        //     (<any>window).require(["vs/editor/editor.main"], () => {
        //         this.initMonaco(this.options);
        //     });
        // };

        // const nodeRequire = require;
        // const loader = require('monaco-editor/dev/vs/loader');


        // // const require = loader.require;

        // require.config({
        //     baseUrl: `assets`
        // });

        // (<any>window).module = undefined;

        (<any>window).amdRequire(['vs/editor/editor.main'], () => {
            this.initMonaco(this.options);
        });
    }

    protected abstract initMonaco(options: any): void;

    ngOnDestroy() {
        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }
        if (this._editor) {
            this._editor.dispose();
            this._editor = undefined;
        }
    }
}

