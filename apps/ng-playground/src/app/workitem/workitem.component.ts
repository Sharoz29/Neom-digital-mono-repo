// @ts-no-check TODO:Old code, need upgrade

import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Subscription, Observable, of, Subject } from 'rxjs';
import { GetAssignmentService } from '../_messages/getassignment.service';
import { GetViewService } from '../_messages/getview.service';
import { GetPageService } from '../_messages/getpage.service';
import { GetChangesService } from '../_messages/getchanges.service';
import { AssignmentService } from '../_services/assignment.service';
import { CaseService } from '../_services/case.service';
import { CloseWorkService } from '../_messages/closework.service';
import { ChangeDetectorRef } from "@angular/core";
import { interval } from "rxjs/internal/observable/interval";
import { TopviewComponent } from '../_subcomponents/topview/topview.component';
import { ReferenceHelper } from '../_helpers/reference-helper';
import { PegaErrors } from '../_constants/PegaErrors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetActionsService } from '../_messages/getactions.service';
import { RefreshWorkListService } from '../_messages/refreshworklist.service';
import { RefreshCaseService } from '../_messages/refreshcase.service';
import { RefreshAssignmentService } from '../_messages/refreshassignment.service';
import { GetNewCaseService } from '../_messages/getnewcase.service';
import { ToppageComponent } from '../_subcomponents/toppage/toppage.component';
import { RenameTabService } from '../_messages/renametab.service';
import { OpenAssignmentService } from '../_messages/openassignment.service';
import { GetRecentService } from '../_messages/getrecent.service';
import { GetCaseService } from '../_messages/getcase.service';
import { ProgressSpinnerService } from '../_messages/progressspinner.service';
import { PageInstructionsService } from '../_messages/pageinstructions.service';
import { PageInstructions } from "../_helpers/pageinstructions";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { endpoints } from '../_services/endpoints';
import { formButtonActionIDs, formButtonLabels } from '../_constants/FormConstants';
import { refTypes } from "./../_constants/FormConstants";
import { NgZone } from '@angular/core';
import { RightPanelService } from '../_messages/right-panel.service';
import { getPostableFieldsPI } from '../_helpers/appMisc';
import { GetAttachmentsService } from '../_messages/getAttachments.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-workitem',
  templateUrl: './workitem.component.html',
  styleUrls: ['./workitem.component.scss'],
  providers: [ReferenceHelper, PageInstructions]
})

//
// app-workitem is the component that does the most work
// it registers for a lot of messages from other components and handles them
// there is an app-workitem component for each open case (one per tab)
// typically, the app-tab component will be created and then send a message
// to the app-workitem to populate.
//

export class WorkitemComponent implements OnInit {

  @ViewChild(TopviewComponent) tvComp!: TopviewComponent;
  @ViewChild(ToppageComponent)
  tpComp!: ToppageComponent;

  message: any;
  subscription: Subscription;
  
  changeMessage: any;
  changeSubscription: Subscription;

  actionMessage: any;
  actionSubscription: Subscription;

  refreshAssignmentMessage: any;
  refreshAssignmentSubscription: Subscription;

  getNextWorkMessage: any;
  getNextWorkSubscription!: Subscription;

  getNewCaseMessage: any;
  getNewCaseSubscription: Subscription;

  getRecentMessage: any;
  getRecentSubscription: Subscription;

  getStateMessage: any;
  getStateSubscription!: Subscription;

  requestStateMessage: any;
  requestStateSubscription!: Subscription;

  pageInstructionsMessage: any;
  pageInstructionsSubscription: Subscription;

  rightPanelMessage: any;
  rightPanelSubscription: Subscription;

  showAttachmentsSection!: boolean;
  getAttachmentsSubscription: Subscription;

  currentAssignment$!: any;
  currentAssignmentFields$!: any;
  currentAction!: string;
  currentAssignmentID!: string;

  currentView$!: any;
  currentPage$: any;

  currentCase$!: any;
  currentCaseLoaded$ = false;

  localActions$: Array<any> = [];
  assignmentActions$: Array<any> = [];

  topName$!: string;

  currentCaseID$!: string;
  currentCaseName!: string;


  aheaders: any;
  cheaders: any;
  errors: any;
  etag!: string;

  bScreenflow = false;
  bLastStep = false;
  bFirstStep = false;
  sLastStepActionID: any;

  subject = new Subject<any>();

  // dialog data
  currentAssignmentFieldsDialog$!: object;
  aheadersDialog:any;
  currentActionDialog!: string;
  currentAssignmentIDDialog!: string;

  isLoaded = false;
  isView = false;
  isPage = false;
  isNewPage = false;
  isDialog = false;
  currentPageID$!: string;

  bRefreshOccurred = false;

  state: Record<string, any> = new Object();
  storedState: Record<string, any> = new Object();
  storedAction!: string;
  localActionState: Record<string, any> = new Object();
  bIsLocalAction  = false;

  bUseRepeatPageInstructions = false;
  bUsePagePageInstructions = false;
  bUseScreenFlow = false;

  // To keep track of whether the form has changed or not
  bDirtyFlag = false;
  // formBtnInfo.aBtns is a lookup array of specific actionID values (will be empty when not in screenflow)
  // Used to build up form button info once rather than at each render (seeing 6-7 renders per assignment)
  formBtnsInfo: {bScanButtons: boolean, aBtns: any[]}={bScanButtons: true, aBtns: []};
  aStdBtnLabels!: any;
  formButtonActionIDs: any = formButtonActionIDs;
  bHasActionButtons = false;

  updatedFields = new Set();
  previousState: Record<string, any> = new Object();
  // To keep track of the fields that can be POSTed 
  postableFields = new Set();
 


