
import * as _ from "lodash";

export class ReferenceHelper {

   lastControlID = 0;

  /**
   * Turn simple object with flat references into nested object to be POSTed.
   * E.g. { "pyWorkPage.Address.Street": "1 Rogers St" } --> {"Address":{"Street":"1 Rogers St"}}
   * Handles nested page lists and page groups.
   * @param { Object } newValues - An object containing fully qualified property paths as keys.
   * @return { Object } Object with nested keys and values corresponding to property paths.
   */
  getPostContent(newValues: Record<string, any>, updatedFields?: any, postableFields?: any) {
    const content = {};
    const bUseRepeatPI = localStorage.getItem("useRepeatPageInstructions") == "true";
    const bUseEmbedPI = localStorage.getItem("usePagePageInstructions") == "true";
    Object.keys(newValues).forEach(key => {
      /**  `updatedFields.size === 0` check is added for pyAuditNote, pyChangeStageOption, etc fields since there isn't any 'change' event
       *  that gets triggered for these fields and hence we don't add them in updatedFields set. */ 
      if (updatedFields && (updatedFields.size === 0 || updatedFields.has(key))) {
        const skipEntry = (bUseRepeatPI && key.includes("(")) || (bUseEmbedPI && key.includes(".") && !key.includes("("));
        if( !skipEntry ) {
          const nLastDot = key.lastIndexOf(".");
          const sFieldRef = key.substring(nLastDot + 1);
               
          if( !postableFields || (postableFields && postableFields.has(sFieldRef))) {
            ReferenceHelper.addEntry(key, newValues[key], content);
          } 
        }
      }
    });

    return content;
  }

  /**
   * Add entry in nested object for each flat fully qualified key.
   * @param { String } key - fully qualified path, e.g. pyWorkPage.Address.Street
   * @param { String } value - value corresponding to key
   * @param { Object } content - Object into which to add entry
   */
  static addEntry(key: string, value: any, content: Record<string, any>) {

    const propertyPathParts = key.split(".");
    const propertyName = propertyPathParts.pop();

    for (let i = 0; i < propertyPathParts.length; i++) {
      const pathPart = propertyPathParts[i];

      // Do not include pyWorkPage in content
      if (pathPart === "pyWorkPage") {
        continue;
      }

      // regex to match repeating references (PageList / PageGroup)
      if (/(.*)[(].+[)]$/.test(pathPart)) {
        // Use regex to split on parens to get ref and index, use filter to remove empty string at end
        const pageListParts = pathPart.split(/[()]/).filter(Boolean);
        const pageName = pageListParts[0];
        let pageIndex: any = pageListParts[1];

        if (isNaN(pageIndex)) {
          // Handling page group (associative array)
          if (!content[pageName]) {
            content[pageName] = { [pageIndex]: {} };
          }

          if (!content[pageName][pageIndex]) {
            content[pageName][pageIndex] = {};
          }

          content = content[pageName][pageIndex];
        } else {
          // Handling page list (1-indexed array)
          pageIndex = parseInt(pageIndex, 10);

          if (!content[pageName]) {
            content[pageName] = [];
          }

          for (let j = 0; j < pageIndex; j++) {
            if (!content[pageName][j]) {
              content[pageName][j] = {};
            }

            // if we are in the last iteration, that is the next object we want to nest into
            if (j === pageIndex - 1) {
              content = content[pageName][j];
            }
          }
        }
      } else {
        // We are dealing with a simple page, not list/group
        if (!content[pathPart]) {
          content[pathPart] = {};
        }
        content = content[pathPart];
      }
    }

    content[propertyName!] = value;
  }

