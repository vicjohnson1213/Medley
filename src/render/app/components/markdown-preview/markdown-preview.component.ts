import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
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
        private state: AppState) {}

    ngOnInit() {
        marked.setOptions({
            highlight: function(code, lang, callback) {
                const highlighted = hljs.highlight(lang || 'plaintext', code);
                return highlighted.value;
            }
        });

        this.subscriptions.sink = this.state.activeNote$.subscribe(note => {
            if (!note || !note.Content) {
                return;
            }

            const rendered = marked(note.Content);
            this.renderer.setProperty(this.target.nativeElement, 'innerHTML', rendered);
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}