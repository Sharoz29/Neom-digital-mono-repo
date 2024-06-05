import { Component, OnInit, Inject } from '@angular/core';
import { GetLoginStatusService } from "../_messages/getloginstatus.service";
import { ChangeDetectorRef } from "@angular/core";
import { Subscription, Observable } from 'rxjs';
import { AssignmentService } from "../_services/assignment.service";
import { OpenAssignmentService } from "../_messages/openassignment.service";
import { ProgressSpinnerService } from "../_messages/progressspinner.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef  } from '@angular/material/dialog';
import { endpoints } from '../_services/endpoints';
import { appConstants } from '../_constants/AppConstants';
import { AuthService } from '../_services/auth.service';
import { RightPanelService } from '../_messages/right-panel.service';
import { GetAttachmentsService } from '../_messages/getAttachments.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  bLoggedIn= !!sessionStorage.getItem("pega_ng_user");
  userName$: string | null= "";
  subscription!: Subscription;
  isProgress$= false;

  progressSpinnerMessage: any;
  progressSpinnerSubscription!: Subscription;


  bUseNewRow! : boolean;
  bUseRepeatPageInstructions!: boolean;
  bUsePagePageInstructions!: boolean;
  bUseLocalOptionsForDataPage!: boolean;
  bUseLocalOptionsForClipboardPage!: boolean;
  bUseScreenFlow!: boolean;
  bUsePostAssignSave!: boolean;
  bShowRightPanel!: boolean;
  bShowAttachments!: boolean;
  sRightPanelSection!: string;

  version = appConstants.VERSION;
  constructor(
    private glsservice: GetLoginStatusService,
    private cdRef: ChangeDetectorRef,
    private aservice: AssignmentService,
    private oaservice: OpenAssignmentService,
    private snackBar: MatSnackBar,
    private settingsDialog: MatDialog,
    private psservice: ProgressSpinnerService,
    private authservice: AuthService,
    private rightPanelService: RightPanelService,
    private getAttachmentsService: GetAttachmentsService,
  ) {}

  ngOnInit() {

    if (sessionStorage.getItem("pega_ng_user")) {
      // if have a user, then have already logged in
      this.bLoggedIn = true;
      this.userName$ = sessionStorage.getItem("userName");
    }


    this.subscription = this.glsservice.getMessage().subscribe(
      message => {
        if (message.loginStatus === 'LoggedIn') {
          this.bLoggedIn = true;
          this.userName$ = sessionStorage.getItem("userName");
        }
        else {
          this.bLoggedIn = false;
        }

        this.cdRef.detectChanges();
      }

  );

    // handle showing and hiding the progress spinner
    this.progressSpinnerSubscription = this.psservice.getMessage().subscribe(message => { 
      this.progressSpinnerMessage = message;

      this.showHideProgress(this.progressSpinnerMessage.show);
    });

    // make all 8.3 by default
    this.setLocalDefaults();

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.progressSpinnerSubscription.unsubscribe();
  }

  getSettingsFromLocalStorage(){
    this.bUseNewRow = localStorage.getItem("useNewRow") !== "false";
    this.bUseRepeatPageInstructions = localStorage.getItem("useRepeatPageInstructions") !== "false";
    this.bUsePagePageInstructions = localStorage.getItem("usePagePageInstructions") !== "false";
    this.bUseLocalOptionsForDataPage = localStorage.getItem("useLocalOptionsForDataPage") !== "false";
    this.bUseLocalOptionsForClipboardPage = localStorage.getItem("useLocalOptionsForClipboardPage") !== "false";
    this.bUseScreenFlow = endpoints.BASEV2URL !== undefined;
    this.bUsePostAssignSave = localStorage.getItem("usePostAssignSave") === "true";
    this.bShowRightPanel = localStorage.getItem("showRightPanel") == "true";
    this.bShowAttachments = localStorage.getItem("showAttachments") == "true";
    this.sRightPanelSection = localStorage.getItem("rightPanelSection") || appConstants.DEFAULT_RIGHT_PANEL_SECTION;
  }

  setLocalDefaults() {

    this.getSettingsFromLocalStorage();

    localStorage.setItem("useNewRow", this.bUseNewRow.toString());
    localStorage.setItem("useRepeatPageInstructions", this.bUseRepeatPageInstructions.toString());
    localStorage.setItem("usePagePageInstructions", this.bUsePagePageInstructions.toString());
    localStorage.setItem("useLocalOptionsForDataPage", this.bUseLocalOptionsForDataPage.toString());
    localStorage.setItem("useLocalOptionsForClipboardPage", this.bUseLocalOptionsForClipboardPage.toString());
    localStorage.setItem("useScreenFlow", this.bUseScreenFlow.toString());
    localStorage.setItem("usePostAssignSave", this.bUsePostAssignSave.toString());
    localStorage.setItem("showRightPanel", this.bShowRightPanel.toString());
    localStorage.setItem("rightPanelSection", this.sRightPanelSection);
    localStorage.setItem("showAttachments", this.bShowAttachments.toString());
  }

  getNextWork() {

    this.psservice.sendMessage(true);

    this.aservice.getAssignment("next").subscribe(
      assignmentResponse => {
        const nextWork : any = assignmentResponse.body;

        if (nextWork.ID && nextWork.ID != "") {

          const nextAssignment: Record<string, any> = {};

          const arCase = nextWork.caseID.split(" ");
          let currentCaseName = "GetNext";
          if (arCase.length > 1) {
            currentCaseName = arCase[1];
          }

          nextAssignment["pxRefObjectInsName"] = currentCaseName;
          nextAssignment["pxRefObjectKey"] = nextWork.caseID;
          nextAssignment["pzInsKey"] = nextWork.ID;

          this.oaservice.sendMessage(currentCaseName, nextAssignment);
          
        } 
        else {
          const snackBarRef = this.snackBar.open("No next actions to go to", "Ok");
        }


      },
      assignmentError => {
        const snackBarRef = this.snackBar.open("Errors from get assignment:" + assignmentError.errors, "Ok");
      }
    );
  }

  showHideProgress(bShow: boolean) {
    this.isProgress$ = bShow;
    this.cdRef.detectChanges();
  }

  showSettings() {

    this.getSettingsFromLocalStorage();

    const dialogRef = this.settingsDialog.open(SettingsdialogComponent, {
      minWidth: "80%",
      data: {
        bUseNewRow: this.bUseNewRow,
        bUseRepeatPageInstructions: this.bUseRepeatPageInstructions,
        bUsePagePageInstructions: this.bUsePagePageInstructions,
        bUseLocalOptionsForDataPage: this.bUseLocalOptionsForDataPage,
        bUseLocalOptionsForClipboardPage: this.bUseLocalOptionsForClipboardPage,
        bUsePostAssignSave: this.bUsePostAssignSave,
        bUseScreenFlow: this.bUseScreenFlow,
        bShowRightPanel: this.bShowRightPanel,
        sRightPanelSection: this.sRightPanelSection,
        bShowAttachments: this.bShowAttachments,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined) {
        localStorage.setItem("useNewRow", result.bUseNewRow.toString());
        localStorage.setItem("useRepeatPageInstructions", result.bUseRepeatPageInstructions.toString());
        localStorage.setItem("usePagePageInstructions", result.bUsePagePageInstructions.toString());
        localStorage.setItem("useLocalOptionsForDataPage", result.bUseLocalOptionsForDataPage.toString());
        localStorage.setItem("useLocalOptionsForClipboardPage", result.bUseLocalOptionsForClipboardPage.toString());
        localStorage.setItem("useScreenFlow", result.bUseScreenFlow.toString());
        localStorage.setItem("usePostAssignSave", result.bUsePostAssignSave.toString());
        localStorage.setItem("showRightPanel", result.bShowRightPanel.toString());
        localStorage.setItem("rightPanelSection", result.sRightPanelSection);
        localStorage.setItem("showAttachments", result.bShowAttachments.toString());
        this.rightPanelService.sendMessage(result.bShowRightPanel, result.sRightPanelSection);
        this.getAttachmentsService.sendMessage(result.bShowAttachments);
      }
    });
  }

  logOff() {
    if(endpoints.use_OAuth){
      this.authservice.authLogout();
    }else{
      sessionStorage.clear();
    }
    this.glsservice.sendMessage("LoggedOff");

  }

}





