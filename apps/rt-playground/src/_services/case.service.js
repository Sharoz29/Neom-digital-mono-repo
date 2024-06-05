import { axios, getError, ReferenceHelper } from '../_helpers';
import { endpoints } from './endpoints';
/**
 * Functions used to issue AJAX requests and manage responses.
 * All of the included methods use the Axios library for Promise-based requests.
 */
export const caseService = {
  getCaseTypes,
  getCaseCreationPage,
  createCase,
  getCase,
  updateCase,
  refreshCase,
  getPage,
  getView,
  cases,
  uploadAttachments,
  getAttachments,
  deleteAttachment,
  downloadAttachment,
  saveAttachments,
  getFieldsForCase,
};

function getCaseTypes() {
  return axios
    .get(endpoints.API_URL + endpoints.CASETYPES)
    .then(function (response) {
      return response.data.caseTypes;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function getFieldsForCase(caseInfo, actionId) {
  if (!actionId) {
    if (caseInfo.actions && caseInfo.actions.length > 0) {
      actionId = assignment.actions[0].ID;
    } else {
      return Promise.reject('No valid actions found.');
    }
  }

  return axios
    .get(
      encodeURI(
        // endpoints.BASEV2URL +
        //   endpoints.CASES +
        //   '/' +
        //   caseInfo.ID +
        //   endpoints.ACTIONS +
        //   '/' +
        //   actionId
        endpoints.API_URL +
          endpoints.CASES +
          '/' +
          caseInfo.ID +
          endpoints.ACTIONS +
          '/' +
          actionId
      )
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function getCaseCreationPage(id) {
  return (
    axios
      // .get(endpoints.BASEV2URL + endpoints.CASETYPES + '/' + id)
      .get(endpoints.API_URL + endpoints.CASETYPES + '/' + id)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return Promise.reject(getError(error));
      })
  );
}

function createCase(id, processID, content) {
  return axios
    .post(
      endpoints.BASEV2URL + endpoints.CASES,
      processID
        ? {
            caseTypeID: id,
            processID: processID,
            content: content,
          }
        : {
            caseTypeID: id,
            content: content,
          }
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
}
//
function getCase(id) {
  return axios
    .get(encodeURI(endpoints.API_URL + endpoints.CASES + '/' + id), {
      headers: {
        'Access-Control-Expose-Headers': 'etag',
      },
    })
    .then(function (response) {
      response.data['etag'] = response.headers.etag;
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function updateCase(id, body, etag, action, pageInstr) {
  let actionParam = action ? { actionID: action } : null;

  return axios
    .put(
      encodeURI(endpoints.BASEV2URL + endpoints.CASES + '/' + id),
      pageInstr.postSettings.bUseEmbedPI || pageInstr.postSettings.bUseRepeatPI
        ? {
            content: ReferenceHelper.getPostContent(
              body,
              pageInstr.postSettings
            ),
            pageInstructions: pageInstr.pageInstructions,
          }
        : {
            content: ReferenceHelper.getPostContent(
              body,
              pageInstr.postSettings
            ),
          },
      {
        params: actionParam,
        headers: {
          'If-Match': etag,
        },
      }
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function refreshCase(myCase, body) {
  return axios
    .put(
      encodeURI(
        endpoints.BASEV2URL +
          endpoints.CASES +
          '/' +
          myCase.ID +
          endpoints.REFRESH
      ),
      {
        content: body,
      },
      {
        headers: {
          'Access-Control-Expose-Headers': myCase.etag,
        },
      }
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function getPage(caseID, pageID) {
  return axios
    .get(
      encodeURI(
        // endpoints.BASEV2URL +
        endpoints.API_URL +
          endpoints.CASES +
          '/' +
          caseID +
          endpoints.PAGES +
          '/' +
          pageID
      )
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function getView(caseID, viewID) {
  return axios
    .get(
      encodeURI(
        // endpoints.BASEV2URL +
        endpoints.API_URL +
          endpoints.CASES +
          '/' +
          caseID +
          endpoints.VIEWS +
          '/' +
          viewID
      )
    )
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function cases() {
  return (
    axios
      // .get(endpoints.BASEV2URL + endpoints.CASES)
      .get(endpoints.API_URL + endpoints.CASES)
      .then(function (response) {
        return response.data.cases;
      })
      .catch(function (error) {
        return Promise.reject(getError(error));
      })
  );
}

function getAttachments(caseID) {
  endpoints;
  return axios({
    method: 'get',
    url: endpoints.API_URL + `/cases/${caseID}/attachments`,
    // url: endpoints.BASEV2URL + `/cases/${caseID}/attachments`,
  })
    .then((attachments) => {
      return attachments.data;
    })
    .catch((error) => {
      console.log('The error is: ', error);
    });
}

function uploadAttachments(files) {
  const formData = new FormData();
  formData.append('appendUniqueIdToFileName', true);
  files.forEach((file) => {
    formData.append('arrayOfFiles', file);
  });
  return axios({
    method: 'post',
    url: endpoints.BASEV2URL + '/attachments/upload',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
    .then((response) => ({
      type: 'File',
      category: 'File',
      ID: response.data.ID,
    }))
    .catch((error) => {
      console.log('The error is: ', error);
    });
}

function saveAttachments(data, caseID) {
  const attachmentData = { attachments: data };
  return axios({
    method: 'post',
    url: endpoints.BASEV2URL + `/cases/${caseID}/attachments`,
    data: attachmentData,
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log('The error is: ', error);
    });
}

function deleteAttachment(file) {
  return axios({
    method: 'delete',
    url: endpoints.BASEV2URL + `/attachments/${file.ID}`,
  }).then(() => {});
}

function downloadAttachment(file) {
  return axios({
    method: 'get',
    url: endpoints.BASEV2URL + `/attachments/${file.ID}`,
  }).then((response) => {
    return response;
  });
}
