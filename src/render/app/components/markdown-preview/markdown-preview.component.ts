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

        // Add a class to any lists that are actually task lists.
        const oldListItem = marked.Renderer.prototype.listitem;
        marked.Renderer.prototype.listitem = function(text) {
            const isTaskListItem = text.includes('type="checkbox"');

            if (isTaskListItem) {
                return `<li class="task-list-item">${text}</li>\n`;
            }

            return oldListItem(text);
        }

        this.subscriptions.sink = this.state.activeNote$.subscribe(note => {
            if (!note) {
                return;
            }

            let content = note.Content || '';

            content = content.replace('@image', `${this.state.config.RootDirectory}/images`);

            const rendered = marked(content);
            this.renderer.setProperty(this.target.nativeElement, 'innerHTML', rendered);
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}