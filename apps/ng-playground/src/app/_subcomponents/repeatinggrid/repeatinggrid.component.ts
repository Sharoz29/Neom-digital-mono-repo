import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RefreshAssignmentService } from '../../_messages/refreshassignment.service';
import { GetActionsService } from '../../_messages/getactions.service';
import { Subscription, Observable, of } from 'rxjs';
import { GetChangesService } from '../../_messages/getchanges.service';
import { PageInstructionsService } from '../../_messages/pageinstructions.service';


@Component({
  selector: 'app-repeatinggrid',
  templateUrl: './repeatinggrid.component.html',
  styleUrls: ['./repeatinggrid.component.scss']
})
export class RepeatinggridComponent implements OnInit {

  @Input() layoutComp: any;
  @Input()
  formGroup!: FormGroup;
  @Input()
  CaseID!: string;

  repeatHeader$: any;
  repeatRows$: any;
 

  actionMessage: any;
  actionSubscription: Subscription;

  bDisplayGridFooter!: boolean;

  constructor(private raservice: RefreshAssignmentService,
              private gactionsservice: GetActionsService,
              private gcservice: GetChangesService,
              private piservice: PageInstructionsService) { 

    this.actionSubscription = this.gactionsservice.getMessage().subscribe(message => { 
      this.actionMessage = message;

      this.handleFormActions(this.actionMessage.actionName, this.actionMessage.action, this.actionMessage.caseID, this.actionMessage.reference);
    });

  }

  ngOnInit() {
    this.repeatHeader$ = this.layoutComp.header.groups;
    this.repeatRows$ = this.layoutComp.rows;
    this.bDisplayGridFooter = this.layoutComp.displayGridFooter !== false;
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }

  handleFormActions(sAction: string, oAction: any, caseID: string, reference: string) {

    if (caseID === this.CaseID) {

      switch(sAction){
        case "addRow":
          this.addRowAction(oAction, reference);
          break;
        case "deleteRow" :
          this.deleteRowAction(oAction, reference);
          break;
      }
    }
  }

  getRepeatRef(sRef: string) : string {
    const arProps = sRef.split(".");
    for (let i = arProps.length -1; i > 0; i--) {
      const sProp = arProps[i];
      if (sProp.indexOf("(") >= 0) {
        break;
      }
      else {
        arProps.pop();
      }
    }

    sRef = arProps.join(".");

    // now get rid of last ()
    sRef = sRef.substring(0, sRef.lastIndexOf("("));

    return sRef;
  }

