import { Pipe, PipeTransform } from '@angular/core';
import { Note } from '../models';

@Pipe({ name: 'sortTree' })
export class SortTreePipe implements PipeTransform {
    transform(notes: Note[]) {
        if (!notes) {
            return notes;
        }

        return notes.sort((left, right) => {
            if (left.IsFile && !right.IsFile) {
                return 1;
            } else if (!left.IsFile && right.IsFile) {
                return -1;
            }

            return left.Name > right.Name ? 1 : -1;
        });
    }
}