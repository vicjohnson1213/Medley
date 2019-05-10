import { Component, Input, } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AppState } from '../../services';
import { Note } from '../../models';

@Component({
    selector: 'md-note-tree',
    templateUrl: './note-tree.component.html',
    styleUrls: ['./note-tree.component.scss'],
    animations: [
        trigger('enter', [
            transition(':enter', [
                style({ height: '0', opacity: 0 }),
                animate('100ms', style({ height: '*', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ height: '*', opacity: 1 }),
                animate('100ms', style({ height: '0', opacity: 0 }))
            ])
        ])
    ]
})
export class NoteTreeComponent {
    @Input() notes: Note[] = [];

    constructor(private state: AppState) {}

    click(note: Note) {
        if (note && note.Children) {
            return note.Expanded = !note.Expanded;
        }

        this.state.setActiveNote(note);
    }
}
