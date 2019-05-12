import { trigger, style, animate, transition } from '@angular/animations';

export const expandInOut = trigger('expandInOut', [
    transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('100ms ease-in-out', style({ height: '*', opacity: 1 }))
    ]),
    transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('100ms ease-in-out', style({ height: '0', opacity: 0 }))
    ])
]);
