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
    showModal = false;
    showEditMenu = false;

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
            this.editor.focus();

            if (!note) {
                this.showEditMenu = false;
            }
        });

        this.subscriptions.sink = this.state.notes$.subscribe(notes => {
            this.notes = notes;
        });

        this.subscriptions.sink = this.state.createNoteRequest.subscribe(() => {
            this.zone.run(() => {
                this.showModal = true;
                setTimeout(() => this.nameInput.nativeElement.focus());
            });
        });

        this.state.initNotes();
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.dismissModal();
    }

    get notesToDisplay(): Note[] {
        return this.notesForTag(this.selectedTag, this.notes);
    }

    createNote() {
        const name = this.newNoteForm.value.name;
        this.state.createNote(name);
        this.newNoteForm.reset();
        this.showModal = false;
    }

    onEditorResized() {
        this.resizeEmitter.emit()
    }

    toggleEdit() {
        this.showEditMenu = !this.showEditMenu;
    }

    dismissModal() {
        this.showModal = false;
    }

    selectNote(note: Note) {
        this.state.setActiveNote(note);
    }
}
