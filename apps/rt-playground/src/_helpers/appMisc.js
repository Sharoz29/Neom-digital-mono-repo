import {store} from './store';

export const getHomeUrl = () => {
    const dirSep = "/";
    var homeUrl = process.env.PUBLIC_URL || "";
    if (!homeUrl.endsWith(dirSep))
      homeUrl += dirSep;
    return homeUrl;
}

export const isShowRightPanel = () => {
    const state = store.getState();
    return state.user.appSettings.bShowRightPanel;
}

export const getRightPanelSection = () => {
    const state = store.getState();
    return state.user.appSettings.rightPanelSection;
}

export const getCreateCaseContext = () => {
    const state = store.getState();
    const ccContext = state.user.appSettings.createCaseContext;
    let oCreateCaseContext = {};
    
    if( ccContext ) {
        try {
            oCreateCaseContext = JSON.parse(ccContext);
        } catch(e) {
            console.log("Invalid JSON specified for create case context");
        }    
    }

    return oCreateCaseContext;
}

/**
 * Checks if a starting page is associated with this processID
 * @param {String} processID 
 * @returns {Boolean} caseCreationPage (or null)
 */
export const caseCreationPageExists = (caseType) => {
  const state = store.getState();
  return state.cases.pages[caseType] ? true : false;
}

/**
 * generates unique key value by incrementing keyIndex on every call
 */
let keyIndex = 0;
export function getUniqueIndex() {
    return `${keyIndex++}`;
}

/**
 * Returns the PI structure with only POSTable fields
 * @param {Set} postableFields - set of fields that can be POSTed(i.e fields with visibilty:true) 
 * @param {*} pi - PI structure
 * @returns {*} PI structure with only POSTable fields
 */
export function getPostableFieldsPI(postableFields, pi){
    for(let pageInstruction of pi.pageInstructions){
        if(pageInstruction.instruction === "UPDATE"){
          for(let key in pageInstruction.content){
            if( !postableFields.has(key) ){
              delete pi.pageInstructions[pi.pageInstructions.indexOf(pageInstruction)].content[key];
            }
          }
        }
      }
    return pi;  
}