  constructor(private aservice: AssignmentService,
    private cservice: CaseService,
    private gaservice: GetAssignmentService, 
    private cdref: ChangeDetectorRef, 
    private gvservice: GetViewService,
    private gpservice: GetPageService,
    private gchservice: GetChangesService,
    private refHelper: ReferenceHelper,
    private snackBar: MatSnackBar,
    private gactionsservice: GetActionsService,
    private cwservice: CloseWorkService,
    private rwlservice: RefreshWorkListService,
    private rcservice: RefreshCaseService,
    private raservice: RefreshAssignmentService,
    private gncservice: GetNewCaseService,
    private rtservice: RenameTabService,
    private oaservice: OpenAssignmentService,
    private grservice: GetRecentService,
    private gcservice: GetCaseService,
    private piservice: PageInstructionsService,
    private pageinstructions: PageInstructions,
    private localActionDialog: MatDialog, 
    private infoDialog: MatDialog,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private psservice: ProgressSpinnerService,
    private rightPanelService: RightPanelService,
    private getAttachmentsService: GetAttachmentsService) {

    this.subscription = this.gaservice.getMessage().subscribe(message => { 
      this.message = message;
      this.currentCaseName = this.message.caseID;

      this.getAssignment(message.assignment.pzInsKey);

      this.handleUnsubscribe();
    });

    this.changeSubscription = this.gchservice.getMessage().subscribe(message => { 
      this.changeMessage = message;
      // Whenever some user input changes, set bDirtyFlag to true
      this.bDirtyFlag = true; 
      this.updatedFields.add(this.changeMessage.ref);
      this.updateState(this.changeMessage.ref, this.changeMessage.value, this.changeMessage.caseID, this.changeMessage.refType);
    });

    this.actionSubscription = this.gactionsservice.getMessage().subscribe(message => { 
      this.actionMessage = message;

      this.handleThisFormActions(this.actionMessage.actionName, this.actionMessage.action, this.actionMessage.caseID, this.actionMessage.reference);
    });

    this.refreshAssignmentSubscription = this.raservice.getMessage().subscribe(message => { 
      this.refreshAssignmentMessage = message;

      this.handleRefreshAssignmentActions(this.refreshAssignmentMessage.action, this.refreshAssignmentMessage.data);
    });

    this.getNewCaseSubscription = this.gncservice.getMessage().subscribe(message => { 

      this.getNewCaseMessage = message;

      this.getNewCase(message.caseID);

      this.handleUnsubscribe();
    });
    
    this.getRecentSubscription = this.grservice.getMessage().subscribe(
      message => {
        this.getRecentMessage = message;

        this.getRecent(message.caseID);

        this.handleUnsubscribe();

      }
    );

    this.pageInstructionsSubscription = this.piservice.getMessage().subscribe(
      message => { 
        this.pageInstructionsMessage = message;

        this.handlePageInstructions(message.caseID, message.refType, message.instructions, message.target, message.index, message.content);
    });

    this.rightPanelSubscription = this.rightPanelService.getMessage().subscribe(message => {
      this.rightPanelMessage = message;
    });

    this.getAttachmentsSubscription = this.getAttachmentsService.getMessage().subscribe(message => {
      this.showAttachmentsSection = message.showAttachments;
    });
  }

