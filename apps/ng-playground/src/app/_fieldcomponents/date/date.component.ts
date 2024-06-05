import { Component, OnInit, Input } from '@angular/core';
import { GetChangesService } from '../../_messages/getchanges.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { ReferenceHelper } from '../../_helpers/reference-helper';

import * as moment from "moment";

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup!: FormGroup;
  @Input() noLabel!: boolean;
  @Input() CaseID!: string;
  @Input() RefType$!: string;

  reference!: string;
  selectedValue!: string;
  displayValue$: FormControl = new FormControl('', null);
  showLabel$= false;
  tooltip$!: string;

  fieldControl = new FormControl();
  actionsHandler: HandleActions | undefined;
  maxDate: Date | null = null;
  minDate: Date | null = null;

  constructor(private gcservice: GetChangesService,
              private gaservice: GetActionsService,
              private refHelper: ReferenceHelper) { 

    this.actionsHandler = new HandleActions(gaservice);

  }

  ngOnInit() {
    this.selectedValue = this.refHelper.htmlDecode(this.fieldComp.value);
    this.fieldComp.label = this.refHelper.htmlDecode(this.fieldComp.label);
    this.tooltip$ = "";
    if (this.fieldComp.control.modes.length > 0) {
      this.tooltip$ = this.refHelper.htmlDecode(this.fieldComp.control.modes[0].tooltip);
    }
    
    this.reference = this.fieldComp.reference;

    // create controlName so can be referenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getUniqueControlID();

    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    }
    else {
      if (this.fieldComp.label != "") {
        this.showLabel$ = true;
      }
      else if (this.fieldComp.label == "" && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }

    if (this.fieldComp.required) {
      this.fieldControl.setValidators([Validators.required]);
    }

    this.formGroup.addControl(this.fieldComp.controlName, this.fieldControl);

    if (this.fieldComp.value != "") {
      const givenDate = new Date(moment(this.fieldComp.value, "YYYYMMDD").format("MM/DD/YYYY"));
      this.displayValue$ = new FormControl(givenDate.toISOString());
    }
    else {
      this.displayValue$ = new FormControl();
    }

    // store this format in the fieldControl
    this.fieldControl.setValue(this.displayValue$.value);


    
    if (this.fieldComp.validationMessages != "") {
      const timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({'message': true});
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
        });
    
    }

    if (this.fieldComp.control.modes.length > 0) {
      const mode = this.fieldComp.control.modes[0];
      if (!(mode.futureDateRange === "0" && mode.pastDateRange === "0")) {
        // To set maxDate/FutureDateRange for DatePicker
        if (mode.useFutureDateRange) {
          const date = new Date();
          this.maxDate = new Date(date.getFullYear() + Number(mode.futureDateRange), date.getMonth(), date.getDate());
        } else if (mode.useFutureDateRange === false) {
          this.maxDate = new Date();
        }
        // To set minDate/PastDateRange for DatePicker
        if (mode.usePastDateRange) {
          const date = new Date();
          this.minDate = new Date(date.getFullYear() - Number(mode.pastDateRange), date.getMonth(), date.getDate());
        } else if (mode.usePastDateRange === false) {
          this.minDate = new Date();
        }
      }
    }
    
  }

  ngOnDestroy() {
    this.formGroup.removeControl(this.fieldComp.controlName);

    this.actionsHandler = undefined;
    delete this.actionsHandler;
  }


  fieldDateChanged(dateValue: string) {
    const formattedDate = moment(dateValue, "MM/DD/YYYY").format("YYYYMMDD");

    this.fieldComp.value = formattedDate;
    this.gcservice.sendMessage(this.fieldComp.reference, formattedDate, this.CaseID, this.RefType$);

    this.actionsHandler?.generateActions("change", this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);  
  }

  fieldChanged(e: any) {
    const formattedDate = moment(e.target.value, "MM/DD/YYYY").format("YYYYMMDD");
    this.gcservice.sendMessage(this.fieldComp.reference, formattedDate, this.CaseID, this.RefType$);

    this.actionsHandler?.generateActions("change", this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);
  }

  fieldBlur(e: any) {
    this.actionsHandler?.generateActions("blur", this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);
  }

  fieldClick(e: any) {
    this.actionsHandler?.generateActions("click", this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);
  }



  getErrorMessage() {
    let errMessage = "";


    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.fieldComp.validationMessages;
    }
    else if (this.fieldControl.hasError('required')) {

      errMessage = 'You must enter a value';
    }
    else if (this.fieldControl.errors) {

      errMessage = this.fieldControl.errors.toString();

    }
 
    if (this.fieldControl.errors) {
      console.log("email error:" + JSON.stringify(this.fieldControl.errors) + ", " + errMessage + "," + this.fieldControl.valid);
      }
  

    return errMessage;
  }
}
