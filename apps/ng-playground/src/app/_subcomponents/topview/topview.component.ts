import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { GetViewService } from '../../_messages/getview.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GetGroupsService } from '../../_messages/getgroups.service';
import * as _ from "lodash";


@Component({
  selector: 'app-topview',
  templateUrl: './topview.component.html',
  styleUrls: ['./topview.component.scss']
})


export class TopviewComponent  {



  message: any;
  view: any;
  topName!: string;
  groups$: any;
  subscription: Subscription;
  showView= false;
  refreshViewCount = 0;
  caseID= "";

  fg: FormGroup;

  @Input()
  CaseID!: string;

  constructor(private fb: FormBuilder,
              private gvservice: GetViewService, 
              private ggservice: GetGroupsService, 
              private cd: ChangeDetectorRef) { 


    this.fg = fb.group({ hideRequired: false});


    this.showView = false;
    this.subscription = this.gvservice.getMessage().subscribe(message => {

      this.message = message;
      this.view = message.view;

      if (this.caseID === "") {
        this.caseID = this.message.caseID;
        this.topName = message.view.name;
      }
      else if (this.caseID == this.message.caseID) {
        this.topName = message.name
      }

     
      if (this.view?.visible && this.message.caseID === this.caseID) {
        this.showView = true;

        this.groups$ = this.view.groups;

      }

      this.CaseID = this.caseID;

    });


}

  

  

  customFilter(object: { [x: string]: any; hasOwnProperty?: any; },result: any[]){
    if(Object.prototype.hasOwnProperty.call(object, 'field'))
        result.push(object);

    for (let i=0;i<Object.keys(object).length;i++){
        if(typeof object[Object.keys(object)[i]]=="object"){
            this.customFilter(object[Object.keys(object)[i]],result);
        }
    }
  }

  addFieldsToFormGroup(arFields : Array<any>) {
    arFields.forEach( element => {

      this.fg.addControl(element.field.fieldID, new FormControl('', null));
    })
  }

  formValid(): boolean {

    this.touchAll();
    return this.fg.valid;

  }

  touchAll(): void {
    Object.values(this.fg.controls).forEach(
      control => {
          control.markAsTouched();
      }
    )   
  }


  topViewRefresh(): void {


    Object.values(this.fg.controls).forEach(
      control => {
        control.markAsTouched();

      }
    )

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

  }

}
