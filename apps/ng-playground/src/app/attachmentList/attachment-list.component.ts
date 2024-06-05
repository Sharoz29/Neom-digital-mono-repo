import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GetAttachmentsService } from '../_messages/getAttachments.service';
import { CaseService } from '../_services/case.service';
import * as download from "downloadjs";

@Component({
    selector: 'app-attachment-list',
    templateUrl: './attachment-list.component.html',
    styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent implements OnInit {

    @Input() caseID: any;
    attachmentList: any[] = [];
    showLoadingIndicator!: boolean;
    constructor(private getAttachmentsService: GetAttachmentsService,
        private caseService: CaseService) { }

    attachmentsSubscription!: Subscription
    ngOnInit() {
        this.attachmentsSubscription = this.getAttachmentsService.getMessage().subscribe((message: { showAttachments: any; }) => {
            if (message.showAttachments) {
                this.getAttachments();
            }
        });
    }

    getAttachments() {
        this.showLoadingIndicator = true;
        this.caseService.getAttachments(this.caseID).subscribe((response: any) => {
            this.attachmentList = response.body.attachments || [];
            this.showLoadingIndicator = false;
        }, error => {
            this.showLoadingIndicator = false;
        });
    }

    deleteAttachment(file: { ID: any; }) {
        this.caseService.deleteAttachment(file).subscribe(response => {
            if (this.attachmentList?.length > 0) {
                const index = this.attachmentList.findIndex(element => element.ID === file.ID);
                if (index > -1) {
                    this.attachmentList.splice(index, 1);
                }
            }
        });
    }

    downloadAttachment(file: { fileName?: any; ID?: any; }) {
        this.caseService.downloadAttachment(file as any).subscribe((response: any) => {
            download(window.atob(response.body), file.fileName);
        }, error => {
            console.log('error', error);
        });
    }

    ngOnDestroy() {
        this.attachmentsSubscription?.unsubscribe();
    }
}