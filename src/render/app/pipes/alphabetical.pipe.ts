import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'alphabeticalBy', pure: false })
export class AlphabeticalPipe implements PipeTransform {
    transform(values: string[], prop: string) {
        if (!values) {
            return values;
        }

        return values.sort((left, right) => {
            left = (prop ? left[prop] : left).toLowerCase();
            right = (prop ? right[prop] : right).toLowerCase();

            if (left > right) {
                return 1;
            } else if (left < right) {
                return -1;
            }

            return 0;
        });
    }
}