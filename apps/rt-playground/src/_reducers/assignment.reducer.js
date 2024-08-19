import _ from 'lodash';

import { actionTypes } from '../_actions';
import { appConstants } from '../_constants';

/**
 * Redux reducers.
 * Used to update state in the store after actions are issued.
 * In many cases the response is saved in below structures indexed within a work object id (woID),
 *  which might be the caseID or some other designation such as a constantly increasing tabId or randomNumber
 */
const assignmentsDefaultState = {
  allAssignments: {},
  assignmentDetails: {},
  assignmentLoading: {},
  openAssignments: [],
  views: {},
  viewHeaders: {},
  dlgInfo: {},
  activeIndex: 0,
  openAssignmentsTabIdx: [],
  worklistSettings: {
    column: 'pxUrgencyAssign',
    direction: 'descending',
    assignmentType: 'Worklist',
  },
  openCasesData: {},
};

export function assignments(state = assignmentsDefaultState, action) {
  switch (action.type) {
    case actionTypes.ASSIGNMENTS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case actionTypes.ASSIGNMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        allAssignments: _.keyBy(action.assignments, (o) => o.caseID),
      };
    case actionTypes.ASSIGNMENTS_FAILURE:
      return {
        ...state,
        loading: false,
      };
    /**
     * Added Case action in assignment reducer on purpose.
     * for some local actions we have to update View and ViewHeaders that was present in assignment reducer
     */
    case actionTypes.CASE_FIELDS_SUCCESS:
    case actionTypes.ASSIGNMENT_FIELDS_SUCCESS: {
      const woID = action.woID;
      if (action.data.dlgAction) {
        return {
          ...state,
          dlgInfo: {
            ...state.dlgInfo,
            [woID]: {
              view: action.data.view,
              name: action.data.name,
              action: action.data.dlgAction,
            },
          },
          assignmentLoading: {
            ...state.assignmentLoading,
            [woID]: false,
          },
        };
      } else {
        return {
          ...state,
          views: {
            ...state.views,
            [woID]: action.data.view,
          },
          viewHeaders: {
            ...state.viewHeaders,
            [woID]: action.data.name,
          },
          assignmentLoading: {
            ...state.assignmentLoading,
            [woID]: false,
          },
        };
      }
    }
    case actionTypes.ASSIGNMENT_PERFORM_REFRESH_REQUEST:
      return {
        ...state,
        refreshRequestInProgress: true,
      };
    case actionTypes.ASSIGNMENT_PERFORM_REFRESH_SUCCESS:
      return {
        ...state,
        loading: false,
        views: {
          ...state.views,
          [action.woID]: action.assignment.view,
        },
        viewHeaders: {
          ...state.viewHeaders,
          [action.woID]: action.assignment.name,
        },
        refreshRequestInProgress: false,
      };
    case actionTypes.ASSIGNMENT_PERFORM_REFRESH_FAILURE:
      return {
        ...state,
        refreshRequestInProgress: false,
      };
    case actionTypes.ASSIGNMENT_REQUEST:
      return state;
    case actionTypes.ADD_OPEN_ASSIGNMENT:
      const successIndex = state.openAssignments.findIndex(
        (x) => x.woID === action.woID || x.caseID === action.caseID
      );
      return {
        ...state,
        openAssignments:
          successIndex === -1
            ? // woID is actually the topmost caseID (when subcases are involved)
              [
                ...state.openAssignments,
                { woID: action.woID, caseID: action.caseID, ID: action.id },
              ]
            : [
                ...state.openAssignments.slice(0, successIndex),
                ...state.openAssignments.slice(successIndex + 1),
                { woID: action.woID, caseID: action.caseID, ID: action.id },
              ],
      };
    case actionTypes.ASSIGNMENT_SUCCESS:
      let woID = action.woID ? action.woID : action.assignment.caseID;
      return {
        ...state,
        openAssignmentsTabIdx: state.openAssignmentsTabIdx.find(
          (x) => x === woID
        )
          ? state.openAssignmentsTabIdx
          : [woID, ...state.openAssignmentsTabIdx],
        assignmentDetails: {
          ...state.assignmentDetails,
          [woID]: action.assignment,
        },
        activeIndex: state.openAssignments ? state.openAssignments.length : 0,
        openCasesData: {
          ...state.openCasesData,
          [woID]: {},
        },
      };
    case actionTypes.ASSIGNMENT_REVIEW_MODE:
      return {
        ...state,
        openAssignmentsTabIdx: [action.woID, ...state.openAssignmentsTabIdx],
        activeIndex: state.openAssignments.length,
      };

    case actionTypes.ASSIGNMENT_FAILURE:
      return state;

    case actionTypes.ASSIGNMENT_CLOSED:
      let close_index = state.openAssignments.findIndex(
        (x) => x.caseID === action.id
      );
      let openAssignments = state.openAssignments;
      if (close_index > -1) {
        openAssignments = [
          ...state.openAssignments.slice(0, close_index),
          ...state.openAssignments.slice(close_index + 1),
        ];
      }

      let tabIdx = state.openAssignmentsTabIdx.findIndex(
        (x) => x === action.id
      );
      // To check if there exists a 'new harness' tab
      if (tabIdx === -1) {
        tabIdx = state.openAssignmentsTabIdx.findIndex((x) => x === undefined);
      }
      let openAssignmentsTabIdx = state.openAssignmentsTabIdx;
      if (tabIdx > -1) {
        openAssignmentsTabIdx = [
          ...state.openAssignmentsTabIdx.slice(0, tabIdx),
          ...state.openAssignmentsTabIdx.slice(tabIdx + 1),
        ];
      }

      let caseIdx = openAssignments.findIndex(
        (x) => x.woID === openAssignmentsTabIdx[0]
      );
      // Added an extra check to get correct 'activeIndex' in case of 'new harness' tab
      if (
        caseIdx === -1 &&
        !action.id.includes(' ') &&
        !action.id.includes('NewSimple')
      )
        caseIdx = openAssignments.length;

      return {
        ...state,
        openAssignmentsTabIdx,
        openAssignments,
        openCasesData: {
          ...state.openCasesData,
          [action.id]: {},
        },
        activeIndex: caseIdx >= 0 ? caseIdx + appConstants.FIXED_TAB_COUNT : 0,
      };

    case actionTypes.ASSIGNMENT_CHANGED:
      let openAssignmentsIdxs = [...state.openAssignmentsTabIdx];
      if (action.activeIndex > appConstants.FIXED_TAB_COUNT - 1) {
        let caseId =
          state.openAssignments[
            action.activeIndex - appConstants.FIXED_TAB_COUNT
          ].caseID;
        let tabIdx = state.openAssignmentsTabIdx.findIndex((x) => x === caseId);
        if (tabIdx !== -1) {
          openAssignmentsIdxs = [
            caseId,
            ...state.openAssignmentsTabIdx.slice(0, tabIdx),
            ...state.openAssignmentsTabIdx.slice(tabIdx + 1),
          ];
        }
      }
      return {
        ...state,
        openAssignmentsTabIdx: openAssignmentsIdxs,
        activeIndex: action.activeIndex,
      };

    case actionTypes.WORKLIST_SAVE_SETTINGS:
      return {
        ...state,
        worklistSettings: action.worklist,
      };

    case actionTypes.ASSIGNMENT_REFRESH_REQUEST:
      return {
        ...state,
        assignmentLoading: {
          ...state.assignmentLoading,
          [action.woID]: true,
        },
      };
    case actionTypes.ASSIGNMENT_REFRESH_SUCCESS:
      return {
        ...state,
        assignmentDetails: {
          ...state.assignmentDetails,
          [action.woID]: action.assignment,
        },
        assignmentLoading: {
          ...state.assignmentLoading,
          [action.woID]: false,
        },
      };
    case actionTypes.ASSIGNMENT_REFRESH_FAILURE:
      return {
        ...state,
        assignmentLoading: {
          ...state.assignmentLoading,
          [action.woID]: false,
        },
      };
    case actionTypes.ASSIGNMENT_PERFORM_ACTION_REQUEST:
    case actionTypes.ASSIGNMENT_STEP_PREVIOUS_REQUEST:
      return {
        ...state,
        assignmentLoading: {
          ...state.assignmentLoading,
          [action.woID]: true,
        },
      };
    case actionTypes.ASSIGNMENT_PERFORM_ACTION_SUCCESS:
    case actionTypes.ASSIGNMENT_STEP_PREVIOUS_SUCCESS:
      return state;
    case actionTypes.ASSIGNMENT_PERFORM_ACTION_FAILURE:
    case actionTypes.ASSIGNMENT_STEP_PREVIOUS_FAILURE:
      return {
        ...state,
        assignmentLoading: {
          ...state.assignmentLoading,
          [action.woID]: false,
        },
      };
    case actionTypes.ASSIGNMENT_SAVE_DATA:
      return {
        ...state,
        openCasesData: {
          ...state.openCasesData,
          [action.woID]: action.data,
        },
      };
    default:
      return state;
  }
}
