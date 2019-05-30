import {
    Component, OnInit, OnDestroy, NgZone, EventEmitter,
    ViewChild, HostListener, ElementRef
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SplitComponent } from 'angular-split';
import { SubSink } from 'subsink';

import { EditorComponent } from '../../components/editor/editor.component';
import { AppState } from '../../services';
import { Note } from '../../models';
import * as utils from '../../utils';

@Component({
    selector: 'note-page-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
    notesForTag = utils.notesForTag;

    @ViewChild(SplitComponent) splitEl: SplitComponent;
    @ViewChild(EditorComponent) editor: EditorComponent;
    @ViewChild('nameInput') nameInput: ElementRef;

    private subscriptions = new SubSink();
    private resizeEmitter = new EventEmitter();
    resize$ = this.resizeEmitter.asObservable();

    newNoteForm: FormGroup;
    notes: Note[];
    selectedTag: string;
    activeNote: Note;
    showNewNoteModal = false;
    showEditMenu = false;
    previewMode = true;

    constructor(
        private fb: FormBuilder,
        private zone: NgZone,
        private state: AppState) {}

    ngOnInit() {
        this.newNoteForm = this.fb.group({
            name: ['', Validators.required]
        });

        this.subscriptions.sink = this.state.selectedTag$.subscribe(tag => {
            this.selectedTag = tag;
        });

        this.subscriptions.sink = this.state.activeNote$.subscribe(note => {
            this.activeNote = note;
            if (!this.previewMode && this.activeNote) {
                this.editor.focus();
            }

            if (!note) {
                this.showEditMenu = false;
            }
        });

        this.subscriptions.sink = this.state.notes$.subscribe(notes => {
            this.notes = notes;
        });

        this.subscriptions.sink = this.state.createNoteRequest.subscribe(() => {
            this.zone.run(() => this.showCreateNote());
        });

        this.subscriptions.sink = this.state.loadConfig().subscribe(() => {
            this.state.initNotes();
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        let modifier;

        if (process.platform === 'darwin') {
            modifier = event.metaKey;
        } else {
            modifier = event.ctrlKey;
        }

        if (key === 'escape') {
            this.dismissModals();
        } else if (modifier && key === 's') {
            this.togglePreview(true);
        } else if (modifier && key === 'e') {
            this.togglePreview(false);
        } else if (modifier && key === 'd') {
            this.toggleEdit();
        }
    }

    get notesToDisplay(): Note[] {
        return this.notesForTag(this.selectedTag, this.notes);
    }

    showCreateNote() {
        this.showNewNoteModal = true;
        if (this.selectedTag && this.selectedTag !== '_All' && this.selectedTag !== '_Untagged') {
            this.newNoteForm.patchValue({
                name: `${this.selectedTag}/`
            });
        }

        setTimeout(() => this.nameInput.nativeElement.focus());
    }

    createNote() {
        const name = this.newNoteForm.value.name;
        this.state.createNote(name);
        this.newNoteForm.reset();
        this.showNewNoteModal = false;
    }

    attachImage() {
        this.state.attachImage();
    }

    onEditorResized() {
        this.resizeEmitter.emit()
    }

    toggleEdit() {
        this.showEditMenu = this.activeNote ? !this.showEditMenu : false;
    }

    dismissModals() {
        this.showNewNoteModal = false;
    }

    selectNote(note: Note) {
        this.state.setActiveNote(note);
    }

    togglePreview(value?: boolean) {
        this.previewMode = value !== undefined ? value : !this.previewMode;
        
        if (!this.previewMode) {
            setTimeout(() => this.editor.focus());
        }
    }
}
