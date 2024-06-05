import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from '../../_services/case.service';
import { GetAttachmentsService } from '../../_messages/getAttachments.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-attachment',
    templateUrl: './attachment.component.html',
    styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {

    constructor(private caseService: CaseService,
        private getAttachmentsService: GetAttachmentsService) {

    }
    showLoadingIndicator!: boolean;
    showAttachmentsPanel!: boolean;
    @Input() CaseID!: string;
    @Input() RefType$!: string;
    @Input() fieldComp!: any;
    @Input() noLabel!: boolean;
    attachmentsSubscription!: Subscription
    ngOnInit() {
        this.attachmentsSubscription = this.getAttachmentsService.getMessage().subscribe(response => {
            this.showAttachmentsPanel = response.showAttachments
        });
    }

    handleFileInput(event: Event & { target: HTMLInputElement} | any) {
        const files = event.target.files;
        const formData = new FormData();
        const arFiles: any = Array.from(files || []);
        formData.append("appendUniqueIdToFileName", 'true');
        arFiles.forEach((file: any) => {
            formData.append("arrayOfFiles", file);
        });
        this.showLoadingIndicator = true;
        this.caseService.uploadAttachments(formData).subscribe((response: any) => {
            const res = response.body;
            const attachments: any[] = [];
            let oAttachment;
            arFiles.forEach((file: any) => {
                oAttachment = {
                    type: "File",
                    category: "File",
                    ID: res.ID,
                    name: file.name,
                };
                attachments.push(oAttachment);
            });
            this.saveAttachments(attachments);
        }, error => {
            this.showLoadingIndicator = false;
            console.log('error', error);
        });
    }

    saveAttachments(attachments: any) {
        this.caseService.saveAttachments(attachments, this.CaseID).subscribe(response => {
            this.showLoadingIndicator = false;
            this.getAttachmentsService.sendMessage(this.showAttachmentsPanel);
        }, error => {
            this.showLoadingIndicator = false;
            console.log('error', error);
        });
    }

    ngOnDestroy() {
        this.attachmentsSubscription?.unsubscribe();
    }
}