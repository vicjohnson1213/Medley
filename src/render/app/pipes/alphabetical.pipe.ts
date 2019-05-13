import { Pipe, PipeTransform } from '@angular/core';
import { Note } from '../models';

@Pipe({ name: 'alphabeticalBy' })
export class AlphabeticalPipe implements PipeTransform {
    transform(notes: string[], prop: string) {
        if (!notes) {
            return notes;
        }

        if (prop) {
            return notes.sort((left, right) => {
                if (left[prop] > right[prop]) {
                    return 1;
                } else if (left[prop] < right[prop]) {
                    return -1;
                }

                return 0;
            });
        }

        return notes.sort();
    }
}