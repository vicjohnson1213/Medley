import { Component, Input } from '@angular/core';

import { AppState } from '../../services';
import { NoteTreeNode } from '../../models';

@Component({
    selector: 'md-note-tree',
    templateUrl: './note-tree.component.html',
    styleUrls: ['./note-tree.component.scss']
})
export class NoteTreeComponent {
    @Input() nodes: NoteTreeNode[];

    constructor(private state: AppState) {}

    selectNode(note: NoteTreeNode) {
        this.state.setActiveNote(note);
    }
}
