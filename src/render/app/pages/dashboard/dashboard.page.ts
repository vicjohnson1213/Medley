import {
    Component, OnInit, OnDestroy, NgZone, EventEmitter,
    ViewChild, HostListener, ElementRef
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SplitComponent } from 'angular-split';
import { Observable, Subscription } from 'rxjs';

import { EditorComponent } from '../../components/editor/editor.component';
import { AppState } from '../../services';
import { Note } from '../../models';

@Component({
    selector: 'note-page-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
    @ViewChild(SplitComponent) splitEl: SplitComponent;
    @ViewChild(EditorComponent) editor: EditorComponent;
    @ViewChild('nameInput') nameInput: ElementRef;

    form: FormGroup;

    private notesSubscription: Subscription;
    private activeNoteSubscription: Subscription;
    private selectedGroupSubscription: Subscription;
    private creationSubscription: Subscription;
    private onDragSubscription: Subscription;

    private resizeEmitter = new EventEmitter();
    resize$ = this.resizeEmitter.asObservable();

    notes: Note[];
    tags: string[];
    selectedTag: string;
    activeNote: Note;
    showModal = false;

    constructor(
        private fb: FormBuilder,
        private zone: NgZone,
        private state: AppState) {}

    ngOnInit() {
        this.form = this.fb.group({
            name: ['', Validators.required]
        });

        this.activeNoteSubscription = this.state.activeNote$.subscribe(note => {
            this.activeNote = note;
            this.editor.focus();
        });

        this.notesSubscription = this.state.notes$.subscribe(notes => {
            this.notes = notes;
            this.tags = this.createTags(this.notes);
        });

        this.onDragSubscription = this.splitEl.dragProgress$.subscribe(() => {
            this.zone.run(() => this.resizeEmitter.emit());
        });

        this.creationSubscription = this.state.createNoteRequest.subscribe(() => {
            this.zone.run(() => {
                this.showModal = true;
                setTimeout(() => this.nameInput.nativeElement.focus());
            });
        });

        this.state.initNotes();
    }

    createTags(notes) {
        const tags = [];
        const parts = notes.map(n => n.Tags)
            .reduce((p, c) => p.concat(c), [])
            .map(t => t.split('/'));

        parts.forEach(p => p.reduce((prev, curr) => {
            const joined = prev ? `${prev}/${curr}` : curr;
            tags.push(joined);
            return joined;
        }, ''));

        const uniq = [...new Set(tags)];
        return uniq;
    }

    ngOnDestroy() {
        this.onDragSubscription.unsubscribe();
        this.creationSubscription.unsubscribe();
        this.notesSubscription.unsubscribe();
        this.activeNoteSubscription.unsubscribe();
    }

    get notesToDisplay(): Note[] {
        return this.notes.filter(n => n.Tags.some(t => t.startsWith(this.selectedTag)));
    }

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.showModal = false;
    }

    createNote() {
        const name = this.form.value.name;
        this.state.createNote(name);
        this.form.reset();
        this.showModal = false;
    }

    dismissModal() {
        this.showModal = false;
    }

    setMode(mode: 'edit' | 'view') {
        console.log('set the display mode here');
    }

    selectNote(note: Note) {
        this.state.setActiveNote(note);
    }

    selectTag(tag: string) {
        this.selectedTag = tag;
    }
}
