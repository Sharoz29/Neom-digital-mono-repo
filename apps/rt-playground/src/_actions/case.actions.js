import { actionTypes } from './actionTypes';
import { caseService } from '../_services';
import {
  getError,
  getCreateCaseContext,
  caseCreationPageExists,
  isShowRightPanel,
} from '../_helpers';
import { alertActions } from './';
import { assignmentActions, errorActions } from './';

/**
 * Action creators. Used to dispatch actions with Redux.
 * Actions can be simple [assignmentActions.closeAssignment()] or
 * complex to handle AJAX requests [assignmentActions.getAssignment()].
 * For actions that include AJAX requests, we dispatch two actions:
 *  -request (in case we need to update store on request initiation)
 *  -success OR failure (to update store with relevant response data)
 */
export const caseActions = {
  getCaseTypes,
  getCaseCreationPage,
  createCase,
  getCase,
  refreshCase,
  closeCase,
  updateCase,
  getPage,
  removePage,
  getView,
  cases,
  uploadAttachments,
  getAttachments,
  deleteAttachment,
  downloadAttachment,
  saveAttachments,
  getFieldsForCase,
};

function getFieldsForCase(
  woID,
  caseInfo,
  actionId = null,
  bIsLocalAction = false
) {
  return (dispatch) => {
    dispatch(request(woID, caseInfo, actionId));

    // Get configured right panel view for case --  section to display alongside WorkObject.
    if (isShowRightPanel()) {
      dispatch(
        caseActions.getView(woID, caseInfo.caseTypeID, getRightPanelSection())
      );
    }

    return caseService.getFieldsForCase(caseInfo, actionId).then(
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

  function request(woID, caseInfo, actionId) {
    return {
      type: actionTypes.CASE_FIELDS_REQUEST,
      woID,
      caseInfo,
      actionId,
    };
  }
  function success(woID, data) {
    return { type: actionTypes.CASE_FIELDS_SUCCESS, woID, data };
  }
  function failure(woID, error) {
    return { type: actionTypes.CASE_FIELDS_FAILURE, woID, error };
  }
}

function getCaseTypes() {
  return (dispatch) => {
    dispatch(request());

    caseService.getCaseTypes().then(
      (caseTypes) => {
        dispatch(success(caseTypes));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request() {
    return { type: actionTypes.CASETYPES_REQUEST };
  }
  function success(caseTypes) {
    return { type: actionTypes.CASETYPES_SUCCESS, caseTypes };
  }
  function failure(error) {
    return { type: actionTypes.CASETYPES_FAILURE, error };
  }
}

function getCaseCreationPage(id, processID) {
  return (dispatch) => {
    dispatch(request(id));

    caseService.getCaseCreationPage(id).then(
      (data) => {
        const woID = data.ID;
        dispatch(assignmentActions.addOpenAssignment(woID, id));
        dispatch(assignmentActions.assignmentReviewMode(woID, id));
        dispatch(success(woID, id, data, processID));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(id) {
    return { type: actionTypes.CASE_CREATION_PAGE_REQUEST, id };
  }
  function success(woID, id, data, processID) {
    return {
      type: actionTypes.CASE_CREATION_PAGE_SUCCESS,
      woID,
      id,
      data,
      processID,
    };
  }
  function failure(error) {
    return { type: actionTypes.CASE_CREATION_PAGE_FAILURE, error };
  }
}

function createCase(id, processID = '', content = {}) {
  // If no content argument specified, use any createCaseContext in settings
  if (arguments.length < 3) {
    content = getCreateCaseContext();
  }

  return (dispatch) => {
    dispatch(request(id));

    return caseService.createCase(id, processID, content).then(
      (aCase) => {
        //  woID is used to index into various DX API response structures stored within reducers
        const woID = aCase.ID;
        dispatch(
          assignmentActions.addOpenAssignment(
            woID,
            aCase.ID,
            aCase.nextAssignmentID
          )
        );
        dispatch(getCase(woID, aCase.ID));
        dispatch(assignmentActions.getAssignment(woID, aCase.nextAssignmentID));

        // Below action is required to close the 'new harness' form/screen(after Create is clicked) before newly created case opens
        if (caseCreationPageExists(id)) {
          dispatch(assignmentActions.closeAssignment(id));
        }

        return dispatch(success(woID, aCase));
      },
      (error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          error.response.data.errors.forEach((pegaError) => {
            dispatch(errorActions.pegaError(id, pegaError));
          });
        } else {
          dispatch(alertActions.error(error));
        }
        let errorData = getError(error);
        dispatch(failure(errorData));
        throw errorData;
      }
    );
  };

  function request(id) {
    return { type: actionTypes.CASE_CREATE_REQUEST, id };
  }
  function success(woID, aCase) {
    return { type: actionTypes.CASE_CREATE_SUCCESS, woID, aCase };
  }
  function failure(error) {
    return { type: actionTypes.CASE_CREATE_FAILURE, error };
  }
}

function getCase(woID, id) {
  return (dispatch) => {
    dispatch(request(woID, id));

    return caseService.getCase(id).then(
      (aCase) => {
        return dispatch(success(woID, aCase));
      },
      (error) => {
        dispatch(alertActions.error(error));
        dispatch(assignmentActions.closeAssignment(woID));
        return dispatch(failure(woID, error));
      }
    );
  };

  function request(woID, id) {
    return { type: actionTypes.CASE_REQUEST, woID, id };
  }
  function success(woID, aCase) {
    return { type: actionTypes.CASE_SUCCESS, woID, aCase };
  }
  function failure(woID, error) {
    return { type: actionTypes.CASE_FAILURE, woID, error };
  }
}

function refreshCase(woID, id) {
  return (dispatch) => {
    dispatch(request(woID, id));

    return caseService.getCase(id).then(
      (aCase) => {
        return dispatch(success(woID, id, aCase));
      },
      (error) => {
        dispatch(alertActions.error(error));
        return dispatch(failure(woID, error));
      }
    );
  };

  function request(woID, id) {
    return { type: actionTypes.CASE_REFRESH_REQUEST, woID, id };
  }
  function success(woID, id, aCase) {
    return { type: actionTypes.CASE_REFRESH_SUCCESS, woID, id, aCase };
  }
  function failure(woID, error) {
    return { type: actionTypes.CASE_REFRESH_FAILURE, woID, error };
  }
}

function closeCase(woID) {
  return (dispatch) => dispatch({ type: actionTypes.CASE_CLOSED, id });
}

function updateCase(woID, id, body, etag, action, pageInstr) {
  return (dispatch) => {
    dispatch(request(woID, id));

    return caseService.updateCase(id, body, etag, action, pageInstr).then(
      (aCase) => {
        dispatch(success(woID, aCase));
        dispatch(caseActions.refreshCase(woID, id));
      },
      (error) => {
        dispatch(failure(woID, error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(woID, id) {
    return { type: actionTypes.CASE_UPDATE_REQUEST, woID, id };
  }
  function success(woID, aCase) {
    return { type: actionTypes.CASE_UPDATE_SUCCESS, woID, aCase };
  }
  function failure(error) {
    return { type: actionTypes.CASE_UPDATE_FAILURE, woID, error };
  }
}

function getPage(woID, caseID, pageID) {
  return (dispatch) => {
    dispatch(request(woID, caseID, pageID));

    caseService.getPage(caseID, pageID).then(
      (data) => {
        dispatch(success(woID, data));
      },
      (error) => {
        dispatch(failure(woID, error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(woID, caseID, pageID) {
    return { type: actionTypes.CASE_PAGE_REQUEST, woID, pageID };
  }
  function success(woID, data) {
    return { type: actionTypes.CASE_PAGE_SUCCESS, woID, data };
  }
  function failure(woID, error) {
    return { type: actionTypes.CASE_PAGE_FAILURE, woID, error };
  }
}

function removePage(woID) {
  return { type: actionTypes.REMOVE_PAGE, woID };
}

function getView(woID, caseID, viewID) {
  return (dispatch) => {
    dispatch(request(woID, caseID, viewID));

    caseService.getView(caseID, viewID).then(
      (data) => {
        dispatch(success(woID, caseID, data));
      },
      (error) => {
        dispatch(failure(woID, error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(woID, caseID, viewID) {
    return { type: actionTypes.CASE_VIEW_REQUEST, woID, caseID, viewID };
  }
  function success(woID, caseID, data) {
    return { type: actionTypes.CASE_VIEW_SUCCESS, woID, caseID, data };
  }
  function failure(woID, error) {
    return { type: actionTypes.CASE_VIEW_FAILURE, woID, error };
  }
}

function cases() {
  return (dispatch) => {
    dispatch(request());

    caseService.cases().then(
      (cases) => {
        dispatch(success(cases));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request() {
    return { type: actionTypes.CASES_REQUEST };
  }
  function success(cases) {
    return { type: actionTypes.CASES_SUCCESS, cases };
  }
  function failure(error) {
    return { type: actionTypes.CASES_FAILURE, error };
  }
}

function getAttachments(caseID) {
  return (dispatch) => {
    dispatch(request());

    return caseService.getAttachments(caseID).then(
      (response) => {
        return dispatch(success(response.attachments));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };
  function request() {
    return { type: actionTypes.ATTACHMENTS_REQUEST };
  }
  function success(attachments) {
    return { type: actionTypes.ATTACHMENTS_SUCCESS, attachments };
  }
  function failure(error) {
    return { type: actionTypes.ATTACHMENTS_FAILURE, error };
  }
}

function uploadAttachments(files) {
  return (dispatch) => {
    dispatch(request());

    return caseService.uploadAttachments(files).then(
      (fileResponse) => {
        return dispatch(success(fileResponse));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };
  function request() {
    return { type: actionTypes.ATTACHMENTS_UPLOAD_REQUEST };
  }
  function success(fileResponse) {
    return { type: actionTypes.ATTACHMENTS_UPLOAD_SUCCESS, fileResponse };
  }
  function failure(error) {
    return { type: actionTypes.ATTACHMENTS_UPLOAD_FAILURE, error };
  }
}

function saveAttachments(data, caseID) {
  return (dispatch) => {
    dispatch(request());

    return caseService.saveAttachments(data, caseID).then(
      (response) => {
        return dispatch(success(response));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };
  function request() {
    return { type: actionTypes.ATTACHMENTS_SAVE_REQUEST };
  }
  function success(response) {
    return { type: actionTypes.ATTACHMENTS_SAVE_SUCCESS, response };
  }
  function failure(error) {
    return { type: actionTypes.ATTACHMENTS_SAVE_FAILURE, error };
  }
}

function deleteAttachment(file) {
  return (dispatch) => {
    dispatch(request());

    return caseService.deleteAttachment(file).then(
      (response) => {
        dispatch(success());
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };
  function request() {
    return { type: actionTypes.ATTACHMENT_DELETE_REQUEST };
  }
  function success() {
    return { type: actionTypes.ATTACHMENT_DELETE_SUCCESS };
  }
  function failure(error) {
    return { type: actionTypes.ATTACHMENT_DELETE_FAILURE, error };
  }
}

function downloadAttachment(file) {
  return (dispatch) => {
    dispatch(request());

    return caseService.downloadAttachment(file).then(
      (response) => {
        return dispatch(success(response));
      },
      (error) => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };
  function request() {
    return { type: actionTypes.ATTACHMENT_DOWNLOAD_REQUEST };
  }
  function success(response) {
    return { type: actionTypes.ATTACHMENT_DOWNLOAD_SUCCESS, response };
  }
  function failure(error) {
    return { type: actionTypes.ATTACHMENT_DOWNLOAD_FAILURE, error };
  }
}
