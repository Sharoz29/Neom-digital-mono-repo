import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { appConstants } from "../_constants/AppConstants";

@Injectable({
  providedIn: "root",
})
export class RightPanelService {
  private bShowRightPanel: boolean = localStorage.getItem("showRightPanel") == "true";
  private sRightPanelSection: string = localStorage.getItem("rightPanelSection") || appConstants.DEFAULT_RIGHT_PANEL_SECTION;

  private subject = new BehaviorSubject<any>({
    bShowRightPanel: this.bShowRightPanel,
    sRightPanelSection: this.sRightPanelSection,
  });

  sendMessage(bShowRightPanel: boolean, sRightPanelSection: string) {
    this.subject.next({
      bShowRightPanel: bShowRightPanel,
      sRightPanelSection: sRightPanelSection || this.sRightPanelSection,
    });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
