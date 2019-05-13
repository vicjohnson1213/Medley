import { Component, Input, Output, EventEmitter } from '@angular/core';

import { expandInOut } from '../../animations';
import { Note } from '../../models';

@Component({
    selector: 'md-note-tree',
    templateUrl: './note-tree.component.html',
    styleUrls: ['./note-tree.component.scss'],
    animations: [expandInOut]
})
export class NoteTreeComponent {
    @Input() notes: Note[] = [];
    @Output() select = new EventEmitter<Note>();

    click(note: Note) {
        // if (note && note.Children) {
        //     return note.Expanded = !note.Expanded;
        // }

        this.select.emit(note);
    }
}
