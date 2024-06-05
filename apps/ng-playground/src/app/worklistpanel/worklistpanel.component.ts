import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RefreshWorkListService } from '../_messages/refreshworklist.service';
import { WorklistComponent } from '../worklist/worklist.component';
import { GetLoginStatusService } from "../_messages/getloginstatus.service";
import { Subscription } from 'rxjs';
import { endpoints } from '../_services/endpoints';
@Component({
  selector: 'app-worklistpanel',
  templateUrl: './worklistpanel.component.html',
  styleUrls: ['./worklistpanel.component.scss']
})
export class WorklistpanelComponent implements OnInit {

  arWorkbaskets$: Array<any> = [];
  workbaskets = new FormControl('Worklist');
  filterValue!: string;
  subscription!: Subscription;
  constructor(private rwlservice: RefreshWorkListService,
  private glsservice: GetLoginStatusService) { 

  }
  @ViewChild(WorklistComponent) worklistComp!: WorklistComponent;

  ngOnInit() {
    if (sessionStorage.getItem("pega_ng_user")) {
      this.getWorkbaskets();
    }
  }

  getWorkbaskets() {
    if(endpoints.use_OAuth){
      this.subscription = this.glsservice.getMessage().subscribe(
        message => {
          if (message.loginStatus === 'LoggedIn') {
            const sWorkbaskets = sessionStorage.getItem("userWorkBaskets");
            this.arWorkbaskets$ = sWorkbaskets != undefined ? JSON.parse(sWorkbaskets) : [];
          }
      });
    }else{
      const sWorkbaskets = sessionStorage.getItem("userWorkBaskets");
      this.arWorkbaskets$ = sWorkbaskets != undefined ? JSON.parse(sWorkbaskets) : [];
    }
  }

  ngOnDestroy() {
    if(endpoints.use_OAuth){
      this.subscription.unsubscribe();
    }
  }

  compareDropdown(value1: any, value2: any): boolean {
    const val1 = determineValues(value1);
    const val2 = determineValues(value2);

    return val1 === val2;
  }

  dropDownChanged(e: any) {

    this.rwlservice.sendMessage(e.value);
    
  }

  onFilterChange(event: any) {
    if (this.worklistComp) {
      this.worklistComp.filterWorklistbyCaseId(event);
    }
  }

}

export function determineValues(val: any): string {
  if (val.constructor.name === 'array' && val.length > 0) {
     return '' + val[0];
  }
  return '' + val;
}
