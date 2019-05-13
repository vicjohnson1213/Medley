import { Pipe, PipeTransform } from '@angular/core';
import { Note } from '../models';

@Pipe({ name: 'isFile' })
export class IsFilePipe implements PipeTransform {
    transform(notes: Note[]) {
        if (!notes) {
            return notes;
        }

        return notes.filter(n => n.IsFile);
    }
}