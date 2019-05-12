import { Component, OnInit, ViewChild, NgZone, EventEmitter, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SplitComponent } from 'angular-split';
import { Observable, Subscription } from 'rxjs';

import { AppState } from '../../services';
import { Note } from '../../models';

@Component({
    selector: 'note-page-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
    @ViewChild(SplitComponent) splitEl: SplitComponent;
    form: FormGroup;

    private creationSubscription: Subscription;
    private onDragSubscription: Subscription;

    private resizeEmitter = new EventEmitter();
    resize$ = this.resizeEmitter.asObservable();

    notes$: Observable<Note[]>;
    activeNote$: Observable<Note>
    showModal = false;

    constructor(
        private fb: FormBuilder,
        private zone: NgZone,
        private state: AppState) {}

    ngOnInit() {
        this.notes$ = this.state.notes$;
        this.activeNote$ = this.state.activeNote$;

        this.form = this.fb.group({
            name: ['', Validators.required]
        });

        this.onDragSubscription = this.splitEl.dragProgress$.subscribe(() => {
            this.zone.run(() => this.resizeEmitter.emit());
        });

        this.creationSubscription = this.state.createNoteRequest.subscribe(() => {
            this.zone.run(() => this.showModal = true);
        });
    }

    ngOnDestroy() {
        this.onDragSubscription.unsubscribe();
        this.creationSubscription.unsubscribe();
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
}