  addRowAction(oAction: any, rowRef: string, groupRowRef: string | null = "", bAppend= false) {

    const sCompareRef = this.getRepeatRef(rowRef);


    let sRowEditing = "row";
    if (this.layoutComp.repeatRowOperations && this.layoutComp.repeatRowOperations.rowEditing) {
      sRowEditing = this.layoutComp.repeatRowOperations.rowEditing
    }
 
    if (sRowEditing == "readOnly") {
      return;
    }
    
    const sRef = this.layoutComp.reference;
    
    if (sCompareRef != sRef) {
      return;
    }

    const sRefType = this.layoutComp.referenceType;
    let sRowIndex = rowRef.substring(rowRef.lastIndexOf("(")+ 1, rowRef.lastIndexOf(")"));
    const bUseNewRow = localStorage.getItem("useNewRow") == "true" ? true : false;
    const bUseRepeatPageInstructions = localStorage.getItem("useRepeatPageInstructions") == "true" ? true : false;

    if (!bUseNewRow) {
      return;
    }

    if (sRefType == "List") {

      // pageList

      if (sRowIndex === "<APPEND>") {
        sRowIndex = this.layoutComp.rows.length.toString();
      }
      let rowIndex = parseInt(sRowIndex);
      const rowRefName = rowRef.substring(0, rowRef.lastIndexOf("("));
      const sRowRef = rowRef.substring(0, rowRef.lastIndexOf(")") + 1);

      if (rowRefName == sRef) {
        const addRowNum = rowIndex; // already 1 greater, since 1 based, but array is 0 based
        // copy
        let addRowJSON = JSON.stringify(this.layoutComp.newRow);
        let addRow = JSON.parse(addRowJSON);
        let sIndexPrefix = sRef;
        if (sIndexPrefix.indexOf(".")>= 0) {
          sIndexPrefix = sIndexPrefix.substring(sIndexPrefix.lastIndexOf(".")+1);
        }


        // template newRow is (listIndex) for pageList
        const sRefToken = addRow.listIndex;

        if (bAppend) {
          rowIndex++;
        }
        
        const sNewRef = rowRefName.concat("(").concat(rowIndex.toString()).concat(")");
        addRowJSON = this.replaceReferenceJSON(addRowJSON, sRefToken, rowIndex.toString());
        addRow = JSON.parse(addRowJSON);

        // remove listIndex
        delete addRow.listIndex;

        this.layoutComp.rows.splice(rowIndex -1, 0, addRow);

        this.updateRowsWithNewReferenceFrom(this.layoutComp.rows, rowIndex, rowRefName, true);
       
        if (bUseRepeatPageInstructions) {
          if (bAppend) {
            this.piservice.sendMessage(this.CaseID, sRefType, "APPEND", sRef, rowIndex.toString(), {});
          }
          else {
            this.piservice.sendMessage(this.CaseID, sRefType, "INSERT", sRef, rowIndex.toString(), {});
          }
        }

        this.gcservice.sendMessage( "ALL", "", this.CaseID, sRefType);
        
      }
    }
    else {

      // pageGroup

      // sRowIndex will be a string
      const rowRefName = rowRef.substring(0, rowRef.lastIndexOf("("));
      
      let bGotValidIndex = !!groupRowRef;
      
      while(!bGotValidIndex){
        groupRowRef = prompt("Enter a Valid Row name that doesn't exist to add", "");
        // Cancel case
        if(groupRowRef === null){
          break;
        }
        // Checking row name validity (Unique alphanumeric values starting with an alphabet are allowed)
        else if(groupRowRef !== "" && /^[a-z]+[a-z0-9]*$/i.test(groupRowRef)){
          bGotValidIndex = !this.layoutComp.rows.find( (row: { groupIndex: string | null; }) => row.groupIndex === groupRowRef );
        }      
      }

      if(!bGotValidIndex){
        return;
      }

      if (rowRefName == sRef) {

        // template newRow is (groupIndex) for pageGroup
        const addRow = JSON.parse(JSON.stringify(this.layoutComp.newRow));
        const sOldRef = rowRefName.concat("(" + addRow.groupIndex + ")");
        const sNewRef = sOldRef.replace(addRow.groupIndex, groupRowRef as string);

        this.replaceReference(addRow, "groups", sOldRef, sNewRef, groupRowRef as string);

        addRow.groupIndex = groupRowRef;

        this.layoutComp.rows.splice(this.layoutComp.rows.length, 0, addRow);

        if (bUseRepeatPageInstructions) {
          this.piservice.sendMessage(this.CaseID, sRefType, "ADD", sRef, groupRowRef as string, {});
        }

        this.gcservice.sendMessage( "ALL", "", this.CaseID, sRefType);
      }

    }


  }

