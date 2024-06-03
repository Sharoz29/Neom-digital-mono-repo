import { actionTypes } from "../_actions";
import { endpoints } from "../_services";
import { appConstants } from "../_constants";

let storedUser = sessionStorage.getItem("pega_react_user");
let initialState;

let lsCreateCaseContext = localStorage.getItem("createCaseContext");
let lsRightPanelSection = localStorage.getItem("rightPanelSection");

initialState = {
  loggedIn: storedUser ? true : false,
  storedUser: storedUser ? storedUser : null,
  userData: {},

  // Default appSettings should be to accommodate prevalent release in field.  8.3 for now.
  appSettings: {
    bUseEmbeddedPageInstructions: localStorage.getItem("useEmbeddedPageInstructions")!=="",
    bUseRepeatPageInstructions: localStorage.getItem("useRepeatPageInstructions")!=="",
    bUseLocalOptionsForDataPage: localStorage.getItem("useLocalOptionsForDataPage")!=="",
    bUseLocalOptionsForClipboardPage: localStorage.getItem("useLocalOptionsForClipboardPage")!=="",
    bUsePostAssignmentsSave: localStorage.getItem("usePostAssignmentsSave")==="1",
    bUseScreenFlow: endpoints.use_v2apis,
    bShowRightPanel: localStorage.getItem("showRightPanel")==="1",
    rightPanelSection: lsRightPanelSection ? lsRightPanelSection : appConstants.DEFAULT_RIGHT_PANEL_SECTION,
    bSaveButton: localStorage.getItem("saveButton")!=="",
    createCaseContext: lsCreateCaseContext ? lsCreateCaseContext : "",
    bshowWorkgroupBaskets: localStorage.getItem("showWorkgroupBaskets") === null ? appConstants.SHOW_WORKGROUP_BASKETS : localStorage.getItem("showWorkgroupBaskets")==="1",
    bShowAttachments: localStorage.getItem("showAttachments")==="1",
  }
};

/**
 * Redux reducers.
 * Used to update state in the store after actions are issued.
 */
export function user(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOGIN_REQUEST:
      return {
        ...state,
        loggingIn: true,
        user: action.user
      };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        user: action.user
      };
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        loggedIn: false,
        user: null
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        loggedIn: false,
        user: null
      };
    case actionTypes.USER_DATA_REQUEST:
      // TODO: Handle user state after request is made, but no response received
      return state;
    case actionTypes.USER_DATA_SUCCESS:
      // TODO: Handle user state after successful call to user data page
      // Can store some data into state.userData
      return {
        ...state,
        userData: {
          ...state.userData,
          name: action.operator.pyLabel,
          id: action.operator.pyUserIdentifier,
          accessGroup: action.operator.pyAccessGroup,
          email: action.operator.pyAddresses && action.operator.pyAddresses.Email ? action.operator.pyAddresses.Email.pyEmailAddress : "",
          workbaskets: action.operator.workBaskets
        }
      };
    case actionTypes.USER_DATA_FAILURE:
      // TODO: Handle user state after failed call to user data page
      return state;
    case actionTypes.APPSETTINGS_SUCCESS:
      return {
        ...state,
        appSettings: action.appSettings
      };
    default:
      return state;
  }
}
