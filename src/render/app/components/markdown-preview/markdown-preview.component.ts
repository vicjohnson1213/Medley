import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SubSink } from 'subsink';
import * as marked from 'marked';
import hljs from 'highlight.js';

import { AppState } from '../../services';

@Component({
    selector: 'md-markdown-preview',
    templateUrl: './markdown-preview.component.html',
    styleUrls: ['./markdown-preview.component.scss']
})
export class MarkdownPreviewComponent implements OnInit, OnDestroy {
    @ViewChild('target') target: ElementRef;
    private subscriptions = new SubSink();

    constructor(
        private renderer: Renderer2,
        private change: ChangeDetectorRef,
        private state: AppState) {}

    ngOnInit() {
        marked.setOptions({
            highlight: function(code, lang, callback) {
                const highlighted = hljs.highlight(lang || 'plaintext', code);
                return highlighted.value;
            }
        });

        this.subscriptions.sink = this.state.activeNote$.subscribe(note => {
            if (!note) {
                return;
            }

            let content = note.Content || '';

            content = content.replace('@image', `${this.state.config.RootDirectory}/images`);

            const rendered = marked(content);
            this.renderer.setProperty(this.target.nativeElement, 'innerHTML', rendered);

            // const images = <HTMLElement[]>this.target.nativeElement.querySelectorAll('img');

            // images.forEach((img) => {
            //     img.setAttribute('src', `${this.state.config.RootDirectory}/images/roses-pxl.jpg`);
            // });

            // this.change.detectChanges();
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}