  /**
   * Get target repeating data structure from the PageGroup/List reference.
   * E.g. given 'pyWorkPage.Addresses' of type 'Group', return the Addresses object.
   * @param { String } reference - Property reference for PageGroup/List (e.g. pyWorkPage.Addresses)
   * @param { String } referenceType - Type of repeat. Group or List.
   * @param { Object } obj - Object to search for matching repeat object.
   * @return { Object / Array } Returns an object for PageGroup, array for PageList
   */
  getRepeatFromReference(reference: string, referenceType: string, obj: {}) {
    const propertyPathParts = reference.split(".");
    const propertyName = propertyPathParts.pop();
    let tempObj: Record<string, any> = obj;

    // Consume each piece of property reference, indexing into object
    for (let i = 0; i < propertyPathParts.length; i++) {
      const pathPart = propertyPathParts[i];

      // Do not include pyWorkPage in content
      if (pathPart === "pyWorkPage") {
        continue;
      }

      // regex to match repeating references (PageList / PageGroup)
      if (/(.*)[(].+[)]$/.test(pathPart)) {
        // Use regex to split on parens to get ref and index, use filter to remove empty string at end
        const pageListParts = pathPart.split(/[()]/).filter(Boolean);
        const pageName = pageListParts[0];
        let pageIndex: any = pageListParts[1];

        if (isNaN(pageIndex)) {
          // Handling page group (associative array)
          tempObj = tempObj[pageName][pageIndex];
        } else {
          // Handling page list (Pega uses 1-indexed array, convert to 0-indexed)
          pageIndex = parseInt(pageIndex, 10) - 1;
          tempObj = tempObj[pageName][pageIndex];
        }
      } else {
        // We are dealing with a non-pagegroup/list object. Index into it directly.
        tempObj = tempObj[pathPart];
      }
    }

    // Initialize repeat if not previously initialized
    // If it is a page group, it must be an object. Otherwise, array.
    if (!tempObj[propertyName!]) {
      tempObj[propertyName!] = referenceType === "Group" ? {} : [];
    }

    return tempObj[propertyName!];
  }

  /**
   * Given array or object corresponding to repeat, get a blank entry.
   * This is to get a 'blank' entry to be appended onto array for PageList,
   * or added into the object for a PageGroup.
   * @param { Object/Array } obj - Object from which to get blank entry. Object for PageGroup, or Array for PageList.
   */
  getBlankRowForRepeat(obj: any[]) {
    let blankRow;

    if (Array.isArray(obj)) {
      // Since we are preventing deleting the last row, it is always safe to assume there is 1 row in arr
      blankRow = _.cloneDeep(obj[0]);
    } else {
      // Dealing with Page Group, use random key as model to blank out
      blankRow = _.cloneDeep(obj[Object.keys(obj)[0]]);
    }

    ReferenceHelper.setObjectValuesBlank(blankRow);
    return blankRow;
  }

