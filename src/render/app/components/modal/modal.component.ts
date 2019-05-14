import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'md-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
    @Output() dismiss = new EventEmitter();

    dismissModal() {
        this.dismiss.emit();
    }
}