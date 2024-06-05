import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { GetPageService } from '../../_messages/getpage.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GetGroupsService } from '../../_messages/getgroups.service';
import * as _ from "lodash";

@Component({
  selector: 'app-toppage',
  templateUrl: './toppage.component.html',
  styleUrls: ['./toppage.component.scss']
})
export class ToppageComponent  {

  message: any;
  page: any;
  topName!: string;
  groups$: any;
  subscription: Subscription;
  showPage= false;
  //caseID= "";

  @Input()
  CaseID!: string;

  fg: FormGroup;


  constructor(private fb: FormBuilder,
    private gpservice: GetPageService, 
    private ggservice: GetGroupsService, 
    private cd: ChangeDetectorRef) { 

      this.fg = fb.group({ hideRequired: false});


      this.showPage = false;
      this.subscription = this.gpservice.getMessage().subscribe(message => {
  
        this.message = message;
        this.topName = message.name;
        this.page = message.page;

        if (this.CaseID === "") {
          this.CaseID = this.message.caseID;
        }
  
        if (this.message.page.name == this.page.name) {
          this.showPage = true;
  
          this.groups$ = this.page.groups;
        }
  
      });

    }

  

  ngOnDestroy() {
    this.subscription.unsubscribe();

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

}