  /**
   * Used to blank out all initial values for an Object.
   * Used when appending an entry onto a PageList, or adding an entry for a PageGroup.
   * @param { Object } obj - Object whose values to blank
   */
  static setObjectValuesBlank(obj: Record<string,any> | null) {
    if (obj != null) {
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Ecountered an array of objects, ensure its length is only 1 and blank its values
        if (Array.isArray(obj[key])) {
          obj[key].splice(1);
          this.setObjectValuesBlank(obj[key][0]);

          // Encountered an object, blank its values
        } else if (typeof obj[key] === "object") {
          this.setObjectValuesBlank(obj[key]);

          // Encountered a plain key, set it's value blank
        } else {
          obj[key] = "";
        }
      }
    }
  }

  /**
   * Get PageGroup key given layout row.
   * To assist when constructing PageGroup grid.
   * @param { Object } row - corresponding to layout containing PageGroup
   * @return { String } String name of the PageGroup key corresponding to the layout row
   */
  static getPageGroupKeyFromRow(row: { groups: string | any[]; }) {
    for (let i = 0; i < row.groups.length; i++) {
      if (row.groups[i].field && row.groups[i].field.reference) {
        const pathParts = row.groups[i].field.reference.split(".");

        // Iterate backwards over path parts, because we want deepest pagegroup
        // To supported multi-nested PageGroups
        for (let j = pathParts.length - 1; j >= 0; j--) {
          if (/(.*)[(].+[)]$/.test(pathParts[j])) {
            // Use regex to split on parens to get ref and index, use filter to remove empty string at end
            const pageListParts = pathParts[j].split(/[()]/).filter(Boolean);

            // PageGroup keyname will always be the second part of above split on parens
            return pageListParts[1];
          }
        }
      }
    }

    return "";
  }

  /**
   * Get initial state for PegaForm, with all flat references.
   * We need all initial references on WO state so that when we add /remove a row
   * to a repeating list, we know where to append / delete.
   * This takes a view, and returns an object with all field references present.
   * @param { Object } view - View receieved from API endpoint
   * @return { Object } Object containing all initial property paths and values.
   */
  getInitialValuesFromView(view: any, state: {} | undefined, bHasPI: boolean, bHasPagePI: boolean, postableFields: Set<unknown>) {
    return ReferenceHelper.processView(view, state, bHasPI, bHasPagePI, postableFields);
  }

  /**
   * Process a view from layout API data
   * @param { Object } view - view object
   * @param { Object } state - object in which to collect all initial paths and values. Defaults to empty obj.
   * @return { Object } object in which all initial paths and values are collected.
   */
  static processView(view: { visible: any; pageID: any; groups: any; }, state = {}, bHasPI: any, bHasPagePI: any, postableFields: any) {
    if (view?.visible || view?.pageID) {
      ReferenceHelper.processGroups(view.groups, state, bHasPI, bHasPagePI, postableFields);
    }

    return state;
  }

  /**
   * Process an array of groups from layout API
   * @param { Array } groups - Corresponds to Groups array of objects return from API
   * @param { Object } state - object in which all initial paths and values are collected.
   */
  static processGroups(groups: string | any[], state: Record<any,any>, bHasPI: any, bHasPagePI: any, postableFields: any) {
    if( !groups ) return;
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];

      if (group.view) {
        ReferenceHelper.processView(group.view, state, bHasPI, bHasPagePI, postableFields);
      }

      if (group.layout) {
        ReferenceHelper.processLayout(group.layout, state, bHasPI, bHasPagePI, postableFields);
      }

      if (group.field) {
        ReferenceHelper.processField(group.field, state, postableFields);
      }

    }
  }



  /**
   * Process a layout from layout API
   * @param { Object } layout - layout object
   * @param { Object } state - object in which all initial paths and values are collected.
   */
  static processLayout(layout: { rows: any[]; view: any; groups: any; }, state: Record<any,any>, bHasPI: any, bHasPagePI: any, postableFields: any) {
    if (layout.rows) {
      layout.rows.forEach((row: { groups: any; }) => {
        ReferenceHelper.processGroups(row.groups, state, bHasPI, bHasPagePI, postableFields);
      });
    } else if (layout.view) {
        ReferenceHelper.processView(layout.view, state, bHasPI, bHasPagePI, postableFields);
    } else {
      ReferenceHelper.processGroups(layout.groups, state, bHasPI, bHasPagePI, postableFields);
    }
  }

  /**
   * Process a field from layout API.
   * It is at this point that an entry is added to the state object.
   * @param { Object } field - field object returns from API
   * @param { Object } state - object in which key/value entry is added for property reference.
   */
  static processField(field: { visible: any; control: { type: string; }; readOnly: any; disabled: any; reference: string; value: string; fieldID: any; }, state: Record<string,any>, postableFields: { add: (arg0: any) => void; }) {
    if ((field.visible || (field.control && field.control.type === "pxHidden"))  && !field.readOnly && !field.disabled)  {    
      // can not post pyTemplateGeneric
      if (field.reference  && field.reference != "" && field.reference.indexOf("pyTemplate") < 0 ) {
        state[field.reference] = this.htmlDecode_local(field.value);
        postableFields.add(field.fieldID);
      }

    }
  }


  customUpdateJSON(object: Record<any,any> | object | any, key: string, value: string): any{
    if (Object.prototype.hasOwnProperty.call(object, key) && object[key]==value) {
        return object;
    }

    for (let i=0; i<Object.keys(object).length; i++) {
        if (typeof object[Object.keys(object)[i]]=="object") {
            const objNode = this.customUpdateJSON(object[Object.keys(object)[i]], key, value);
            if (objNode != null)
                return objNode;
        }
    }

    return null;
  } 