export interface SettingsData {
  bUseNewRow : boolean;
  bUseRepeatPageInstructions: boolean;
  bUsePagePageInstructions: boolean;
  bUseLocalOptionsForDataPage: boolean;
  bUseLocalOptionsForClipboardPage: boolean;
  bUseScreenFlow: boolean;
  bUsePostAssignSave: boolean;
  bShowRightPanel: boolean;
  sRightPanelSection: string;
  bShowAttachments: boolean;
}

@Component({

  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'settingsdialog',
  templateUrl: './settingsdialog.component.html',
  styleUrls: ['./settingsdialog.component.scss']
})
export class SettingsdialogComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<SettingsdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SettingsData) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    // no impl
  }

  closeDialog() { 
    this.dialogRef.close({ bUseNewRow: this.data.bUseNewRow, 
      bUseRepeatPageInstructions: this.data.bUseRepeatPageInstructions,
      bUsePagePageInstructions: this.data.bUsePagePageInstructions,
      bUseLocalOptionsForDataPage: this.data.bUseLocalOptionsForDataPage,
      bUseLocalOptionsForClipboardPage: this.data.bUseLocalOptionsForClipboardPage,
      bUseScreenFlow: this.data.bUseScreenFlow,
      bUsePostAssignSave: this.data.bUsePostAssignSave,
      bShowRightPanel: this.data.bShowRightPanel,
      sRightPanelSection: this.data.sRightPanelSection,
      bShowAttachments: this.data.bShowAttachments
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

}
