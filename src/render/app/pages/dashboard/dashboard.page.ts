import { Component, OnInit, ViewChild, NgZone, EventEmitter, OnDestroy } from '@angular/core';
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

    notes$: Observable<Note[]>;
    
    private onDrag$: Subscription;
    private resizeEmitter = new EventEmitter();
    resize$ = this.resizeEmitter.asObservable();

    constructor(
        private state: AppState,
        private zone: NgZone) {}

    newNote() {
        console.log('create a new note here');
    }

    setMode(mode: 'edit' | 'view') {
        console.log('set the display mode here');
    }

    ngOnInit() {
        this.notes$ = this.state.notes$;
        this.onDrag$ = this.splitEl.dragProgress$.subscribe(() => {
            this.zone.run(() => this.resizeEmitter.emit());
        });
    }

    ngOnDestroy() {
        this.onDrag$.unsubscribe();
    }
}
