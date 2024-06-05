import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from '../_services/case.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { RefreshCaseService } from '../_messages/refreshcase.service';
import { RightPanelService } from '../_messages/right-panel.service';

@Component({
  selector: 'app-casedetails',
  templateUrl: './casedetails.component.html',
  styleUrls: ['./casedetails.component.scss']
})
export class CasedetailsComponent implements OnInit {

  @Input() caseID!: string;

  message: any;
  subscription!: Subscription;

  rightPanelMessage: any;
  rightPanelSubscription!: Subscription;

  detailsName!: string;
  groups$: any;
  showDetails= false;
  loader = true;

  fg: FormGroup;

  constructor(private fb: FormBuilder,
              private cservice: CaseService,
              private rcservice: RefreshCaseService,
              private rightPanelService: RightPanelService ) { 

    this.fg = fb.group({ hideRequired: false});
  }

  ngOnInit() {

    this.subscription = this.rcservice.getMessage().subscribe(
      message => {
        this.message = message;

        this.caseID = this.message.caseID;
        this.getCaseDetails();
        
      }
    );

    this.rightPanelSubscription = this.rightPanelService.getMessage().subscribe(
      message => {
        if(this.rightPanelMessage?.sRightPanelSection !== message?.sRightPanelSection) {
          this.rightPanelMessage = message;
          this.getCaseDetails();
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.rightPanelSubscription.unsubscribe(); 
  }

  getCaseDetails() {
    this.loader = true;
    this.cservice.getView(this.caseID, this.rightPanelMessage.sRightPanelSection).subscribe(
      response => {
        this.detailsName = response.body["name"];
        this.groups$ = response.body["groups"];
        this.showDetails = true;
        this.loader = false;
      },
      err => {
        this.showDetails = false;
        this.loader = false;
        console.log(`${this.rightPanelMessage.sRightPanelSection} issue: ${err.message}`);
      }
    );
  }



}
