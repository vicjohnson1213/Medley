import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';

import { AppState } from '../../services';
import { Note } from '../../models';
import * as utils from '../../utils';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'md-tag-tree',
    templateUrl: './tag-tree.component.html',
    styleUrls: ['./tag-tree.component.scss']
})
export class TagTreeComponent implements OnInit, OnDestroy {
    createTags = utils.createTags;
    padTag = utils.padTag;
    cleanTag = utils.cleanTag;
    notesForTag = utils.notesForTag;

    private subscriptions = new SubSink();

    notes: Note[];
    tags: string[];
    selectedTag: string;

    constructor(private state: AppState) {}

    ngOnInit() {
        this.subscriptions.sink = this.state.selectedTag$.subscribe(tag => {
            this.selectedTag = tag;
        });

        this.subscriptions.sink = this.state.notes$
            .subscribe(notes => {
                this.notes = notes;
                this.tags = this.createTags(this.notes);
            });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    selectTag(tag: string) {
        this.state.setSelectedTag(tag);
    }
}