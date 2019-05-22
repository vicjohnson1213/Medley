import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cleanTag' })
export class CleanTagPipe implements PipeTransform {
    transform(tag: string) {
        if (tag === '_All') {
            return 'All Notes';
        } else if (tag === '_Untagged') {
            return 'Untagged Notes';
        }

        return tag;
    }
}
