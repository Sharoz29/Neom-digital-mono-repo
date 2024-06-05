import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl, Validators} from '@angular/forms';
import { GetChangesService } from '../../_messages/getchanges.service';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { DatapageService } from '../../_services/datapage.service';
import { ReferenceHelper } from '../../_helpers/reference-helper';
import { GetCaseService } from "../../_messages/getcase.service";
import { Subscription, Observable, of } from 'rxjs';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
})
export class RadioComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup!: FormGroup;
  @Input() noLabel!: boolean;
  @Input() CaseID!: string;
  @Input() RefType$!: string;



  fieldControl = new FormControl();
  options!: any[];

  reference!: string;
  valueReadonly$!: string;
  radioClass$ = "pega-radio-veritcal";
  showLabel$ = false;
  tooltip$!: string;

  getCaseMessage!: any;
  getCaseSubscription!: Subscription;

  actionsHandler: HandleActions | undefined;

  constructor(private gchservice: GetChangesService,
              private gaservice: GetActionsService,
              private dpservice: DatapageService,
              private refHelper: ReferenceHelper,
              private gcservice: GetCaseService) { 

    this.actionsHandler = new HandleActions(gaservice);

  }

  ngOnInit() {
    this.fieldControl = new FormControl( [ this.fieldComp.value ]);
    this.reference = this.fieldComp.reference;
    this.fieldComp.label = this.refHelper.htmlDecode(this.fieldComp.label);
    this.tooltip$ = "";
    if (this.fieldComp.control.modes.length > 0) {
      this.tooltip$ = this.refHelper.htmlDecode(this.fieldComp.control.modes[0].tooltip);
    }

    // create controlName so can be referenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getUniqueControlID();

    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    }
    else {
      if (this.fieldComp.label != "" ) {
        this.showLabel$ = true;
      }
      else if (this.fieldComp.label == "" && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }

    if (this.fieldComp.control.modes[0].orientation === "horizontal") {
      this.radioClass$ = "pega-radio-horizontal";
    }

    // switches to show to turn off/off getting data from options vs data/clipboard page
    const bUseLocalOptionsForDataPage = localStorage.getItem("useLocalOptionsForDataPage") == "true" ? true : false;
    const bUseLocalOptionsForClipboardPage = localStorage.getItem("useLocalOptionsForClipboardPage") == "true" ? true : false;


    if (this.fieldComp.control.modes[0].listSource === "datapage") {
      // in addition to switches, loadMode will tell you if you have options or have to get it manually
      let bHaveLocalOption = false;
      if (this.fieldComp.control.modes[0].loadMode != null) {
        bHaveLocalOption = this.fieldComp.control.modes[0].loadMode.toLowerCase() == "auto" ? true: false;
      }
      
      if (bUseLocalOptionsForDataPage && bHaveLocalOption) {
         // use data from options
        this.options = this.fieldComp.control.modes[0].options;

        this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
      }
      else {
        // handle data page
        const dataPageName = this.fieldComp.control.modes[0].dataPageID || this.fieldComp.control.modes[0].dataPage;

        // check to see if we have any parameters
        let pPage: any = null;
        const dpParams = this.fieldComp.control.modes[0].dataPageParams;


        if (dpParams.length > 0) {

          pPage = new Object();

          for (const i in dpParams) {
            let sVal : string;
            if (dpParams[i].value != null) {
              sVal = dpParams[i].value;
            }
            else {
              sVal = dpParams[i].valueReference.lastSavedValue;
            }

            pPage[dpParams[i].name] = sVal;
          }
        }

        this.dpservice.getDataPage(dataPageName, pPage).subscribe(
          response => {
            try {
              const results: any = response.body["pxResults"];
              const entryValue = this.fieldComp.control.modes[0].dataPagePrompt;
              const entryKey = this.fieldComp.control.modes[0].dataPageValue;

              this.options = [];
              for (const result of results) {
                const option: Record<string, any> = new Object();
                option["key"] = result[entryKey];
                option["value"] = result[entryValue];
                this.options.push(option);
              }
              
              this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);

            }
            catch (ex) {
              // do nothing
            }
          },
          err => {
            // do nothing
          }
        );
      }

      
    }
    else if (this.fieldComp.control.modes[0].listSource == "pageList") {

           // in addition to switches, loadMode will tell you if you have options or have to get it manually
           let bHaveLocalOption = false;
           if (this.fieldComp.control.modes[0].loadMode != null) {
             bHaveLocalOption = this.fieldComp.control.modes[0].loadMode.toLowerCase() == "auto" ? true: false;
           }
     
           if (bUseLocalOptionsForClipboardPage && bHaveLocalOption) {
     
             // use clipboard enclosed in options
             this.options = this.fieldComp.control.modes[0].options;
     
             this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
           }
           else {
             // go get data from clipboard page
             const clipboardPageName = this.fieldComp.control.modes[0].clipboardPageID;
             const entryValue = this.fieldComp.control.modes[0].clipboardPagePrompt;
             const entryKey = this.fieldComp.control.modes[0].clipboardPageValue;
             const entryTooltip = this.fieldComp.control.modes[0].clipboardPageTooltip;
       
             this.getCaseSubscription = this.gcservice.getMessage().subscribe(message => { 
               this.getCaseMessage = message;
               
               if (message) {
                 const workPage = message.case.content;
       
                 if (workPage) {
                   const cPage = workPage[clipboardPageName];
                   if (cPage) {
       
                     this.options = [];
                     for (const result of cPage) {
                       const option: Record<string, any> = new Object;
                       option["key"] = result[entryKey];
                       option["value"] = result[entryValue];
                       this.options.push(option);
                     }
       
                     this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
                   }
                 }
               }
       
       
             });
           }
    }
    else if (this.fieldComp.control.modes[0].listSource === "locallist") {

      this.options = this.fieldComp.control.modes[0].options;

      this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
    }


    if (this.fieldComp.required) {
      this.fieldControl.setValidators([Validators.required]);
    }

    if (this.fieldComp.disabled) {
      this.fieldControl.disable();
    }

    this.formGroup.addControl(this.fieldComp.controlName, this.fieldControl);
    this.fieldControl.setValue(this.fieldComp.value);

    if (this.fieldComp.validationMessages != "") {
      const  timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({'message': true});
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
        });
    
    }
   

  }

  ngOnDestroy() {
    this.formGroup.removeControl(this.fieldComp.controlName);

    this.actionsHandler = undefined;
    delete this.actionsHandler;

    if (this.getCaseSubscription) {
      this.getCaseSubscription.unsubscribe();
    }
  }

  getOptionValue(value: string): string {
      for (const obj of this.options) {
        if (obj["key"] === value) {
          return this.refHelper.htmlDecode(obj["value"]);
        }
      }

      return "";
  }

  isSelected(buttonValue:string): boolean {
    if (this.fieldComp.value === buttonValue) {
      return true;
    }

    return false;
  }

  fieldChanged(e: { value: string; }) {

    this.fieldComp.value = e.value;
    this.gchservice.sendMessage(this.fieldComp.reference, e.value, this.CaseID, this.RefType$);
    
    let eventName = "";
    // Setting event name from actionSets(if exists) since it will be matched inside generateActions()
    if(this.fieldComp.control.actionSets[0]?.events){
      eventName = this.fieldComp.control.actionSets[0].events[0].event;
    }

    this.actionsHandler?.generateActions(eventName, this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);
  }

  getErrorMessage() {
    let errMessage = "";


    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.fieldComp.validationMessages;
    }
    else if (this.fieldControl.hasError('required')) {
      errMessage = 'You must select a value';
    }
    else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();

    }
 

    return errMessage;
  }

}

export function determineValues(val: any): string {
  if (val.constructor.name === 'array' && val.length > 0) {
     return '' + val[0];
  }
  return '' + val;
}
