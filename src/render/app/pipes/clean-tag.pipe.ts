import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cleanTag' })
export class CleanTagPipe implements PipeTransform {
    transform(tag: string) {
        if (tag === '_All' || tag === '_Untagged') {
            return '';
        }

        return tag;
    }
}