  ngOnInit() {
    this.bUseRepeatPageInstructions = localStorage.getItem("useRepeatPageInstructions") == "true" ? true : false;
    this.bUsePagePageInstructions = localStorage.getItem("usePagePageInstructions") == "true" ? true : false;
    this.bUseScreenFlow = localStorage.getItem("useScreenFlow") == "true" ? true : false;
    this.bRefreshOccurred = false;
    this.subject.subscribe(data => {
      this.previous();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.changeSubscription.unsubscribe();
    this.getNewCaseSubscription.unsubscribe();
    this.getRecentSubscription.unsubscribe();
    this.actionSubscription.unsubscribe();
    this.pageInstructionsSubscription.unsubscribe();
    this.subject.unsubscribe();
    this.rightPanelSubscription.unsubscribe();
    this.getAttachmentsSubscription.unsubscribe();
  }



  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }


  handleUnsubscribe() {
    this.subscription .unsubscribe();
    this.getNewCaseSubscription.unsubscribe();
    this.getRecentSubscription.unsubscribe();

  }

  onAttachmentToggle() {
    this.getAttachmentsService.sendMessage(!this.showAttachmentsSection);
  }

  handleThisFormActions(sAction: string, oAction: any, caseID: string, reference: string) {

    if (caseID === this.currentCaseID$) {

      switch(sAction){
        case "addRow": 
          // send an add row event, so grids/repeats will add a row
          break;
        case "deleteRow":
          // send an delete row event, so grids/repeats will delete a row
          break;
        case "restoreState":
            if (oAction.action == "localAction") {
              this.bIsLocalAction = false;
            }
            this.restoreState();
            break;
        case "refresh": 
          if (oAction.action == "localAction") {
            this.bIsLocalAction = false;
          }
          this.refreshView(this.state, oAction);
          break;
        case "postValue":
          break;
        case "runScript":
          // eslint-disable-next-line no-case-declarations
          const sScript = this.getRunScript(oAction);

          try {
            Function(sScript)();
          }
          catch (ex) {
            console.log("RunScript can't eval: " + sScript + ", function may not exist.");
          }

          break;
        case "takeAction": 
          this.takeAction(oAction.actionProcess.actionName);
          break;
        case "setValue":
          this.setValueOnPairs(oAction.actionProcess.setValuePairs, caseID);
          break;
        case "openUrlInWindow":
          this.openUrlInWindow(oAction.actionProcess);
          break;
        case "localAction" :
          this.localAction(oAction.actionProcess.localAction, 
            oAction.actionProcess.target, oAction.actionProcess.customTemplate);
            break;
        default: 
          console.log("unhandled action:" + sAction);
          break;
      }
    }

  }


  restoreState() {
    this.state = JSON.parse(JSON.stringify(this.storedState));

  }

  localAction(sAction: string, sTarget: string, sTemplate: string) {
    this.storedState = JSON.parse(JSON.stringify(this.state));
    this.bIsLocalAction = true;

    switch (sTarget) {
      case "replaceCurrent" :
        this.storedAction = this.currentAction;
        this.takeAction(sAction);
        break;
      case "modalDialog" :
        this.getLocalAction(this.currentAssignmentID, sAction, this.currentCaseID$);
        break;
      case "overlay" :
        alert("Overlay not supported.");
        this.bIsLocalAction = false;
        break;
    }


  }

  handleRefreshAssignmentActions(sAction: string, oAction: any) {

    switch(sAction) {
      case "addRow" :
        // eslint-disable-next-line no-case-declarations
        const postContentAdd = this.refHelper.getPostContent(this.state, this.updatedFields);
        // eslint-disable-next-line no-case-declarations
        const targetAdd = this.refHelper.getRepeatFromReference(oAction.layoutData.reference, oAction.layoutData.referenceType, postContentAdd);

        if (oAction.layoutData.referenceType === 'List') {
          targetAdd.push(this.refHelper.getBlankRowForRepeat(targetAdd));
        }
        else {
          // group
          if (oAction.rowName === null || oAction.rowName === "") {
            return;
          }

          targetAdd[oAction.rowName] = {};
        }

        this.refreshView(postContentAdd, oAction);

        break;
      case "removeRow" :
        // eslint-disable-next-line no-case-declarations
        const postContentRemove = this.refHelper.getPostContent(this.state, this.updatedFields);
        // eslint-disable-next-line no-case-declarations
        const targetRemove = this.refHelper.getRepeatFromReference(oAction.layoutData.reference, oAction.layoutData.referenceType, postContentRemove);

        if (oAction.layoutData.referenceType === 'List') {
          

          if (targetRemove.length > 1) {
            targetRemove.pop();
          }
          else {
            // get a clear row
            const blankRow = this.refHelper.getBlankRowForRepeat(targetRemove);
            targetRemove.pop();
            targetRemove.push(blankRow);
          }


        }
        else {
          // group
          if (oAction.rowName === null || oAction.rowName === "") {
            return;
          }

          if (targetRemove[oAction.rowName]) {
            delete targetRemove[oAction.rowName];
          }
        }

        this.refreshView(postContentRemove, oAction);

        break;
    }

  }


  handlePageInstructions(sCaseID: string, sRefType: string, sInstructions: string, sTarget: string, sIndex: string, oContent: object) {
    if (sCaseID == this.currentCaseID$) {  
      if (sRefType == "List") {
        const nIndex = parseInt(sIndex);

        this.pageinstructions.addAListInstruction(sInstructions, sTarget, nIndex, oContent);
      }
      else {
        this.pageinstructions.addAGroupInstruction(sInstructions, sTarget, sIndex, oContent);
      }
    } 
  }


  takeAction(sAction: string) {
    this.getNextAssignment(this.currentAssignmentID, sAction, this.currentCaseID$);
  }

  setValueOnPairs(valuePairs: Array<any>, sCaseID: string) {

    if (sCaseID === this.currentCaseID$) {
      for (const pairs of valuePairs){
        let ref = pairs.name;
        if (ref.indexOf(".") == 0) {
          ref = ref.substring(1);
        }

        let paramValue = "";
        if (pairs.value != undefined) {
          paramValue = this.determineParam(pairs.value);
        }
        else if (pairs.valueReference != undefined) {
          paramValue = this.determineParamRef(pairs.valueReference);
        }

        paramValue = this.removeLeadingTrailingQuotes(paramValue);

        // update the state
        this.updateState(ref, paramValue, sCaseID, 
          ''
        );

        // update the assignment, so will be displayed
        // if no assignment, nothing will happen
        this.updateAssignmentView(ref, paramValue);
      }
    }
  }
  
  openUrlInWindow(oData: { alternateDomain: any; queryParams: any; windowName: string | undefined; windowOptions: string | undefined; }) {

    // remove quotes,

    try {

      // create url
      const oAlternateDomain = oData.alternateDomain;
      let url = "";
      if (oAlternateDomain.url != undefined) {
        url = oAlternateDomain.url;
        if (url.indexOf('"') == 0) {
          // eslint-disable-next-line no-useless-escape
          url = url.replace(/\"/gi, "");
        }  
      }
      else if (oAlternateDomain.urlReference != undefined) {
        url = this.determineParamRef(oAlternateDomain.urlReference);
        // eslint-disable-next-line no-useless-escape
        url = url.replace(/\"/gi, "");
      }

      // check if have query params
      const sQuery = this.getQueryParams(oData.queryParams);

      if (sQuery != "") {
        url += sQuery;
      }

      // if doesn't begin with http, add it
      if (url.indexOf("http") != 0) {
        url = "http://" + url;
      }
      window.open(url, oData.windowName, oData.windowOptions);
    }
    catch (ex) {
      console.log("Bad open url");
    }

  }

  getQueryParams(arQueryParams: string | any[]): string {
    let sReturn = "";

    let bFirst = true;
    if (arQueryParams.length > 0) {
      for (const qParam of arQueryParams) {
        if (bFirst) {
          sReturn += "?";
          bFirst = false;
        }
        else {
          sReturn += "&";
        }
        sReturn += qParam.name + "=";

        let sVal = "";
        if (qParam.value != undefined) {
          sVal = this.determineParam(qParam.value);
        }
        else if (qParam.valueReference != undefined) {
          sVal = this.determineParamRef(qParam.valueReference);
        }
        if (sVal.indexOf('"') == 0) {
          // eslint-disable-next-line no-useless-escape
          sVal = sVal.replace(/\"/gi, "");
        }  

        sReturn += sVal;
      }


    }

    return sReturn;
  }


  removeLeadingTrailingQuotes(sValue: string) {
    if (sValue.indexOf('"') == 0) {
      sValue = sValue.substring(1);
    }

    if (sValue.indexOf('"') == (sValue.length - 1)) {
      sValue = sValue.substring(0, sValue.length - 1);
    }

    return sValue;
  }

  getRunScript(oAction: { actionProcess: { functionName: string; functionParameters: any; }; }): string {

    let sReturn: string = oAction.actionProcess.functionName + "(";
    let bFirst = true;
    for (const param of oAction.actionProcess.functionParameters) {
      if (!bFirst) {
        sReturn += ",";
      }
      bFirst = false;

      if (param.value != undefined) {
        sReturn += this.determineParam(param.value);
      }
      else if (param.valueReference != undefined) {
        sReturn += this.determineParamRef(param.valueReference);
      }
    }

      sReturn += ")";

      return sReturn;
  }

  determineParam(param: any) {
    if (typeof(param) == "boolean") {
      return param;
    }
    else if (param.indexOf('"') == 0) {
        return param;
    }
    else if (param.indexOf(".") >= 0) {
      // look up
      return '"' + this.lookUpParam(param, false) + '"';

    }
    else {
      return '"' + param + '"';
    }
  }

  determineParamRef(paramRef: any) {
    let paramValue = this.lookUpParam(paramRef.reference, true); 

    if (paramValue === undefined) {
      paramValue = this.refHelper.htmlDecode(paramRef.lastSavedValue);
    }

    return '"' + paramValue + '"';


  }

  lookUpParam(param: any, bReturnUndefined : boolean): string {
    const arNodes: Array<string> = param.split(".");
    let returnString = '';

    let stateNode:any = this.state;
    // first try in state
    for (const nodeEl of arNodes) {
      if (nodeEl != "" && stateNode != undefined ) {
        if (typeof(stateNode[nodeEl]) == "object") {
          stateNode = stateNode[nodeEl];
        }
        else if ( stateNode[nodeEl] === undefined) {
          break;
        }
        else {
          returnString = stateNode[nodeEl];
        }

      }
    }

    if (returnString === undefined) {

      // try "content" (pyWorkPage)
      let currNode = this.currentCase$["content"];

      for (const nodeEl of arNodes) {
        if (nodeEl != "" && currNode != undefined ) {
          if (typeof(currNode[nodeEl]) == "object") {
            currNode = currNode[nodeEl];
          }
          else if (currNode[nodeEl] === undefined) {
            break;
          }
          else {
            returnString = currNode[nodeEl];
          }
  
        }
      }

    }

    if (returnString === undefined && !bReturnUndefined) {
      returnString = "";
    }

    return returnString;

  }

  fnGetLabel(actionID: any){
    return this.formBtnsInfo.aBtns[actionID] && this.formBtnsInfo.aBtns[actionID].name ? this.formBtnsInfo.aBtns[actionID].name : this.aStdBtnLabels[actionID];
  };


  getAssignment(assignmentID: string) {


    this.aservice.getAssignment(assignmentID).subscribe(
      assignmentResponse => {
        this.currentAssignment$ = assignmentResponse.body;
        
        const nextAssignment : any = this.currentAssignment$;
        this.bScreenflow = this.bUseScreenFlow && nextAssignment.navigation !== undefined;
        this.bHasActionButtons = nextAssignment.actionButtons !== undefined;

        this.aStdBtnLabels = formButtonLabels;

        if(this.formBtnsInfo.bScanButtons){
          // Attempt to minimize scanning through buttons only when transitioning to a new screen
          // submitView and cancelView once again set the bScanButtons flag
          this.formBtnsInfo.aBtns = [];
          const btnGroups = ["secondary", "main"];
          btnGroups.forEach( (grp) => {
            const aSecButtons = nextAssignment?.actionButtons?.[grp];
            for(let i = 0; aSecButtons && i < aSecButtons.length; i++){
              const btnInfo = aSecButtons[i];
              this.formBtnsInfo.aBtns[btnInfo.actionID] = btnInfo;
            }
          });
          this.formBtnsInfo.bScanButtons = false;
        }

        if (nextAssignment.actions.length > 0) {
          
          const steps = nextAssignment?.navigation ? nextAssignment.navigation.steps : null;
          this.sLastStepActionID = formButtonActionIDs.SUBMIT;

          if(steps){  
            this.bLastStep = steps[steps.length-1].visited_status === 'current';
          }

          if( !this.formBtnsInfo.aBtns[this.sLastStepActionID] || !this.formBtnsInfo.aBtns[this.sLastStepActionID].name ){
            this.sLastStepActionID = formButtonActionIDs.FINISH;
          }

          // get first flow action
          const nextAction = nextAssignment.actions[0].ID;

          this.currentCaseID$ = nextAssignment.caseID;
          
          const arCase = nextAssignment.caseID.split(" ");

          this.getNextAssignment(nextAssignment.ID, nextAction, nextAssignment.caseID);
        }
        else {
          let assignmentID = "No assigment";
          let caseName = "";
          try {
            assignmentID = nextAssignment.ID;
            const arCase = nextAssignment.caseID.split(" ");
            if (arCase.length > 1) {
              caseName = arCase[1];
              this.currentCaseName = caseName;
            }            
          }

          catch (ex) {
            console.log("No case name");
          }

          const sError = "Assignment " + assignmentID + " can not be opened.";

          const snackBarRef = this.snackBar.open(sError, "Ok");

          this.closeWork();
        }


      },
      assignmentError => {
        const snackBarRef = this.snackBar.open("Errors from get assignment:" + assignmentError.errors, "Ok");
      }
    );

  }



  getNextAssignment(assignmentID: string, action: string, caseID: string) {

    // go get the assignment
    this.aservice.getFieldsForAssignment(assignmentID, action).subscribe(
      response => { 
        this.currentAssignmentFields$ = response.body;
        this.aheaders = response.headers;
        this.currentAction = action;
        this.currentAssignmentID = assignmentID;

        if (this.bIsLocalAction) {
          this.currentAssignmentFields$["view"] = this.refHelper.updateViewWithLocalState(response.body.view, this.state);
        }


        this.isView = true;
        this.isPage = false;
        this.isNewPage = false;

        this.getView(this.currentAssignmentFields$);

        this.updateActionDropDown(action);


        // go get the case (needed for etag)
        this.cservice.getCase(caseID).subscribe(
          response => {

            this.currentCase$ = response.body;
            this.cheaders = response.headers;
            this.currentCaseLoaded$ = true;



            // add etag to the data
            //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
            // eslint-disable-next-line no-useless-escape
            this.etag = response.headers.get("etag")?.replace(/\"/gi, '') || '';


            this.gcservice.sendMessage(this.currentCase$);
            //let timer = interval(100).subscribe(() => {
            //  this.gcservice.sendMessage(this.currentCase$);timer.unsubscribe();
            //  });
            


            // this if for Debugging ONLY.  Will show flatlist json in a snackbar on each get assignment
            if (endpoints.SHOWFLATLIST) {
              this.aservice.getFieldsForAssignmentFlatList(assignmentID, action).subscribe(
                response => { 
                  //let snackBarRef = this.snackBar.open("Flat List JSON\n" + JSON.stringify(response.body), "Ok", { panelClass: ['wide-snackbar']});
                
                  const dialogRef = this.infoDialog.open(InfoDialogComponent, {
                    width: '750px',
                    data: { 
                      infoData: JSON.stringify(response.body),
                      title: "Flat List JSON: " + endpoints.FLATLISTTYPE}
                  });
                
                },
                err => {
                  const snackBarRef = this.snackBar.open("Errors from assignment flatlist:" + err.message, "Ok");
                }
              );

            }

            this.cdref.detectChanges();
            
          },
          err => {
            const snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
          }

        );




      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from assignment:" + err.message, "Ok");
        
      }

    )





    this.subscription.unsubscribe();

  }

  getLocalAction(assignmentID: string, action: string, caseID: string) {

    // go get the assignment
    this.aservice.getFieldsForAssignment(assignmentID, action).subscribe(
      response => { 
        this.currentAssignmentFieldsDialog$ = response.body;
        this.aheadersDialog = response.headers;
        this.currentActionDialog = action;
        this.currentAssignmentIDDialog = assignmentID;


        this.isDialog = true;

        const localView = this.refHelper.updateViewWithLocalState(response.body.view, this.state);

        const dialogRef = this.localActionDialog.open(LocalactiondialogComponent, {
          width: '550px',
          data: { dialogView: localView,
            formGroup: this.fb.group({ hideRequired: false}),
            caseID: this.currentCaseID$,
            refTypes: "",
            title: response.body.name}
        });


      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from assignment:" + err.message, "Ok");
        
      }

    )

    this.subscription.unsubscribe();

  }



  getCase(caseID: string) {
    // go get the case (needed for etag)
    this.cservice.getCase(caseID).subscribe(
      response => {
        
        this.currentCase$ = response.body;
        this.cheaders = response.headers;
        this.currentCaseLoaded$ = true;

        // add etag to the data
        //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
        // eslint-disable-next-line no-useless-escape
        this.etag = response.headers.get("etag")?.replace(/\"/gi, '') || '';

        this.cdref.detectChanges();

        this.rwlservice.sendMessage('Work');


        this.gcservice.sendMessage(this.currentCase$);
        
      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
      }  
    );
  }

  getNewCase(caseID: string) {

    this.cservice.getCaseCreationPage(caseID).subscribe(
      (response: HttpResponse<any>) => {
        // creation_page in response.body.creation_page

        this.ngZone.run(() => {
          this.isView = false;
          this.isPage = false;
          this.isNewPage = true;
  
          this.psservice.sendMessage(false);
          this.isLoaded = true;
  
          this.currentCaseLoaded$ = true;
          
          this.currentCaseID$ = response.body["caseTypeID"];
          this.currentPage$= response.body["creation_page"];
          this.currentPageID$ = this.currentPage$["pageID"];
          this.cheaders = response.headers;
          this.currentCaseLoaded$ = true;
        });

        // add etag to the data
        //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
        //this.etag = response.headers.get("etag").replace(/\"/gi, '');
        
        //this.getCase(this.currentCaseID$);
        this.getPage(this.currentPage$);
       

      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from create case:" + err.message, "Ok");
      }

    );

  }

  getView(oAssignment: any) {
    this.currentView$ = oAssignment.view;
    this.topName$ = oAssignment.name;

    this.psservice.sendMessage(false);
    this.isLoaded = true;

    this.currentCaseID$ = oAssignment.caseID;

    const timer = interval(10).subscribe(() => {
      this.gvservice.sendMessage(this.topName$, this.currentCaseID$, this.currentView$);timer.unsubscribe();
      });

    // in general, when we get the view, we copy the initial values to state, to be then updated going forward
    // there are excpetions with page instructions and/or if a refresh happens
    if (this.bRefreshOccurred) {
      // if you plan on a section refresh of an embeded page and your refresh runs a data transform or activity and changes
      // the data of said embedded page, then here, you will need to add code to handle this, as the page instuctions
      // set previously, will not include that data and it will be lost upon POST.  So, you will need to add code
      // the either compares before and after, or grab the return data from refresh and create page instructions that
      // represent it all.
      this.previousState = {...this.state};
      this.state = this.refHelper.getInitialValuesFromView(this.currentView$, this.state, this.bUseRepeatPageInstructions, this.bUsePagePageInstructions, this.postableFields);
    }
    else {
      // get state, if either bUserRepeatInstructions or bUsePagePageInstructions is true, the the corresponding
      // won't be in state, expected to be added via page instructions
      this.state = this.refHelper.getInitialValuesFromView(this.currentView$, {}, this.bUseRepeatPageInstructions, this.bUsePagePageInstructions, this.postableFields);
    }

    // handle top view validation messages
    if (this.currentView$?.["validationMessages"] && this.currentView$?.["validationMessages"] !== "") {
      const snackBarRef = this.snackBar.open(this.currentView$["validationMessages"], "Ok");
    }

  }

  getPage(oPage: any) {

    const timer = interval(10).subscribe(() => {
      this.gpservice.sendMessage(oPage.name, oPage.pageID, oPage);timer.unsubscribe();
      });

    // in general, when we get the view, we copy the initial values to state, to be then updated going forward
    // there are excpetions with page instructions and/or if a refresh happens
    if (this.bRefreshOccurred) {
      // if we have had a "refresh", then we don't know what has been updated (activity or datatransform can
      // possibly update fields).  So, instead of keeping page instructions and not updating state, get state
      // (with all changes) and clear out page instructions.  Going forward we can have additional page
      // instructions along with the last "state"
      this.pageinstructions.clearPageInstructions();
      this.state = this.refHelper.getInitialValuesFromView(oPage, {}, false, false, this.postableFields);

    }
    else {
      // get state, if either bUserRepeatInstructions or bUsePagePageInstructions is true, the the corresponding
      // won't be in state, expected to be added via page instructions
      this.state = this.refHelper.getInitialValuesFromView(oPage, {}, this.bUseRepeatPageInstructions, this.bUsePagePageInstructions, this.postableFields);
    }

  }

  getRecent(caseID: string) {

    this.cservice.getCase(caseID).subscribe(
      response => {

        this.currentCase$ = response.body;

        if (this.currentCase$["assignments"]) {
          const firstAssignment = this.currentCase$["assignments"][0];
          const assignmentID = firstAssignment.ID;
          const firstAction = firstAssignment["actions"][0];
          const actionID = firstAction.ID;
  
          this.getNextAssignment(assignmentID, actionID, caseID);
        }
        else {

          this.currentCaseID$ = this.currentCase$["ID"];
    
          this.currentPageID$ = "Review";

          this.psservice.sendMessage(false);
          this.isLoaded = true;
          this.isPage = true;
          this.isView = false;
          this.isNewPage = false;
          this.cdref.detectChanges();          


         
        }


        
      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
      }

    );
  }


  getTargetAndIndex(sReference: string): object {
    const oReturn: Record<string, any> = {};
    enum orProps {
      propRef = "propRef",
      target = "target",
      index = "index",
      type = "type"

    }
    
    const nLeftParenIndex = sReference.lastIndexOf("(");
    const nRightParenIndex = sReference.lastIndexOf(")");
    if(nLeftParenIndex > 0) {
      const nLastDot = sReference.lastIndexOf(".");
      
      // check of dot after right paren, if so, property as last ref

      if ((nRightParenIndex + 1) == nLastDot) {
        oReturn[orProps.propRef] = sReference.substring(nLastDot + 1);
        sReference = sReference.substring(0, nLastDot);

        const sRef = sReference.substring(0, nLeftParenIndex);
        const sIndex = sReference.substring(nLeftParenIndex + 1, nRightParenIndex);

        oReturn[orProps.target] = sRef;
        oReturn[orProps.index] = sIndex;
        oReturn[orProps.type] = Number.isNaN(sIndex) ? refTypes.GROUP : refTypes.LIST;
      }
      else {

        // has a page as last reference, not page list/group
        oReturn[orProps.propRef] = sReference.substring(nLastDot + 1);
        oReturn[orProps.target] = sReference.substring(0, nLastDot);
        oReturn[orProps.index] = null; 
      }

    }
    else {
      oReturn[orProps.target] = sReference;
      oReturn[orProps.index] = null; 
    }

    return oReturn;
  }

  getTargetPageAndRef(sReference: string): object {
    const oReturn: Record<string, any> = {};

    const nLast = sReference.lastIndexOf(".");
    let sPageName = sReference.substring(0, nLast);
    const sPropName = sReference.substring(nLast + 1);

    if (sPageName.indexOf(".") != 0) {
      sPageName = ".".concat(sPageName);
    }
    oReturn["pageName"] = sPageName;
    oReturn["propName"] = sPropName;

    return oReturn;

  }

  updateState(sRef: string, sValue: string, sCaseID: string, sRefType: string) {

    let bUpdatedPI = false;
    if (sCaseID === this.currentCaseID$) {
      this.state[sRef] = sValue;
      if (this.bUseRepeatPageInstructions) {

        if (sRefType != null && 
           (sRefType == "List") || (sRefType == "Group")) {

            // ignore ALL, because APPEND and INSERT are taken care of in repeating grid
            if (sRef != "ALL") {
              this.updatePageInstructionState(sRef, sValue, sCaseID, sRefType);
            }
             
            bUpdatedPI = true;
        } 
        else if (sRef.indexOf("(") >= 0) {
          // is a page list/group
          this.updatePageInstructionState(sRef, sValue, sCaseID, sRefType);
        }

      }
      if (this.bUsePagePageInstructions) {

          if (sRefType == null && sRef.indexOf(".") > 0) {
            this.updateEmbeddedPageInstructionState(sRef, sValue, sCaseID, sRefType);

            bUpdatedPI = true;
          }

      }
 
      // Always update the state since we want to keep track of POSTable fields
      if (sRef === "ALL") {
        // force to get all the fields from the display
        // typically, when a row is added or deleted, right now, need all 
        // from grid, later, might change and just queue changes
        this.state = this.refHelper.getInitialValuesFromView(this.currentView$, {}, this.bUseRepeatPageInstructions, this.bUsePagePageInstructions, this.postableFields);
      }
      else {
        this.state[sRef] = sValue;      
      }

    }

  }

  updateEmbeddedPageInstructionState(sRef: string, sValue: string, sCaseID: string, sRefType: string) {

    const oTargetInfo: Record<string, any> = this.getTargetPageAndRef(sRef);

    this.pageinstructions.addAnUpdatePageInstruction(oTargetInfo["pageName"], oTargetInfo["propName"], sValue);
  }

  updatePageInstructionState(sRef: string, sValue: string, sCaseID: string, sRefType: string) {

    
    const oTargetInfo: Record<string, any> = this.getTargetAndIndex(sRef);
    let bHasLast = false;

    // check if there is already if the last entry in page instructions is an update for this target and index
    // if so, we can update it, otherwise, need to create a new one

    // test to see if group, if we think is a group, ok if not, might need to test both group and list
    if (sRefType == "List") {
      const nIndex = parseInt(oTargetInfo["index"]);

      // this happens when we are page in a pagelist, so update the page not the pagelist
      if (isNaN(nIndex)) {
        this.updateEmbeddedPageInstructionState(sRef, sValue, sCaseID, "");
        return;
      }
      bHasLast = this.pageinstructions.isLastListInstruction("UPDATE", oTargetInfo["target"], nIndex);

    }
    else if (sRefType == "Group") {

      // this happens when we are page in a pagegroup, so update the page not the pagegroup
      if (oTargetInfo["index"] == undefined || oTargetInfo["index"] == null || oTargetInfo["index"] == "") {
        this.updateEmbeddedPageInstructionState(sRef, sValue, sCaseID, "");
        return;
      }
      bHasLast = this.pageinstructions.isLastGroupInstruction("UPDATE", oTargetInfo["target"], oTargetInfo["index"]);
    }

    if (bHasLast) {
      // get content
      const oContent: Record<string, any> = this.pageinstructions.getLastInstructionContent();
      oContent[oTargetInfo["propRef"]] = sValue;

      this.pageinstructions.updateLastInstructionContent(oContent);
    }
    else {
      const oContent: Record<string, any> = new Object();
      oContent[oTargetInfo["propRef"]] = sValue;

      // create a new update
      if (sRefType == "List") {
        const nIndex = parseInt(oTargetInfo["index"]);
        this.pageinstructions.addAListInstruction("UPDATE", oTargetInfo["target"], nIndex, oContent);
      }
      else if (sRefType == "Group") {
        this.pageinstructions.addAGroupInstruction("UPDATE", oTargetInfo["target"], oTargetInfo["index"], oContent);
      }

    }
  
  }

  updateAssignmentView(sRef: string, sValue: string) {

    if (this.currentAssignmentFields$) {
      const fieldNode = this.refHelper.customUpdateJSON(this.currentAssignmentFields$, "reference", sRef);
      if (fieldNode) {
        fieldNode.value = sValue;
      }
    }

  }




  refreshView(stateData?: any, oAction?: any) {
  
    this.postableFields.clear();

    let sRefreshFor = "";
    if (stateData == null) {
      stateData = {};
    }

    if (oAction) {
      if (oAction.refreshFor) {
        sRefreshFor = oAction.refreshFor;
      }
    }

    // if local action, store off the original action, if we replace
    // we will have it stored
    if (this.bIsLocalAction) {
      this.currentAction = this.storedAction;
    }

    this.psservice.sendMessage(true);
  
    this.aservice.performRefreshOnAssignment(this.currentAssignmentID, this.currentAction, 
      sRefreshFor, stateData, this.pageinstructions.getPageInstructions(), this.updatedFields).subscribe(
      response => {
        this.bRefreshOccurred = true;

        this.currentAssignmentFields$ = response.body;
        this.aheaders = response.headers;


        // if localAction, then refreshing the original action, but merging in the local action data
        // into the display and state
        if (this.bIsLocalAction) {
          this.currentAssignmentFields$["view"] = this.refHelper.updateViewWithLocalState(response.body["view"], this.localActionState);
          this.bIsLocalAction = false;
        }

        this.getView(this.currentAssignmentFields$);
        this.updatePageInstructionsWithNewValues(this.previousState, this.state);
        this.rcservice.sendMessage(this.currentCaseID$);



      },
      err => {
        this.handleErrors(err);
      }

    );



  }

  updatePageInstructionsWithNewValues(prevStateValues: Record<string, any>, newStateValues: Record<string, any>) {
    for(const key in newStateValues) {
      if(newStateValues[key] !== prevStateValues[key]) {
        let refType = null;
        const oRefInfo: any = this.getTargetAndIndex(key);
        refType = oRefInfo.type;
        this.bDirtyFlag = true;
        this.updatedFields.add(key);
        this.updateState(key, newStateValues[key], this.currentCaseID$, refType);
      }
    }
  }

  closeWork() {

    // if a local action (replace current), and cancel
    // return to original screen
    if (this.bIsLocalAction) {

      this.localActionState = {};
      this.refreshView(this.storedState, null);
      return;
    }


    this.cwservice.sendMessage(this.currentCaseName);

  }





  submitView() {

    // if local action, store the current state (which is a local action)
    // the refresh refresh the original screen with this data
    if (this.bIsLocalAction) {
      this.localActionState = JSON.parse(JSON.stringify(this.state));

      this.refreshView(this.storedState, null);

      return;
    }
    
    // submit the form if it passes and is valid
    if (this.tvComp.formValid()) {

      this.psservice.sendMessage(true);

      this.state = this.refHelper.removeDataPages(this.state);

      let pi = Object.assign({}, this.pageinstructions.getPageInstructions());

      // Filter the fields from PI structure that are no longer visible in the form
      pi = getPostableFieldsPI(this.postableFields, pi);

      this.aservice.performActionOnAssignment(this.currentAssignmentID, this.currentAction, this.state, pi, this.updatedFields, this.postableFields).subscribe(
        response => {
          const action: any = response.body;
          if (action && action.nextAssignmentID) {
            this.isPage = false;
            this.isView = true;
            this.isNewPage = false;
            this.pageinstructions.clearPageInstructions();
            this.bDirtyFlag = false;
            this.postableFields.clear();
            this.formBtnsInfo.bScanButtons = true;

            this.bRefreshOccurred = false;

            this.getAssignment(action.nextAssignmentID);

            this.rcservice.sendMessage(this.currentCaseID$);
  
          }
          else if (action && action.nextPageID) {
          
            // have a page (Confirm/Review)
            this.currentPageID$ = action.nextPageID;
  
            this.psservice.sendMessage(false);
            this.isPage = true;
            this.isView = false;
            this.isNewPage = false;
            this.cdref.detectChanges();
            this.pageinstructions.clearPageInstructions();
            this.bDirtyFlag = false;
            this.postableFields.clear();
            this.formBtnsInfo.bScanButtons = true;

            this.bRefreshOccurred = false;

            this.getCase(this.currentCaseID$);

            this.rcservice.sendMessage(this.currentCaseID$);
  
          }
          else {
            this.psservice.sendMessage(false);
            alert("something else:" + JSON.stringify(action));
          }
  
        },
        err => {
          this.psservice.sendMessage(false);

          this.handleErrors(err);
        }
      );
  
      this.subscription.unsubscribe();

    }


  }

  saveView() {

    const bUsePostAssignSave: boolean = localStorage.getItem("usePostAssignSave") == "true" ? true : false;
    
    // submit the form if it passes and is valid
    if (this.tvComp.formValid()) {
      
      this.bDirtyFlag = false;
      this.psservice.sendMessage(true);

      let pi = Object.assign({}, this.pageinstructions.getPageInstructions());

      // Filter the fields from PI structure that are no longer visible in the form
      pi = getPostableFieldsPI(this.postableFields, pi);

      if (bUsePostAssignSave) {
        // 8.4 and greater
        // this is the PREFERRED way to save in an assignment as here we are saving the assignment and not the case
        // so there will be validation against the flow action properties that doesn't happen if you just save the case.
        this.aservice.saveAssignment(this.currentAssignmentID, this.currentAction, this.state, pi, this.updatedFields, this.postableFields).subscribe(
          response => {
            switch (response.status) {
              case 200 :
              case 204 :
                this.pageinstructions.clearPageInstructions();
                // good, so reload 
                this.getAssignment(this.currentAssignmentID);
                this.bRefreshOccurred = false;
                
                this.rcservice.sendMessage(this.currentCaseID$);
                break;
              default:
                break;
            }
          },
          err => {
            this.psservice.sendMessage(false);
            this.bDirtyFlag = true;
            this.handleErrors(err);
          }
        );
      }
      else {
        this.cservice.updateCase(this.currentCaseID$, this.etag, null, this.state, pi, this.updatedFields, this.postableFields).subscribe(
          response => {
            switch (response.status) {
              case 200 :
              case 204 :
                this.pageinstructions.clearPageInstructions();
                // good, so reload 
                this.getAssignment(this.currentAssignmentID);
                this.bRefreshOccurred = false;
  
                this.rcservice.sendMessage(this.currentCaseID$);
                break;
              default:
                break;
            }
          },
          err => {
            this.psservice.sendMessage(false);
            this.bDirtyFlag = true;
            this.handleErrors(err);
          }
        );
      }


    
    }
  }

  previous(){
    
    this.aservice.stepPrevious(this.currentCaseID$, this.currentAssignmentID, this.etag).subscribe(
      response => {
        const action: any = response.body;
        this.formBtnsInfo.bScanButtons = true;

        if (action && action.nextAssignmentInfo) {
          this.isPage = false;
          this.isView = true;
          this.isNewPage = false;
          this.pageinstructions.clearPageInstructions();
          this.bRefreshOccurred = false;
          this.postableFields.clear();

          this.getAssignment(action.nextAssignmentInfo.ID);
          
          this.rcservice.sendMessage(this.currentCaseID$);

        }
        else if (action && action.nextPageID) {
        
          // have a page (Confirm/Review)
          this.currentPageID$ = action.nextPageID;

          this.psservice.sendMessage(false);
          this.isPage = true;
          this.isView = false;
          this.isNewPage = false;
          this.cdref.detectChanges();
          this.pageinstructions.clearPageInstructions();
          this.postableFields.clear();
          this.bRefreshOccurred = false;

          this.getCase(this.currentCaseID$);

          this.rcservice.sendMessage(this.currentCaseID$);

        }
        else {
          this.psservice.sendMessage(false);
          alert("something else:" + JSON.stringify(action));
        }

      },
      err => {
        this.psservice.sendMessage(false);

        this.handleErrors(err);
      }
    );
  }

  getCaseAfterUpdate(){
    this.cservice.getCase(this.currentCaseID$).subscribe(
      response => {
        this.currentCase$ = response.body;
        this.cheaders = response.headers;
        this.currentCaseLoaded$ = true;

        // add etag to the data
        //this.updateState("etag", response.headers.get("etag").replace(/\"/gi, ''));
        
        // eslint-disable-next-line no-useless-escape
        this.etag = response.headers.get("etag")?.replace(/\"/gi, '') || '';


        this.gcservice.sendMessage(this.currentCase$);
  
        this.cdref.detectChanges();
        
        this.subject.next(null);
        
      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from case:" + err.message, "Ok");
      }

    );
  }

  backView(){
  
    if (this.bIsLocalAction) {
      this.localActionState = JSON.parse(JSON.stringify(this.state));
      
      this.refreshView(this.storedState, null);

      return;
    }

    this.psservice.sendMessage(true);
    // No need to save the assignment before going to previous step, if it hasn't changed
    if(!this.bDirtyFlag){
      this.previous();
      return;
    }
    
    // submit the form if it passes and is valid
    if (this.tvComp.formValid()) {

      this.state = this.refHelper.removeDataPages(this.state);

      let pi = Object.assign({}, this.pageinstructions.getPageInstructions());

      // Filter the fields from PI structure that are no longer visible in the form
      pi = getPostableFieldsPI(this.postableFields, pi);

      this.aservice.saveAssignment(this.currentAssignmentID, this.currentAction, this.state, pi, this.updatedFields, this.postableFields).subscribe(
        response => {
          switch (response.status) {
            case 200 :
            case 204 :
              this.pageinstructions.clearPageInstructions();
              this.bDirtyFlag = false;
              // good, so reload 
              
              this.getCaseAfterUpdate();

              break;
            default:
              break;
          }
        },
        err => {
          this.psservice.sendMessage(false);

          this.handleErrors(err);
        }
      );

      this.subscription.unsubscribe();

  }
}

  createNew() {
    if (this.tpComp.formValid()) {

      this.psservice.sendMessage(true);
 
      
      this.cservice.createCase(this.currentCaseID$, null, this.state).subscribe(
        response => {

          const caseID = response.body["ID"];
          const caseName = caseID.split(" ")[1];

          const oAssignment: Record<string, any> = new Object();
          oAssignment["pxRefObjectInsName"] = caseName;
          oAssignment["pzInsKey"] = response.body["nextAssignmentID"];

          // renaming tab
          this.rtservice.sendMessage("New", caseName);

          // so renaming the tab, causes the tab to reload
          // so we need to send it a message to open the assigment, because
          // it lost it with the reload
          this.oaservice.sendMessage(caseName, oAssignment);

          // new item created, update worklist
          this.rwlservice.sendMessage('Work');



        },
        err => {
          this.psservice.sendMessage(false);
          this.handleErrors(err);
        }
      );

    }

  }

  updateActionDropDown(currentAction: string ) {
    const actions = this.currentAssignment$["actions"];

    this.localActions$ = [];
    this.assignmentActions$ = [];

    for (const action of actions) {
      if (action.type === "Assignment") {
        if (action.ID != currentAction) {
          this.assignmentActions$.push(action);
        }
      }
      else {
        this.localActions$.push(action);
      }
    }

  }

  // handle local action
  handleLocalAction(sAction: string) {
    
    this.aservice.getFieldsForAssignment(this.currentAssignmentID, sAction).subscribe(
      response => { 
        this.currentAssignmentFields$ = response.body;
        this.aheaders = response.headers;
        this.currentAction = sAction
      
        if (this.bIsLocalAction) {
          this.currentAssignmentFields$["view"] = this.refHelper.updateViewWithLocalState(response.body.view, this.state);
        }


        this.isView = true;
        this.isPage = false;
        this.isNewPage = false;

        this.getView(this.currentAssignmentFields$);

        this.updateActionDropDown(sAction);
      },
      err => {
        const snackBarRef = this.snackBar.open("Errors from assignment:" + err.message, "Ok");
        
      }

    )





    this.subscription.unsubscribe();

  }


  // if there are other assignments you can jump to, handle them here
  handleAssignmentAction(sAction: string) {
    this.getNextAssignment(this.currentAssignmentID, sAction, this.currentCaseID$);
  }

  // handle the "err" object
  handleErrors(errorResponse: any) {

    this.psservice.sendMessage(false);

    if (errorResponse.error) {
      let error: any;
      let sErrors = "";
      for (error of errorResponse.error.errors) {
        if (error.ID === PegaErrors.VALIDATION_ERROR) {
          this.handleValidationErrors(error.ValidationMessages);
        }
        else {
          sErrors += error.ID + " - " + error.message + "\n";
        }

      }

      if (sErrors != "") {
        const snackBarRef = this.snackBar.open(sErrors, "Ok");
      }
    }
    else {
      const generalSnackBarRef = this.snackBar.open(errorResponse.message, "Ok");
    }
    
  }




  // handle validation erorrs of type VALIDATION_ERROR
  handleValidationErrors(validationMessages: Array<any> ) {
    let message: any;
    for (message of validationMessages) {
      let ref = message.Path;
      if (ref) {
        if (ref.indexOf(".") == 0) {
          ref = ref.substring(1);
        }
        
        const controlName = this.refHelper.getControlNameFromReference(ref, this.tvComp.groups$);
        
        // for each control, push the validation message and an error
        if (this.tvComp.fg.controls[controlName]) {
          this.tvComp.fg.controls[controlName].setErrors(message.ValidationMessage, {});
        }
      }
      else {
        // global message
        const snackBarRef = this.snackBar.open(message.ValidationMessage, "Ok");
      }
    }
  }




}








//
// Modal Dialog
//

export interface LocalActionDialogData {
  dialogView: Object;
  formGroup: FormGroup;
  caseID: string;
  refTypes: string;
  title: string;

}

@Component({
  selector: 'app-localactiondialog',
  templateUrl: './localactiondialog.component.html',
  styleUrls: ['./localactiondialog.component.scss']
})
export class LocalactiondialogComponent implements OnInit {

  constructor(public localActionDialogRef: MatDialogRef<LocalActionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LocalActionDialogData,
    private gactionsservice: GetActionsService) { }

  dialogView$!: Object;
  formGroup$!: FormGroup;
  caseID$!: string;
  refTypes$!: string;
  title$!: string;

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    // 
  }

  submitDialog() {

    // should call server, post data and retreive stuff
    // in the interum, dialog has updated statue

    this.gactionsservice.sendMessage("refresh", {"action" :"localAction"}, this.data.caseID, "");
    this.localActionDialogRef.close();
  }

  cancelDialog() {
    // because dialog updated state, need to restore before dialog

    this.gactionsservice.sendMessage("restoreState", {"action" :"localAction"}, this.data.caseID, "");
    this.localActionDialogRef.close();
  }

}
export class LocalActionDialog {}


//
// Info Dialog
//

export interface InfoDialogData {

  title: string;
  infoData: string

}

@Component({
  selector: 'app-infodialog',
  templateUrl: './infodialog.component.html',
  styleUrls: ['./infodialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  constructor(public infoDialogRef: MatDialogRef<LocalActionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: InfoDialogData) { }




  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    // 
  }



  cancelInfoDialog() {
    // because dialog updated state, need to restore before dialog
    this.infoDialogRef.close();
  }

}
export class InfoDialog {}




