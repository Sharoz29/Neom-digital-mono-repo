import _ from "lodash";
import { htmlDecode } from '.'
import { refTypes, fieldTypes } from "../_constants";

/**
 * Class to handle translating Pega's fully qualified property paths
 * to a nested Object structure, and vice versa.
 * Also some utility methods for:
 * - Handling initial PegaForm state given View from API
 * - Finding correct PageGroup/List based on property reference
 * - Getting blank entry for PageGroup/List when adding new element
 * When posting data to the server via API, it must be nested.
 * When retrieving field information from the server, the property paths are flat and qualified.
 */
class ReferenceHelper {
  /**
   * Turn simple object with flat references into nested object to be POSTed.
   * E.g. { "pyWorkPage.Address.Street": "1 Rogers St" } --> {"Address":{"Street":"1 Rogers St"}}
   * Handles nested page lists and page groups.
   * @param { Object } newValues - An object containing fully qualified property paths as keys.
   * @return { Object } Object with nested keys and values corresponding to property paths.
   */
  static getPostContent(newValues, oPostSettings = {}){
    let content = {};
    const { bUseEmbedPI, bUseRepeatPI, postableFields, changedFields } = oPostSettings;
    
    Object.keys(newValues).forEach(reference => {
      // When Page Instructions are being utilized, any changes to Embedded Pages, Page Lists
      //  and Page Groups are specified within pageInstructions so exclude from content
      const skipEntry = (bUseRepeatPI && reference.includes("(")) || (bUseEmbedPI && reference.includes(".") && !reference.includes("("));

      // Put only fields that should be POSTed in the content
      if( !skipEntry ){
        const nLastDot = reference.lastIndexOf(".");
        const sFieldRef = reference.substring(nLastDot + 1);
               
        if( postableFields.size === 0 || (postableFields && postableFields.has(sFieldRef))) {
           ReferenceHelper.addEntry(reference, newValues[reference], content);
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
  static addEntry(key, value, content) {
    let propertyPathParts = key.split(".");
    let propertyName = propertyPathParts.pop();

    for (let i = 0; i < propertyPathParts.length; i++) {
      let pathPart = propertyPathParts[i];

      // Do not include pyWorkPage in content
      if (pathPart === "pyWorkPage") {
        continue;
      }

      // regex to match repeating references (PageList / PageGroup)
      if (/(.*)[(].+[)]$/.test(pathPart)) {
        // Use regex to split on parens to get ref and index, use filter to remove empty string at end
        let pageListParts = pathPart.split(/[()]/).filter(Boolean);
        let pageName = pageListParts[0];
        let pageIndex = pageListParts[1];

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

    content[propertyName] = value;
  }

  /**
   * Get target repeating data structure from the PageGroup/List reference.
   * E.g. given 'pyWorkPage.Addresses' of type 'Group', return the Addresses object.
   * @param { String } reference - Property reference for PageGroup/List (e.g. pyWorkPage.Addresses)
   * @param { String } referenceType - Type of repeat. Group or List.
   * @param { Object } obj - Object to search for matching repeat object.
   * @return { Object / Array } Returns an object for PageGroup, array for PageList
   */
  static getRepeatFromReference(reference, referenceType, obj) {
    let propertyPathParts = reference.split(".");
    let propertyName = propertyPathParts.pop();
    let tempObj = obj;

    // Consume each piece of property reference, indexing into object
    for (let i = 0; i < propertyPathParts.length; i++) {
      let pathPart = propertyPathParts[i];

      // Do not include pyWorkPage in content
      if (pathPart === "pyWorkPage") {
        continue;
      }

      // regex to match repeating references (PageList / PageGroup)
      if (/(.*)[(].+[)]$/.test(pathPart)) {
        // Use regex to split on parens to get ref and index, use filter to remove empty string at end
        let pageListParts = pathPart.split(/[()]/).filter(Boolean);
        let pageName = pageListParts[0];
        let pageIndex = pageListParts[1];

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
    if (!tempObj[propertyName]) {
      tempObj[propertyName] = referenceType === refTypes.GROUP ? {} : [];
    }

    return tempObj[propertyName];
  }

  /**
   * Given array or object corresponding to repeat, get a blank entry.
   * This is to get a 'blank' entry to be appended onto array for PageList,
   * or added into the object for a PageGroup.
   * @param { Object/Array } obj - Object from which to get blank entry. Object for PageGroup, or Array for PageList.
   */
  static getBlankRowForRepeat(obj) {
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
  static setObjectValuesBlank(obj) {
    if( null == obj ) return;

    let keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];

      // Ecountered an array of objects, ensure its length is only 1 and blank its values
      if (Array.isArray(obj[key])) {
        obj[key].splice(1);
        ReferenceHelper.setObjectValuesBlank(obj[key][0]);

        // Encountered an object, blank its values
      } else if (typeof obj[key] === "object") {
        ReferenceHelper.setObjectValuesBlank(obj[key]);

        // Encountered a plain key, set it's value blank
      } else {
        obj[key] = "";
      }
    }
  }

  /**
   * Get PageGroup key given layout row.
   * To assist when constructing PageGroup grid.
   * @param { Object } row - corresponding to layout containing PageGroup
   * @return { String } String name of the PageGroup key corresponding to the layout row
   */
  static getPageGroupKeyFromRow(row) {
    for (let i = 0; i < row.groups.length; i++) {
      if (row.groups[i].field && row.groups[i].field.reference) {
        let pathParts = row.groups[i].field.reference.split(".");

        // Iterate backwards over path parts, because we want deepest pagegroup
        // To supported multi-nested PageGroups
        for (let j = pathParts.length - 1; j >= 0; j--) {
          if (/(.*)[(].+[)]$/.test(pathParts[j])) {
            // Use regex to split on parens to get ref and index, use filter to remove empty string at end
            let pageListParts = pathParts[j].split(/[()]/).filter(Boolean);

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
  static getInitialValuesFromView(view, state={values: {}, dates: {}}) {
    return view ? ReferenceHelper.processView(view, state) : {values: {}, dates:{}};
  }

  /**
   * Process a view from layout API data
   * @param { Object } view - view object
   * @param { Object } state - object in which to collect all initial paths and values. Defaults to empty obj.
   * @return { Object } object in which all initial paths and values are collected.
   */
  static processView(view, state) {
    // If the view is a page (harness), then do not require an explicit visible property
    if (view.visible || view.pageID) {
      ReferenceHelper.processGroups(view.groups, state);
    }

    return state;
  }

  /**
   * Process an array of groups from layout API
   * @param { Array } groups - Corresponds to Groups array of objects return from API
   * @param { Object } state - object in which all initial paths and values are collected.
   */
  static processGroups(groups, state) {
    if( !groups ) return;
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];

      if (group.view) {
        ReferenceHelper.processView(group.view, state);
      }

      if (group.layout) {
        ReferenceHelper.processLayout(group.layout, state);
      }

      if (group.field) {
        ReferenceHelper.processField(group.field, state);
      }
    }
  }

  /**
   * Process a layout from layout API
   * @param { Object } layout - layout object
   * @param { Object } state - object in which all initial paths and values are collected.
   */
  static processLayout(layout, state) {
    if (layout.rows) {
      layout.rows.forEach(row => {
        ReferenceHelper.processGroups(row.groups, state);
      });
    } else if (layout.view) {
      ReferenceHelper.processView(layout.view, state);
    } else {
      // layout.groups might be undefined
      ReferenceHelper.processGroups(layout.groups, state);
    }
  }

  /**
   * Process a field from layout API.
   * It is at this point that an entry is added to the state object.
   * @param { Object } field - field object returns from API
   * @param { Object } state - object in which key/value entry is added for property reference.
   */
  static processField(field, state) {
    if ((field.visible || (field.control && field.control.type === fieldTypes.HIDDEN))  && !field.readOnly && !field.disabled)  {    
      // can not post pyTemplateGeneric
      if (field.reference  && field.reference != "" && field.reference.indexOf("pyTemplate") < 0 ) {
        if( !state.values ) {
          state.values = {};
        }
        // If checkbox field and value is empty set initial state to false
        state.values[field.reference] = field.type === "True-False" && field.value === "" ? "false" : htmlDecode(field.value);
      }
    }
    // For editable datetime fields, if value is empty, null out the corresponding dates entry
    if (!field.readOnly && !field.disabled && field.control && field.control.type === fieldTypes.DATETIME) {
      if( !state.values[field.reference] ) {
        if( !state.dates ) {
          state.dates = {};
        }
        state.dates[field.reference] = null;
      }
    }
  }

  /**
   * Get target and index (and type if there is an index)
   *
   * @static
   * @param {String} sReference
   * @returns {object}
   * @memberof ReferenceHelper
   */
  static getTargetAndIndex(sReference) {
    let oReturn = new Object();
 
    const nLeftParenIndex  = sReference.lastIndexOf("(");
    const nRightParenIndex = sReference.lastIndexOf(")");

    if(nLeftParenIndex > 0){
      const nLastDot = sReference.lastIndexOf(".");
      
      // check of dot after the right paren, if so property as last ref
      if(( nRightParenIndex + 1 ) === nLastDot){
        oReturn["propRef"] = sReference.substring(nLastDot + 1);
        sReference = sReference.substring(0, nLastDot)

        const sRef = sReference.substring(0, nLeftParenIndex);
        const sIndex = sReference.substring(nLeftParenIndex + 1, nRightParenIndex);

        oReturn["target"] = sRef;
        oReturn["index"] = sIndex;
        //Experimental shortcut to discern whether the index is into a group or a list
        oReturn["type"] = isNaN(sIndex) ? refTypes.GROUP : refTypes.LIST;
      }
      else{
        // has a page as last reference, not the page list/group
        oReturn["propRef"] = sReference.substring(nLastDot + 1);
        oReturn["target"] = sReference.substring(0, nLastDot);
        oReturn["index"] = null;
      }
    }
    else{
      oReturn["target"] = sReference;
      oReturn["index"] = null;
    }

    return oReturn;
  }
      

  /**
   * 
   * @param {String} sReference 
   * @returns {Object}
   */
  static getTargetPageAndRef( sReference ) {
    let oReturn = new Object();

    let nLast = sReference.lastIndexOf(".");
    let sPageName = sReference.substring(0, nLast);
    let sPropName = sReference.substring(nLast + 1);

    if (sPageName.indexOf(".") != 0) {
      sPageName = ".".concat(sPageName);
    }
    oReturn["pageName"] = sPageName;
    oReturn["propName"] = sPropName;

    return oReturn;
  }

  /**
   * 
   * @param {String} sRef 
   * @returns {String}
   */
  static getRepeatRef(sRef) {
    let arProps = sRef.split(".");
    for (let i = arProps.length-1; i > 0; i--) {
      let sProp = arProps[i];
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

  /**
   * 
   * @param {Object} oControl 
   * @param {String} sNewIndex 
   * @param {String} sOldIndex 
   */
  static updateRefreshFor(oControl, sNewIndex, sOldIndex) {
    if (oControl.actionSets != null) {

      for (let setIndex in oControl.actionSets) {
        let arActions = oControl.actionSets[setIndex].actions;

        for (let actionIndex in arActions) {
          let oAction = arActions[actionIndex];

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

  /**
   * 
   * @param {Ojbect} oElement 
   * @param {String} oElementType 
   * @param {String} sOldReference 
   * @param {String} sNewReference 
   * @param {Object} oFldValues - State field values that will be updated with new values
   * @param {String} sNewIndex 
   * @param {String} sOldIndex 
   */
  static replaceReference(oElement, sElementType, sOldReference, sNewReference, oFldValues, sNewIndex, sOldIndex="") {
      
    switch (sElementType) {
      case "groups":
        for (let groupIndex in oElement.groups) {
          let groupElement = oElement.groups[groupIndex];
          for (let elType in groupElement) {
            ReferenceHelper.replaceReference(groupElement, elType, sOldReference, sNewReference, oFldValues, sNewIndex, sOldIndex);
          }
        }
        break;
      case "field":
        if(oElement.field.reference){
          oElement.field.reference = oElement.field.reference.replace(sOldReference, sNewReference, sNewIndex);
        }
        // Move state value to new reference
        // If new index is less than old index (then eliminating a row)
        let nNewIndex = parseInt(sNewIndex);
        let nOldIndex = parseInt(sOldIndex);
        if( nNewIndex < nOldIndex ) {
          oFldValues[sOldReference] = oFldValues[sNewReference];
        } else {
          oFldValues[sNewReference] = oFldValues[sOldReference];
        }
        if (oElement.field.controlName) {
          //oElement.field.controlName = oElement.field.controlName.replace(sOldReference, sNewReference, sNewIndex);
        }
        if (oElement.field.fieldID == "pxSubscript") {
          oElement.field.value = sNewIndex;
        }
        ReferenceHelper.updateRefreshFor(oElement.field.control, sNewIndex, sOldIndex);
        break;
      case "layout":
        if (oElement.layout.reference) {
          oElement.layout.reference = oElement.layout.reference.replace(sOldReference, sNewReference, sNewIndex);
        }
        for (let groupIndex in oElement.layout.groups) {
          let groupElement = oElement.layout.groups[groupIndex];
          for (let elType in groupElement) {
            ReferenceHelper.replaceReference(groupElement, elType, sOldReference, sNewReference, oFldValues, sNewIndex, sOldIndex);
          }
        }
        break;
      case "view" :
        if(oElement.view.reference){
          oElement.view.reference = oElement.view.reference.replace(sOldReference, sNewReference, sNewIndex);
        }
        for (let groupIndex in oElement.view.groups) {
          let groupElement = oElement.view.groups[groupIndex];
          for (let elType in groupElement) {
            ReferenceHelper.replaceReference(groupElement, elType, sOldReference, sNewReference, oFldValues, sNewIndex, sOldIndex);
          }        
        }
        break;
    }
  }

  /**
   * 
   * @param {Array} oRows 
   * @param {Integer} nStartingIndex 
   * @param {String} sReferencePrefix 
   * @param {Object} oFldValues - State field values that will be updated with new values
   * @param {Boolean} bIncrement 
   */
  static updateRowsWithNewReferenceFrom(oRows, nStartingIndex, sReferencePrefix, oFldValues, bIncrement=true) {
    let nRowLength = oRows.length;
    for ( let nIndex = nStartingIndex; nIndex < nRowLength; nIndex++ ) {
      let oRow = oRows[nIndex];

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
      ReferenceHelper.replaceReference(oRow, "groups", sRef, sNewRef, oFldValues, sNewIndex, sOldIndex);
    }
  }

  /**
   * 
   * @param {String} str 
   * @returns {String}
   */
  static escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  /**
   * 
   * @param {String} str 
   * @returns  {String}
   */
  static replaceReferenceJSON(sElement, sRef, sIndex) {
    return sElement.replace( new RegExp(ReferenceHelper.escapeRegExp(sRef), 'g'), sIndex);
  }

  /**
   * 
   * @param {Array} oRows 
   * @param {String} sRowRef 
   * @returns {Number}
   */
  static findIndexOfRow(oRows, sRowRef) {
    let rowIndex = -1;
    for (let index in oRows) {
      let oRow = oRows[index];
      let sRowJson = JSON.stringify(oRow);

      if (sRowJson.indexOf(sRowRef) >= 0) {
        rowIndex = parseInt(index);
        break;
      }

    }
    return rowIndex;
  }

  static updateViewWithLocalState(view, state) {
    return ReferenceHelper.updateViewWithState(view, state);
  }
  
  static updateViewWithState(view, state) {
    ReferenceHelper.updateGroupsWithState(view.groups, state);
    return view;
  }
  
  static updateGroupsWithState(groups, state) {    
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];
  
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
  
  static updateLayoutWithState(layout, state) {
  
    if (layout.rows) {
      layout.rows.forEach(row => {
        ReferenceHelper.updateGroupsWithState(row.groups, state);
      });
    } else {
      ReferenceHelper.updateGroupsWithState(layout.groups, state);
    }
  }
  
  static updateFieldWithState(field, state) {
  
    if ((field.visible || (field.control && field.control.type === "pxHidden"))  && !field.readOnly && !field.disabled && field.reference)  {
      
      // can not post pyTemplateGeneric
      if (field.reference.indexOf("pyTemplate") < 0) {
        if (state[field.reference] != null) {
          field.value = state[field.reference];
        }
      }
  
    }
  }
  
}



export { ReferenceHelper };