  escapeRegExp(str: string): string {
    
    // eslint-disable-next-line no-useless-escape
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  replaceReferenceJSON(sElement: string, sRef: string, sIndex: string) : string {
    return sElement.replace( new RegExp(this.escapeRegExp(sRef), 'g'), sIndex);
  }

  deleteRowAction(oAction: any, rowRef: string, groupRowRef: string | null ="") {
    let sRowEditing = "row";
    if (this.layoutComp.repeatRowOperations && this.layoutComp.repeatRowOperations.rowEditing) {
      sRowEditing = this.layoutComp.repeatRowOperations.rowEditing
    }
 
    if (sRowEditing == "readOnly") {
      return;
    }

    const sCompareRef = this.getRepeatRef(rowRef);

    const sRef = this.layoutComp.reference;
    if (sCompareRef != sRef) {
      return;
    }


    const sRefType = this.layoutComp.referenceType;
    let sRowIndex = rowRef.substring(rowRef.lastIndexOf("(")+ 1, rowRef.lastIndexOf(")"));
    const bUseNewRow = localStorage.getItem("useNewRow") == "true" ? true : false;
    const bUseRepeatPageInstructions = localStorage.getItem("useRepeatPageInstructions") == "true" ? true : false;

    if (!bUseNewRow) {
      return;
    }

    if (sRefType == "List") {
      if (sRowIndex === "<LAST>") {
        sRowIndex = this.layoutComp.rows.length.toString();
      }
      const rowIndex = parseInt(sRowIndex);

      
      const rowRefName = rowRef.substring(0, rowRef.lastIndexOf("("));


      if (rowRefName == sRef) {
        // ref is 1 based, but array is 0 based
        const deleteRowNum = rowIndex - 1;
        if (this.layoutComp.rows.length > deleteRowNum) {
          this.layoutComp.rows.splice(deleteRowNum, 1);
        }

        this.updateRowsWithNewReferenceFrom(this.layoutComp.rows, deleteRowNum, rowRefName, false);

        if (bUseRepeatPageInstructions) {
          this.piservice.sendMessage(this.CaseID, sRefType, "DELETE", sRef, rowIndex.toString(), {});
        }

        this.gcservice.sendMessage( "ALL", "", this.CaseID, sRefType);
        
      }
    }
    else {
      // group
      const rowRefName = rowRef.substring(0, rowRef.lastIndexOf("("));

      if (rowRefName == sRef) {
        // going to have to iterate through list of rows, see if have it, get index
        const deleteRowIndex = this.findIndexOfRow(this.layoutComp.rows, rowRef);
        if (deleteRowIndex >= 0) {
          this.layoutComp.rows.splice(deleteRowIndex, 1);
        }

        if (bUseRepeatPageInstructions) {
          this.piservice.sendMessage(this.CaseID, sRefType, "DELETE", sRef, groupRowRef as string, {});
        }

        this.gcservice.sendMessage( "ALL", "", this.CaseID, sRefType);

      }
    }

  }

  findIndexOfRow(oRows: any, sRowRef: string): number {
    let rowIndex = -1;
    for (const index in oRows) {
      const oRow = oRows[index];
      const sRowJson = JSON.stringify(oRow);

      if (sRowJson.indexOf(sRowRef) >= 0) {
        rowIndex = parseInt(index);
        break;
      }

    }

    return rowIndex;
  }

  updateRowsWithNewReferenceFrom(oRows: any, nStartingIndex: number, sReferencePrefix: string,  bIncrement = true): any {
    const nRowLength = oRows.length;
    for ( let nIndex = nStartingIndex; nIndex < nRowLength; nIndex++ ) {
      const oRow = oRows[nIndex];

      let sNewRef = "";
      let sRef;
      let sNewIndex;
      let sOldIndex;
      if (bIncrement) {
        sNewRef = sReferencePrefix.concat("(").concat((nIndex + 1).toString()).concat(")");
        sRef = sReferencePrefix.concat("(").concat(nIndex.toString()).concat(")");
        sNewIndex = (nIndex + 1).toString();
        sOldIndex = nIndex.toString();
      }
      else {
        // should be a number higher, and so if we set to index, should be one less
        sNewRef = sReferencePrefix.concat("(").concat((nIndex + 1).toString()).concat(")");
        sRef = sReferencePrefix.concat("(").concat((nIndex + 2).toString()).concat(")");
        sNewIndex = (nIndex + 1).toString();
        sOldIndex = (nIndex + 2).toString();
      }

      // iterate though all the stuff in the row and change the reference
      this.replaceReference(oRow, "groups", sRef, sNewRef, sNewIndex, sOldIndex);



    }

  }

  replaceReference(oElement: any, oElementType: string, sOldReference: string, 
                    sNewReference: string, sNewIndex: string, sOldIndex= "") {

    switch (oElementType) {
      case "groups" :
        for (const groupIndex in oElement.groups) {
          const groupElement = oElement.groups[groupIndex];
          for (const elType in groupElement) {
            this.replaceReference(groupElement, elType, sOldReference, sNewReference, sNewIndex, sOldIndex);
          }
        }
        break;
      case "field" :
        if (oElement.field.reference) {
          oElement.field.reference = oElement.field.reference.replace(sOldReference, sNewReference, sNewIndex);
        }
       
        if (oElement.field.controlName) {
          //oElement.field.controlName = oElement.field.controlName.replace(sOldReference, sNewReference, sNewIndex);
        }
        if (oElement.field.fieldID == "pxSubscript") {
          oElement.field.value = sNewIndex;
        }

        this.updateRefreshFor(oElement.field.control, sNewIndex, sOldIndex);

        break;
      case "layout" :
        if (oElement.layout.reference) {
          oElement.layout.reference = oElement.layout.reference.replace(sOldReference, sNewReference, sNewIndex);
        }
        for (const groupIndex in oElement.layout.groups) {
          const groupElement = oElement.layout.groups[groupIndex];
          for (const elType in groupElement) {
            this.replaceReference(groupElement, elType, sOldReference, sNewReference, sNewIndex, sOldIndex);
          }
        }
        break;
      case "view" :
        if (oElement.view.reference) {
          oElement.view.reference = oElement.view.reference.replace(sOldReference, sNewReference, sNewIndex);
        }

        for (const groupIndex in oElement.view.groups) {
          const groupElement = oElement.view.groups[groupIndex];
          for (const elType in groupElement) {
            this.replaceReference(groupElement, elType, sOldReference, sNewReference, sNewIndex, sOldIndex);
          }        
        }
        break;
    }

  }

  updateRefreshFor(oControl: { actionSets: { [x: string]: { actions: any; }; } | null; }, sNewIndex: string, sOldIndex: string) {
    if (oControl.actionSets != null) {

      for (const setIndex in oControl.actionSets) {
        const arActions = oControl.actionSets[setIndex].actions;

        for (const actionIndex in arActions) {
          const oAction = arActions[actionIndex];

          if (oAction.refreshFor != null) {
            let sRefreshFor = oAction.refreshFor;
            let sIndex = sRefreshFor.lastIndexOf("_");
            if (sIndex > 0) {
              sRefreshFor = sRefreshFor.substring(0, sIndex+1);
              sRefreshFor = sRefreshFor.concat(sNewIndex);

              oAction.refreshFor = sRefreshFor;

            }
            else {
              // old reference could be missing "_"
              if (sOldIndex != "") {
                sIndex = sRefreshFor.lastIndexOf(sOldIndex);
                if (sIndex > 0) {
                  sRefreshFor = sRefreshFor.substring(0, sIndex);
                  sRefreshFor = sRefreshFor.concat(sNewIndex);
    
                  oAction.refreshFor = sRefreshFor; 
                }
              }
            }
          }
        }
      }
    }
  }



  updateReference(sReference: string, sReferencePrefix: string, sReferenceIndex: string): string {
    let sRefEnd = sReference.replace(sReferencePrefix, ""); 
    sRefEnd = sRefEnd.substring(sRefEnd.indexOf(")"));  // keeps trailing )

    sReference = sReferencePrefix.concat("(") + sReferenceIndex + sRefEnd;


    return sReference;
  }



  addRow() {

    let sRowEditing = "row";
    if (this.layoutComp.repeatRowOperations && this.layoutComp.repeatRowOperations.rowEditing) {
      sRowEditing = this.layoutComp.repeatRowOperations.rowEditing
    }
 
    if (sRowEditing != "readOnly") {

      const bUseNewRow = localStorage.getItem("useNewRow") == "true" ? true : false;
      if (this.layoutComp.referenceType === "List") {
        // list
        // check if have "newRow", if so, use that method
        if (bUseNewRow) {
          const sRef = this.layoutComp.reference.concat("(<APPEND>)");
          this.addRowAction(null, sRef, null, true);
        }
        else {
          const addRowData = { 'rowNum': '', 'layoutData': this.layoutComp };
          this.raservice.sendMessage("addRow", addRowData);
        }



      }
      else {
        // group
        let rowName: string | null = "";
        let bGotValidIndex = false;

        while(!bGotValidIndex){
          rowName = prompt("Enter a Valid Row name that doesn't exist to add", "");
          // Cancel case
          if(rowName === null){
            break;
          }
          // Checking row name validity (Unique alphanumeric values starting with an alphabet are allowed)
          else if(rowName !== "" && /^[a-z]+[a-z0-9]*$/i.test(rowName)){
            bGotValidIndex = !this.layoutComp.rows.find( (row: { groupIndex: string; }) => row.groupIndex === rowName );
          }      
        }

        if(!bGotValidIndex){
          return;
        }

        // check if have "newRow", if so, use that method
        if (bUseNewRow) {
          const sRef = this.layoutComp.reference.concat("(" + rowName + ")");
          this.addRowAction(null, sRef, rowName);
        }
        else {
          const addGroupData = { 'rowName': rowName, 'layoutData': this.layoutComp};
          this.raservice.sendMessage("addRow", addGroupData);
        }

      }
   } 


  }

  removeRow() {
    let sRowEditing = "row";
    if (this.layoutComp.repeatRowOperations && this.layoutComp.repeatRowOperations.rowEditing) {
      sRowEditing = this.layoutComp.repeatRowOperations.rowEditing
    }
 
    if (sRowEditing != "readOnly") {

      const bUseNewRow = localStorage.getItem("useNewRow") == "true" ? true : false;
      if (this.layoutComp.referenceType === "List") {
        // list
  
        // check if have "newRow", if so, use that method
        if (bUseNewRow) {
          const sRef = this.layoutComp.reference.concat("(<LAST>)");
          this.deleteRowAction(null, sRef);
        }
        else {
          const removeRowData = { 'rowNum': '', 'layoutData': this.layoutComp };
          this.raservice.sendMessage("removeRow", removeRowData);
        }
  
      }
      else {
        // group
        let bGotValidIndex= false;
        let rowName: string | null = "";
        
        while(!bGotValidIndex){
          rowName = prompt("Enter a Row name that exists to remove", "");

          if(rowName === null){
            break;
          }
          // checking for valid row names before actually looking at rows
          else if(rowName !== "" && /^[a-z]+[a-z0-9]*$/i.test(rowName)){
            bGotValidIndex = this.layoutComp.rows.find( (row: { groupIndex: string | null; }) => row.groupIndex === rowName );
          }

        }

        if(!bGotValidIndex){
          return;
        }
  
        // check if have "newRow", if so, use that method
        if (bUseNewRow) {
          const sRef = this.layoutComp.reference.concat("(" + rowName + ")");
          this.deleteRowAction(null, sRef, rowName);
        }
        else {
          const removeGroupData = { 'rowName': rowName, 'layoutData': this.layoutComp };
          this.raservice.sendMessage("removeRow", removeGroupData);
        }
      }
    }



  }


}
