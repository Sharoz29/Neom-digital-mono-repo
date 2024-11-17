import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { ErrorMessagesService } from '../../../_messages/error-messages.service';
import { ReferenceComponent } from '../../infra/reference/reference.component';

@Component({
  selector: 'app-multi-step',
  templateUrl: './multi-step.component.html',
  styleUrls: ['./multi-step.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class MultiStepComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() arMainButtons$: any[];
  @Input() arSecondaryButtons$: any[];
  @Input() arChildren$: any[];
  @Input() bIsVertical$: boolean;
  @Input() arCurrentStepIndicies$: number[];
  @Input() arNavigationSteps$: any[];
  @Output() actionButtonClick: EventEmitter<any> = new EventEmitter();

  svgCurrent$: string;
  svgNotCurrent$: string;
  bShow$ = true;
  currentStepIndex: number = 0;
  classId$: string;
  Id$$: string;
  bLogging = true;

  constructor(private utils: Utils, private psService: ProgressSpinnerService, private erService: ErrorMessagesService) {}

  ngOnInit(): void {
    this.svgCurrent$ = this.utils.getImageSrc('circle-solid', this.utils.getSDKStaticContentUrl());
    this.svgNotCurrent$ = this.utils.getImageSrc('circle-solid', this.utils.getSDKStaticContentUrl());
  }

  onActionButtonClick(oData: any) {
    this.actionButtonClick.emit(oData);
  }

  _getVIconClass(status): string {
    if (status == 'current') {
      return 'psdk-vertical-step-icon-selected';
    }

    return 'psdk-vertical-step-icon';
  }

  _getVLabelClass(status): string {
    if (status == 'current') {
      return 'psdk-vertical-step-label-selected';
    }

    return 'psdk-vertical-step-label';
  }

  _getVBodyClass(index: number): string {
    const baseClass = 'psdk-vertical-step-body';
    if (index === this.currentStepIndex) {
      return `${baseClass} active-step`;
    }
    return baseClass;
  }

  _getHIconClass(status, index: number): string {
    const baseClass = status === 'current' ? 'psdk-horizontal-step-icon-selected' : 'psdk-horizontal-step-icon';
    if (index === this.currentStepIndex) {
      return `${baseClass} active-step`;
    }
    return baseClass;
  }

  updateChanges() {
    this.pConn$ = ReferenceComponent.normalizePConn(this.pConn$);
  }

  navigateToStep(index: number): void {
    this.arNavigationSteps$[this.arCurrentStepIndicies$[0]].visited_status = 'success';
    this.arNavigationSteps$[this.arCurrentStepIndicies$[0]].step_status = 'completed';
    this.arNavigationSteps$[index].visited_status = 'current';
    this.arNavigationSteps$[index].step_status = '';
    this.arCurrentStepIndicies$ = [index];

    this.classId$ = this.pConn$.getCurrentClassID();
    this.Id$$ = this.pConn$.getCaseSummary().ID;

    const containerName = this.pConn$.getContainerName();
    const id = `ASSIGN-WORKLIST ${this.Id$$}!PAPERWORKSUBMISSION`;

    const options = {
      containerName: containerName,
      channelName: '',
      isActionFromToDoList: true,
      target: '',
      context: null,
      isChild: false,
      viewType: 'form',
      skipBrowserSemanticUrlUpdate: false
    };

    this.psService.sendMessage(true);
    const eventEmitter = new EventEmitter();

    console.log(
      this.pConn$.getCaseStages(),
      'sharoz',
      this.arNavigationSteps$[this.arCurrentStepIndicies$[0]].actionID,
      PCore.getContainerUtils().CONTAINER_NAMES
    );

    this.pConn$
      .getActionsApi()
      .openLocalAction(this.arNavigationSteps$[this.arCurrentStepIndicies$[0]].actionID, {
        target: '.AppointmentInformation.FaceToFace.CertificateOfHomeboundStatus',
        caseID: this.Id$$,
        containerName: 'modal',
        type: 'Case',
        assignKey: ''
      })
      .then(res => {
        console.log(res, 'sharoz');
      });

    console.log(this.pConn$.getActions(), this.arNavigationSteps$, containerName);
  }

  _getHLabelClass(status): string {
    if (status == 'current') {
      return 'psdk-horizontal-step-label-selected';
    }

    return 'psdk-horizontal-step-label';
  }

  _showHLine(index: number): boolean {
    return index < this.arNavigationSteps$.length - 1;
  }
}
