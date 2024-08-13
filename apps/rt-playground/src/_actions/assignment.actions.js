import { actionTypes } from './actionTypes';
import { assignmentService } from '../_services';
import { getError, isShowRightPanel, getRightPanelSection } from '../_helpers';
import { alertActions, caseActions, errorActions } from './';

/**
 * Action creators. Used to dispatch actions with Redux.
 * Actions can be simple [assignmentActions.closeAssignment()] or
 * complex to handle AJAX requests [assignmentActions.getAssignment()].
 * For actions that include AJAX requests, we dispatch two actions:
 *  -request (in case we need to update store on request initiation)
 *  -success OR failure (to update store with relevant response data)
 */
export const assignmentActions = {
  getAssignment,
  getNextAssignment,
  getFieldsForAssignment,
  addOpenAssignment,
  refreshAssignment,
  closeAssignment,
  changeAssignment,
  getAssignmentFromCaseId,
  performRefreshOnAssignment,
  performActionOnAssignment,
  saveAssignment,
  assignments,
  saveWorklistSettings,
  saveCaseData,
  assignmentReviewMode,
  stepPrevious,
};

function getAssignment(woID, id) {
  return (dispatch) => {
    dispatch(request(id));

    return assignmentService.getAssignment(id).then(
      (data) => {
        if (data.caseInfo) {
          const { caseInfo } = data;
          const assignmentActions = caseInfo.assignments.reduce(
            (acc, assignment) => {
              acc.push(...assignment.actions);
              return acc;
            },
            []
          );

          const allActions = [
            ...assignmentActions,
            ...caseInfo.availableActions,
          ];
          if (allActions.length > 0) {
            dispatch(getFieldsForAssignment(woID, data.caseInfo)).then(
              (data) => {
                return dispatch(success(woID, caseInfo));
              }
            );
          } else {
            dispatch(assignmentActions.closeAssignment(woID));
            dispatch(
              alertActions.error(
                'Assignment does not have any actions configured.'
              )
            );
            return dispatch(failure(woID, 'No actions found'));
          }
        } else {
          dispatch(assignmentActions.closeAssignment(woID));
          dispatch(alertActions.error('Assignment data is missing.'));
          return dispatch(failure(woID, 'No assignment data found'));
        }
      },
      (error) => {
        dispatch(failure(woID, error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(id) {
    return { type: actionTypes.ASSIGNMENT_REQUEST, woID, id };
  }
  function success(woID, assignments) {
    return { type: actionTypes.ASSIGNMENT_SUCCESS, woID, assignments };
  }
  function failure(woID, error) {
    return { type: actionTypes.ASSIGNMENT_FAILURE, woID, error };
  }
}

function getNextAssignment() {
  return (dispatch) => {
    dispatch(request());
    return assignmentService.getAssignment('next').then(
      (assignment) => {
        const woID = assignment.data.caseInfo.ID; // Updated to match v2 structure
        dispatch(
          assignmentActions.addOpenAssignment(
            woID,
            assignment.data.caseInfo.ID,
            assignment.ID
          )
        );
        dispatch(caseActions.getCase(woID, assignment.data.caseInfo.ID));
        dispatch(getFieldsForAssignment(woID, assignment)).then((data) => {
          dispatch(success(woID, assignment));
        });
      },
      (error) => {
        dispatch(alertActions.error(error));
        return dispatch(failure(error));
      }
    );
  };

  function request() {
    return { type: actionTypes.NEXT_ASSIGNMENT_REQUEST };
  }
  function success(woID, assignment) {
    return { type: actionTypes.ASSIGNMENT_SUCCESS, woID, assignment };
  }
  function failure(error) {
    return { type: actionTypes.ASSIGNMENT_FAILURE, error };
  }
}

function getFieldsForAssignment(
  woID,
  assignment,
  actionId = null,
  bIsLocalAction = false
) {
  return (dispatch) => {
    dispatch(request(woID, assignment, actionId));

    // Get configured right panel view for case
    if (isShowRightPanel()) {
      dispatch(
        caseActions.getView(
          woID,
          assignment.caseInfo.ID,
          getRightPanelSection()
        )
      );
    }

    return assignmentService.getFieldsForAssignment(assignment, actionId).then(
      (data) => {
        if (data && bIsLocalAction) {
          data.dlgAction = actionId;
        }
        dispatch(success(woID, data));
        return data;
      },
      (error) => {
        dispatch(failure(woID, error));
      }
    );
  };

  function request(woID, assignment, actionId) {
    return {
      type: actionTypes.ASSIGNMENT_FIELDS_REQUEST,
      woID,
      assignment,
      actionId,
    };
  }
  function success(woID, data) {
    return { type: actionTypes.ASSIGNMENT_FIELDS_SUCCESS, woID, data: data };
  }
  function failure(woID, error) {
    return { type: actionTypes.ASSIGNMENT_FIELDS_FAILURE, woID, error };
  }
}

function addOpenAssignment(woID, caseID, id = null) {
  return (dispatch) => {
    dispatch(caseActions.removePage(woID));
    dispatch({ type: actionTypes.ADD_OPEN_ASSIGNMENT, woID, caseID, id });
  };
}

function refreshAssignment(woID, id, actionId = null) {
  return (dispatch) => {
    dispatch(request(woID, id));

    return assignmentService.getAssignment(id).then(
      (assignment) => {
        return dispatch(
          getFieldsForAssignment(woID, assignment, actionId)
        ).then((data) => {
          return dispatch(success(woID, id, assignment));
        });
      },
      (error) => {
        dispatch(alertActions.error(error));
        return dispatch(failure(woID, id, error));
      }
    );
  };

  function request(woID, id) {
    return { type: actionTypes.ASSIGNMENT_REFRESH_REQUEST, woID, id };
  }
  function success(woID, id, assignment) {
    return {
      type: actionTypes.ASSIGNMENT_REFRESH_SUCCESS,
      woID,
      id,
      assignment,
    };
  }
  function failure(woID, id, error) {
    return { type: actionTypes.ASSIGNMENT_REFRESH_FAILURE, woID, id, error };
  }
}

function performRefreshOnAssignment(
  woID,
  caseID,
  assignmentID,
  actionID,
  body,
  pageInstr
) {
  return (dispatch) => {
    dispatch(request(woID, caseID, assignmentID, actionID, body, pageInstr));
    dispatch(errorActions.clearErrors(caseID));

    return assignmentService
      .performRefreshOnAssignment(assignmentID, actionID, body, pageInstr)
      .then(
        (assignment) => {
          dispatch(success(woID, assignment));
        },
        (error) => {
          dispatch(alertActions.error(error));
          return dispatch(failure(error));
        }
      );
  };

  function request(woID, caseID, assignmentId, actionID, body, pageInstr) {
    return {
      type: actionTypes.ASSIGNMENT_PERFORM_REFRESH_REQUEST,
      woID,
      caseID,
      assignmentID,
      actionID,
      body,
      pageInstr,
    };
  }
  function success(woID, assignment) {
    return {
      type: actionTypes.ASSIGNMENT_PERFORM_REFRESH_SUCCESS,
      woID,
      assignment,
    };
  }
  function failure(woID, error) {
    return {
      type: actionTypes.ASSIGNMENT_PERFORM_REFRESH_FAILURE,
      woID,
      error,
    };
  }
}

function performActionOnAssignment(
  woID,
  caseID,
  assignmentID,
  actionID,
  body,
  pageInstr
) {
  return (dispatch) => {
    dispatch(request(woID, caseID, assignmentID, actionID, body, pageInstr));
    dispatch(errorActions.clearErrors(woID));

    return assignmentService
      .performActionOnAssignment(assignmentID, actionID, body, pageInstr)
      .then(
        (assignment) => {
          if (assignment.nextAssignmentID) {
            dispatch(caseActions.refreshCase(woID, caseID));
            return dispatch(
              refreshAssignment(woID, assignment.nextAssignmentID)
            ).then((data) => {
              return dispatch(
                success(woID, caseID, assignment, data.assignment.actions[0].ID)
              );
            });
          } else {
            // Get view for case -- pyCaseDetails section to display alongside WorkObject.
            // We want to display this with confirm harness, but not New harness.
            if (isShowRightPanel()) {
              dispatch(
                caseActions.getView(woID, caseID, getRightPanelSection())
              );
            }
            // Get case info again, so that we can put status onto Confirm harness
            dispatch(caseActions.getCase(woID, caseID));
            // Get harness for confirm
            dispatch(caseActions.getPage(woID, caseID, assignment.nextPageID));
            return dispatch(success(woID, assignment, null));
          }
        },
        (error) => {
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors
          ) {
            error.response.data.errors.forEach((pegaError) => {
              dispatch(errorActions.pegaError(woID, pegaError));
              // dispatch(alertActions.error(pegaError));
            });
          }
          let errorData = getError(error);
          dispatch(failure(woID, errorData, actionID));
          throw errorData;
        }
      );
  };

  function request(woID, caseID, assignmentID, actionID, body, pageInstr) {
    return {
      type: actionTypes.ASSIGNMENT_PERFORM_ACTION_REQUEST,
      woID,
      caseID,
      assignmentID,
      actionID,
      body,
      pageInstr,
    };
  }
  function success(woID, caseID, assignment, nextActionID) {
    return {
      type: actionTypes.ASSIGNMENT_PERFORM_ACTION_SUCCESS,
      woID,
      caseID,
      assignment,
      nextActionID,
    };
  }
  function failure(woID, error, nextActionID) {
    return {
      type: actionTypes.ASSIGNMENT_PERFORM_ACTION_FAILURE,
      woID,
      error,
      nextActionID,
    };
  }
}

function saveAssignment(woID, caseID, assignmentID, actionID, body, pageInstr) {
  return (dispatch) => {
    dispatch(request(woID, caseID));

    return assignmentService
      .saveAssignment(assignmentID, actionID, body, pageInstr)
      .then(
        (aCase) => {
          dispatch(success(woID, aCase));
          return dispatch(caseActions.refreshCase(woID, caseID));
        },
        (error) => {
          if (error?.response?.data?.errors) {
            error.response.data.errors.forEach((pegaError) => {
              dispatch(errorActions.pegaError(caseID, pegaError));
              // dispatch(alertActions.error(pegaError));
            });
          }
          let errorData = getError(error);
          dispatch(failure(woID, caseID, errorData, actionID));
          throw errorData;
        }
      );
  };

  function request(woID, caseID) {
    return { type: actionTypes.ASSIGNMENT_SAVE_REQUEST, woID, caseID };
  }
  function success(WoID, aCase) {
    return { type: actionTypes.ASSIGNMENT_SAVE_SUCCESS, woID, aCase };
  }
  function failure(woID, caseID, error, actionID) {
    return {
      type: actionTypes.ASSIGNMENT_SAVE_FAILURE,
      woID,
      caseID,
      error,
      actionID,
    };
  }
}

function closeAssignment(id) {
  return { type: actionTypes.ASSIGNMENT_CLOSED, id };
}

function saveWorklistSettings(column, direction, assignmentType) {
  return {
    type: actionTypes.WORKLIST_SAVE_SETTINGS,
    worklist: {
      column,
      direction,
      assignmentType,
    },
  };
}

function changeAssignment(idx) {
  return { type: actionTypes.ASSIGNMENT_CHANGED, activeIndex: idx };
}

function getAssignmentFromCaseId(woID, id) {
  return (dispatch) => {
    dispatch(request(woID, id));

    assignmentService.assignments().then(
      (assignments) => {
        let index = assignments.findIndex((x) => x.caseID === id);

        if (index !== -1) {
          dispatch(success(woID, assignments[index]));
          dispatch(
            assignmentActions.getAssignment(woID, assignments[index].ID)
          );
        } else {
          dispatch(failure('No matching assignment found.'));
        }
      },
      (error) => {
        dispatch(failure(woID, error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(woID, id) {
    return { type: actionTypes.ASSIGNMENT_FROM_CASE_REQUEST, woID, id };
  }
  function success(woID, assignment) {
    return { type: actionTypes.ASSIGNMENT_FROM_CASE_SUCCESS, woID, assignment };
  }
  function failure(woID, error) {
    return { type: actionTypes.ASSIGNMENT_FROM_CASE_FAILURE, woID, error };
  }
}

function assignments() {
  return (dispatch) => {
    dispatch(request());

    assignmentService.assignments().then(
      (assignments) => {
        dispatch(success(assignments));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request() {
    return { type: actionTypes.ASSIGNMENTS_REQUEST };
  }
  function success(assignments) {
    return { type: actionTypes.ASSIGNMENTS_SUCCESS, assignments };
  }
  function failure(error) {
    return { type: actionTypes.ASSIGNMENTS_FAILURE, error };
  }
}

function saveCaseData(caseID, data) {
  return { type: actionTypes.ASSIGNMENT_SAVE_DATA, caseID, data };
}

function assignmentReviewMode(woID, caseID) {
  return { type: actionTypes.ASSIGNMENT_REVIEW_MODE, woID, caseID };
}

function stepPrevious(woID, caseID, assignmentID, etag) {
  return (dispatch) => {
    dispatch(request(woID, caseID, assignmentID, etag));

    return assignmentService
      .navigationSteps(assignmentID, 'previous', etag)
      .then(
        (stepResponse) => {
          if (stepResponse?.nextAssignmentInfo?.ID) {
            dispatch(caseActions.refreshCase(woID, caseID));
            return dispatch(
              refreshAssignment(woID, stepResponse.nextAssignmentInfo.ID)
            ).then((data) => {
              return dispatch(
                success(
                  woID,
                  caseID,
                  stepResponse,
                  data.assignment.actions[0].ID
                )
              );
            });
          }
        },
        (error) => {
          dispatch(failure(woID, error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request(woID, caseID, assignmentID, etag) {
    return {
      type: actionTypes.ASSIGNMENT_STEP_PREVIOUS_REQUEST,
      woID,
      caseID,
      assignmentID,
      etag,
    };
  }
  function success(woID, caseID, stepResponse, nextActionID) {
    return {
      type: actionTypes.ASSIGNMENT_STEP_PREVIOUS_SUCCESS,
      woID,
      caseID,
      stepResponse,
      nextActionID,
    };
  }
  function failure(woID, error) {
    return { type: actionTypes.ASSIGNMENT_STEP_PREVIOUS_FAILURE, woID, error };
  }
}
