import _ from "lodash";

import { actionTypes } from "../_actions";

/**
 * Redux reducers.
 * Used to update state in the store after actions are issued.
 */
const casesDefaultState = {
  allCases: {},
  caseDetails: {},
  caseTypes: [],
  caseTypesError: null, // String containing error encountered
  openCases: [],
  pages: {},
  caseViews: {},
  caseTypesRequestInProgress: false,
};

export function cases(state = casesDefaultState, action) {
  switch (action.type) {
    case actionTypes.CASETYPES_REQUEST:
      return {
        ...state,
        caseTypesRequestInProgress: true
      };
    case actionTypes.CASETYPES_SUCCESS:
      return {
        ...state,
        caseTypes: action.caseTypes,
        caseTypesError: null,
        caseTypesRequestInProgress: false
      };
    case actionTypes.CASETYPES_FAILURE:
      // Set some state on a error to avoid repeated attempts to invoke this initial API
      return {
        ...state,
        caseTypesError: action.error,
        caseTypesRequestInProgress: false
      }
    case actionTypes.CASE_CREATION_PAGE_SUCCESS:
      // Store the processID within the page structure if one was specified (else would need to create a new pageProcessIDs array)
      if( action.processID ) action.data.creation_page.processID = action.processID;
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.id]: action.data.creation_page,
        }
      };
    case actionTypes.CASES_REQUEST:
      return {
        ...state,
        loadingCases: true
      };
    case actionTypes.CASES_SUCCESS:
      return {
        ...state,
        loadingCases: false,
        allCases: _.keyBy(action.cases, o => o.caseID)
      };
    case actionTypes.CASES_FAILURE:
      return {
        ...state,
        loadingCases: false,
        allCases: []
      };
    case actionTypes.CASE_REQUEST:
      return {
        ...state,
        loadingCase: true
      };
    case actionTypes.CASE_SUCCESS:
      let targetCase =
        action.aCase.cases && action.aCase.cases.length === 1
          ? action.aCase.cases[0]
          : action.aCase;
      let successIndex = state.openCases.findIndex(x => x === action.woID);

      return {
        ...state,
        loadingCase: false,
        caseDetails: {
          ...state.caseDetails,
          [action.woID]: targetCase
        },
        openCases:
          successIndex === -1
            ? [...state.openCases, action.woID]
            : [
                ...state.openCases.slice(0, successIndex),
                ...state.openCases.slice(successIndex + 1),
                action.woID
              ]
      };
    case actionTypes.CASE_FAILURE:
      return {
        ...state,
        loadingCase: false
      };
    case actionTypes.CASE_CLOSED:
      let close_index = state.openCases.findIndex(x => x === action.id);

      return {
        ...state,
        openCases: [
          ...state.openCases.slice(0, close_index),
          ...state.openCases.slice(close_index + 1)
        ]
      };
    case actionTypes.CASE_REFRESH_REQUEST:
      return state;
    case actionTypes.CASE_REFRESH_SUCCESS:
      let targetRefreshCase =
        action.aCase.cases && action.aCase.cases.length === 1
          ? action.aCase.cases[0]
          : action.aCase;

      return {
        ...state,
        caseDetails: {
          ...state.caseDetails,
          [action.woID]: targetRefreshCase
        }
      };
    case actionTypes.CASE_REFRESH_FAILURE:
      return state;
    case actionTypes.CASE_PAGE_REQUEST:
      return state;
    case actionTypes.CASE_PAGE_SUCCESS:
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.woID]: action.data
        }
      };
    case actionTypes.CASE_PAGE_FAILURE:
      return state;
    case actionTypes.CASE_VIEW_REQUEST:
      return state;
    case actionTypes.CASE_VIEW_SUCCESS:
      return {
        ...state,
        caseViews: {
          ...state.caseViews,
          [action.woID]: action.data
        }
      };
    case actionTypes.CASE_VIEW_FAILURE:
      return state;
    case actionTypes.REMOVE_PAGE:
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.woID]: null
        }
      };
    case actionTypes.ATTACHMENTS_REQUEST:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENTS_SUCCESS:
      return {
        ...state,
        attachments: action.attachments
      };
    case actionTypes.ATTACHMENTS_FAILURE:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENTS_UPLOAD_REQUEST:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENTS_UPLOAD_SUCCESS:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENTS_UPLOAD_FAILURE:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENTS_SAVE_REQUEST:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENTS_SAVE_SUCCESS:
      return {
        ...state,
        attachmentDetails: action.response.config.data,
      };
    case actionTypes.ATTACHMENTS_SAVE_FAILURE:
      return {
        ...state,
        // attachmentUploadError: action.error
      };
    case actionTypes.ATTACHMENT_DELETE_REQUEST:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENT_DELETE_SUCCESS:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENT_DELETE_FAILURE:
      return {
        ...state,
        // attachmentUploadError: action.error
      };  
    case actionTypes.ATTACHMENT_DOWNLOAD_REQUEST:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENT_DOWNLOAD_SUCCESS:
      return {
        ...state,
      };
    case actionTypes.ATTACHMENT_DOWNLOAD_FAILURE:
      return {
        ...state,
      };        
    default:
      return state;
  }
}
