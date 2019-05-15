import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SubSink } from 'subsink';

import { AppState } from '../../services';
import { Note } from '../../models';

@Component({
    selector: 'md-edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit {
    private subscriptions = new SubSink();

    addTagForm: FormGroup;
    activeNote: Note;

    constructor(
        private fb: FormBuilder,
        private state: AppState) {}

    ngOnInit() {
        this.addTagForm = this.fb.group({
            tag: ['']
        });

        this.subscriptions.sink = this.state.activeNote$.subscribe(note => {
            this.activeNote = note;
        });
    }
    
    addTag() {
        const tag = this.addTagForm.value.tag;
        this.state.addTagToNote(tag, this.activeNote);
        this.addTagForm.reset();
    }

    deleteTag(tag: string) {
        this.state.deleteTagFromNote(tag, this.activeNote);
    }
}