import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ComponentCommunicationService } from '../../../_services/custom/componentCommunication.service';

@Component({
  selector: 'form-full-width',
  templateUrl: './form-full-width.component.html',
  styleUrls: ['./form-full-width.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class Pega_Extensions_FormFullWidth implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: any;

  constructor(private communicationService: ComponentCommunicationService) {}

  configProps$: any;
  heading$: string;
  caseID$: string;
  attachmentUtils: any;
  arFullListAttachments: any[] = [];

  ngOnInit(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as any;
    this.heading$ = this.configProps$.heading;
    this.caseID$ = this.pConn$.getCaseSummary().ID;
    this.attachmentUtils = PCore.getAttachmentUtils();

    this.fetchCaseAttachments(this.caseID$).then(att => {
      if (att.extension === 'pdf') {
        PCore.getAttachmentUtils().uploadAttachment(att, this.onUploadProgress, this.errorHandler, '');
        PCore.getAttachmentUtils().linkAttachmentsToCase(this.caseID$, att, att.type, '');
      }
    });
    this.communicationService.triggerUpdate();
  }

  onUploadProgress() {}

  errorHandler() {}

  fetchCaseAttachments(caseID) {
    return this.attachmentUtils.getCaseAttachments(caseID, '', true);
  }
}