/*
  getControlNameFromReference(sRef: string) {
    let returnString = sRef.replace(/\./gi, "-");
    //returnString = returnString.replace(/\(/gi, "-");
    //returnString = returnString.replace(/\)/gi, "-");


    return returnString;
  }
*/

  getControlNameFromReference(sRef: string, oNode: object): string {
    const arList: string | any[] = [];
    this.findObjects(oNode, "reference", sRef, arList);

    if (arList.length > 0) {
      const oField = arList[0];
      return oField.controlName;
    }
    else {
      return "";
    }
  }


  findObjects(obj: Record<any,any> | object | any, targetProp: string, targetValue: string, finalResults: any[]) : any {

    function getObject(theObject: Record<any,any> | object | any) {
      const result = null;
      if (theObject instanceof Array) {
        for (let i = 0; i < theObject.length; i++) {
          getObject(theObject[i]);
        }
      }
      else {
        for (const prop in theObject) {
          if(Object.prototype.hasOwnProperty.call(theObject, prop)){
            //console.log(prop + ': ' + theObject[prop]);
            if (prop === targetProp) {
              //console.log('--found id');
              if (theObject[prop] === targetValue) {
                //console.log('----found porop', prop, ', ', theObject[prop]);
                finalResults.push(theObject);
              }
            }
            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array){
              getObject(theObject[prop]);
            }
          }
        }
      }
    }
  
    getObject(obj);
  
  }

  removeDataPages(stateObject: Record<string, any>) {

    for (const sKey in stateObject) {
      if (sKey.indexOf("D_") == 0 || sKey.indexOf("Declare_") == 0 ) {
        delete stateObject[sKey];
      }
    }

    return stateObject;

  }

  static htmlDecode_local(sVal:string ):string {
    const doc = new DOMParser().parseFromString(sVal, "text/html");
    return doc.documentElement.textContent || "";
  }

  htmlDecode(sVal:string):string {
    if(sVal === undefined){
      return "";
    }
    return ReferenceHelper.htmlDecode_local(sVal);
  }


  updateViewWithLocalState(view: any, state: Record<string, any>) {
    return ReferenceHelper.updateViewWithState(view, state);
  }

  static updateViewWithState(view: { groups: any; }, state: any) {

    ReferenceHelper.updateGroupsWithState(view.groups, state);


    return view;
  }

  static updateGroupsWithState(groups: string | any[], state: any) {
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];

      if (group.view) {
        ReferenceHelper.updateViewWithState(group.view, state);
      }

      if (group.layout) {
        ReferenceHelper.updateLayoutWithState(group.layout, state);
      }

      if (group.field) {

        ReferenceHelper.updateFieldWithState(group.field, state);
      }
    }   

  }

  static updateLayoutWithState(layout: { rows: any[]; groups: any; }, state: any) {

    if (layout.rows) {
      layout.rows.forEach((row: { groups: any; }) => {
        ReferenceHelper.updateGroupsWithState(row.groups, state);
      });
    } else {
      ReferenceHelper.updateGroupsWithState(layout.groups, state);
    }
  }

  static updateFieldWithState(field: { visible: any; control: { type: string; }; readOnly: any; disabled: any; reference: string ; value: any; }, state: Record<string,any>) {

    if ((field.visible || (field.control && field.control.type === "pxHidden"))  && !field.readOnly && !field.disabled && field.reference)  {
      
      // can not post pyTemplateGeneric
      if (field.reference.indexOf("pyTemplate") < 0) {
        if (state[field.reference] != null) {
          field.value = state[field.reference];
        }
      }

    }
  }

  getUniqueControlID() : string {

    const sPrefix = "control-";

    this.lastControlID++;

    return sPrefix + this.lastControlID.toString();



  }

  isTrue(val: any) : boolean {
    let bReturn = false;
    if (typeof(val) == "string") {
      if (val.toLowerCase() == "true") {
        bReturn = true;
      }
    }
    else {
      bReturn = val;
    }

    return bReturn;
  }

}
