import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl, Validators} from '@angular/forms';
import { GetChangesService } from '../../_messages/getchanges.service';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { DatapageService } from '../../_services/datapage.service';
import {map, startWith} from 'rxjs/operators';
import { ReferenceHelper } from '../../_helpers/reference-helper';
import { GetCaseService } from '../../_messages/getcase.service';
import { Subscription, Observable, of } from 'rxjs';


export interface CompleteOptions {
  key: string;
  value: string;
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup!: FormGroup;
  @Input() noLabel!: boolean;
  @Input() CaseID!: string;
  @Input() RefType$!: string;

  filteredOptions!: Observable<CompleteOptions[]>;

  reference!: string;
  selectedValue!: string;
  options$!: CompleteOptions[];
  valueReadonly$!: string;
  tooltip$!: string;

  showLabel$= false;

  fieldControl = new FormControl();
  actionsHandler: HandleActions | undefined;

  getCaseMessage: any;
  getCaseSubscription!: Subscription;

  constructor(private gchservice: GetChangesService,
              private gaservice: GetActionsService,
              private dpservice: DatapageService,
              private refHelper: ReferenceHelper,
              private gcservice: GetCaseService) { 

    this.actionsHandler = new HandleActions(gaservice);


  }

  ngOnInit() {
    this.selectedValue = this.fieldComp.value;
    this.reference = this.fieldComp.reference;

    this.fieldComp.label = this.refHelper.htmlDecode(this.fieldComp.label);
    this.tooltip$ = "";
    if (this.fieldComp.control.modes.length > 0) {
      this.tooltip$ = this.refHelper.htmlDecode(this.fieldComp.control.modes[0].tooltip);
    }

    // create controlName so can be referenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getUniqueControlID();

    // switches to show to turn off/off getting data from options vs data/clipboard page
    const bUseLocalOptionsForDataPage = localStorage.getItem("useLocalOptionsForDataPage") == "true" ? true : false;
    const bUseLocalOptionsForClipboardPage = localStorage.getItem("useLocalOptionsForClipboardPage") == "true" ? true : false;

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


    // below is examples of how to get data for autocomplete
    // with 8.3, data local/datapage/clipboard page is now available in options, prior have to
    // retreive from data/clipboard page.  Here are examples of how to data from different sources
    // Even though data may be in options, you may choose to get from clipboard/datapage and filter, etc.
    if (this.fieldComp.control.modes[0].listSource === "datapage") {

      if (bUseLocalOptionsForDataPage) {
        // use data from options
        this.options$ = this.fieldComp.control.modes[0].options;

        this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
  
  
        this.filteredOptions = this.fieldControl.valueChanges
        .pipe(
          startWith(''),
          map(value => value ? this._filterOptions(value) : this.options$.slice())
        );
      }
      else {
        // go get data from data page
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

              this.options$ = new Array<CompleteOptions>();
              for (const result of results) {
                const option = <CompleteOptions>{};
                option["key"] = result[entryKey];
                option["value"] = result[entryValue];
                this.options$.push(option);

              }
              
              this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);

              this.filteredOptions = this.fieldControl.valueChanges
              .pipe(
                startWith(''),
                map(value => value ? this._filterOptions(value) : this.options$.slice())
              );


            }
            catch (ex) {
              // do nothing
            }
          },
          err => {
            // do nothing
          }
        );

        this.fieldControl.setValue(this.selectedValue);
      }



      
    }
    else if (this.fieldComp.control.modes[0].listSource === "pageList") {
      if (bUseLocalOptionsForClipboardPage) {
        
        // use clipboard enclosed in options
        this.options$ = this.fieldComp.control.modes[0].options;

        this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
  
  
        this.filteredOptions = this.fieldControl.valueChanges
        .pipe(
          startWith(''),
          map(value => value ? this._filterOptions(value) : this.options$.slice())
        );
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
  
                this.options$ = new Array<CompleteOptions>();
                for (const result of cPage) {
                  const option = <CompleteOptions>{};
                  option["key"] = result[entryKey];
                  option["value"] = result[entryValue];
                  this.options$.push(option);
    
                }
                
                this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
    
                this.filteredOptions = this.fieldControl.valueChanges
                .pipe(
                  startWith(''),
                  map(value => value ? this._filterOptions(value) : this.options$.slice())
                );
              }
            }
          }
  
  
        });
      }
      
    }
    else if (this.fieldComp.control.modes[0].listSource === "locallist") {
      this.options$ = this.fieldComp.control.modes[0].options;

      this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);


      this.filteredOptions = this.fieldControl.valueChanges
      .pipe(
        startWith(''),
        map(value => value ? this._filterOptions(value) : this.options$.slice())
      );

    }


    if (this.fieldComp.required) {
      this.fieldControl.setValidators([Validators.required]);
    }

    if (this.fieldComp.disabled) {
      this.fieldControl.disable();
    }

    this.formGroup.addControl(this.fieldComp.controlName, this.fieldControl);
    this.fieldControl.setValue(this.selectedValue);

    if (this.fieldComp.validationMessages != "") {
      const timer = interval(100).subscribe(() => {
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
  }

  getOptionValue(value: string): string {
    for (const obj of this.options$) {
      if (obj["key"] === value) {
        return this.refHelper.htmlDecode(obj["value"]);
      }
    }

    return "";
}



  fieldChanged(e: any) {

    this.fieldComp.value = e.target.value;
    this.gchservice.sendMessage(this.fieldComp.reference, e.target.value, this.CaseID, this.RefType$);

    this.actionsHandler?.generateActions("change", this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);
  }

  optionChanged(e: any) {

    this.gchservice.sendMessage(this.fieldComp.reference, e.option.value, this.CaseID,this.RefType$);

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

    return errMessage;
  }

  private _filterOptions(value: string): CompleteOptions[] {

    const filterValue = value.toLowerCase();

    return this.options$.filter(option => option.key.toLowerCase().includes(filterValue));
  }
}
