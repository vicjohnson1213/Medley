import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SubSink } from 'subsink';

import { AppState } from '../../services';
import { Note } from '../../models';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'md-edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit, OnDestroy {
    private subscriptions = new SubSink();

    addTagForm: FormGroup;
    nameForm: FormGroup;
    activeNote: Note;

    constructor(
        private fb: FormBuilder,
        private state: AppState) {}

    ngOnInit() {
        this.addTagForm = this.fb.group({
            tag: ['']
        });

        this.nameForm = this.fb.group({
            name: ''
        });

        this.nameForm.get('name')
            .valueChanges.pipe(
                debounceTime(500),
                distinctUntilChanged()
            ).subscribe(() => {
                this.updateNoteName();
            });

        this.subscriptions.sink = this.state.activeNote$.subscribe(note => {
            if (!note) {
                return;
            }

            this.activeNote = note;
            this.nameForm.setValue({ name: this.activeNote.Name });
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    updateNoteName() {
        const name = this.nameForm.value.name;
        if (name !== this.activeNote.Name) {
            this.activeNote.Name = name;
            this.state.saveNote(this.activeNote);
        }
    }
    
    addTag() {
        const tag = this.addTagForm.value.tag;
        this.state.addTagToNote(tag, this.activeNote);
        this.addTagForm.reset();
    }

    deleteTag(tag: string) {
        this.state.deleteTagFromNote(tag, this.activeNote);
    }

    deleteNote() {
        this.state.deleteNote(this.activeNote);
        this.state.setActiveNote();
    }
}
