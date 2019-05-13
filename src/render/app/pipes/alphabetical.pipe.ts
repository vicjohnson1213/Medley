import { Pipe, PipeTransform } from '@angular/core';
import { Note } from '../models';

@Pipe({ name: 'alphabetical' })
export class AlphabeticalPipe implements PipeTransform {
    transform(notes: Note[]) {
        if (!notes) {
            return notes;
        }

        return notes.sort();
    }
}