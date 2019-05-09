import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AppState } from '../../services';
import { NoteTreeNode } from '../../models';

@Component({
    selector: 'note-page-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
    notes$: Observable<NoteTreeNode[]>;

    constructor(private state: AppState) {}

    ngOnInit() {
        this.notes$ = this.state.notes$;
    }
}
