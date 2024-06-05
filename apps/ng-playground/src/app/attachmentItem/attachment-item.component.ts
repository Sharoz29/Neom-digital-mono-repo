import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-attachment-item',
    templateUrl: './attachment-item.component.html',
    styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent implements OnInit {
    @Input() file!: any;
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onDelete = new EventEmitter<any>();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onDownload = new EventEmitter<any>();
    constructor() { 
        // 
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnInit() {
        // 
    }

    onDownloadClick() {
        this.onDownload.emit(this.file);
    }

    onDeleteClick() {
        this.onDelete.emit(this.file);
    }
}
