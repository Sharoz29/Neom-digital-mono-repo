import { actionTypes } from "./actionTypes";
import { userService, dataPageService } from "../_services";
import { alertActions } from "./";
import { history, getHomeUrl } from "../_helpers";
/**
 * Action creators. Used to dispatch actions with Redux.
 * Actions can be simple [assignmentActions.closeAssignment()] or
 * complex to handle AJAX requests [assignmentActions.getAssignment()].
 * For actions that include AJAX requests, we dispatch two actions:
 *  -request (in case we need to update store on request initiation)
 *  -success OR failure (to update store with relevant response data)
 */
export const userActions = {
  login,
  setToken,
  logout,
  getUserData,
  getRecents,
  updateAppSettings
};

function login(username, password) {
  return dispatch => {
    dispatch(request({ username }));
    const homeUrl = getHomeUrl();

    return userService.login(username, password).then(
      user => {
        const ret = dispatch(success(user));
        // If not embedded then switch to home page
        if( sessionStorage.getItem("pega_react_embedded") !== "1" ) {
          history.push(homeUrl);
        } else {
          return ret;
        }
      },
      error => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request(user) {
    return { type: actionTypes.LOGIN_REQUEST, user };
  }
  function success(user) {
    return { type: actionTypes.LOGIN_SUCCESS, user };
  }
  function failure(error) {
    return { type: actionTypes.LOGIN_FAILURE, error };
  }
}

function setToken( token ) {
  var homeUrl = getHomeUrl();

  return dispatch => {
    let authToken = userService.setToken(token);
    dispatch(success(authToken));
    history.push(homeUrl);
  };

  function success(authToken) {
    return { type: actionTypes.LOGIN_SUCCESS, authToken };
  }
}

function logout() {
  userService.logout();
  return { type: actionTypes.LOGOUT };
}

function getUserData(includeWorkGroupbaskets) {
  // TODO: Use an action creator to create AJAX request to get datapage for user
  // This function's code will look very similar to function cases() from case.action.js
  // Will use dataPageService.getDataPage(id) to make the AJAX request
  //return {type : actionTypes.USER_DATA_SUCCESS};
  return dispatch => {
    dispatch(request());

    dataPageService.getDataPage("D_OperatorID").then(
      operator => {
        // If 'api' service package has authentication turned off, the request might
        //  give a 200 response but it doesn't mean the operator's data is fully available.
        //  So, check for pyUserName
        if (operator.pyUserName) {
          if (includeWorkGroupbaskets) {
            dataPageService.getDataPage("D_pyWorkBasketsInDefaultWorkGroup").then(workBasket => {
              let workbasketSet = new Set();
              workBasket?.pxResults.forEach(element => {
                workbasketSet.add(element.pyLabel);
              });
              if (workBasket?.pxResults.length === workbasketSet.length) {
                operator.workBaskets = Array.from(workbasketSet);
              } else {
                const workBaskets = [];
                workBasket?.pxResults.forEach(element => {
                  const filteredRecord = workBasket.pxResults.filter(item => item.pyLabel === element.pyLabel);
                  if (filteredRecord?.length > 1) {
                    workBaskets.push(`${element.pyLabel} (${element.pyWorkBasket})`)
                  } else {
                    workBaskets.push(element.pyLabel);
                  }
                });
                operator.workBaskets = [...new Set([...operator.pyWorkbasket,...workBaskets])];
              }
              dispatch(success(operator));
            }, error => {
              dispatch(success(operator));
            });
          } else {
            operator.workBaskets = operator.pyWorkbasket;
            dispatch(success(operator));
          }
          
        } else {
          let errMsg = `Operator user name not available. This usually means that the 'api' Service Package has Authentication turned off.`;
          dispatch(failure(errMsg));
          dispatch(alertActions.error(errMsg));
        }
      },
      error => {
        dispatch(failure(error));
        dispatch(alertActions.error(error));
      }
    );
  };

  function request() {
    return { type: actionTypes.USER_DATA_REQUEST };
  }
  function success(operator) {
    return { type: actionTypes.USER_DATA_SUCCESS, operator };
  }
  function failure(error) {
    return { type: actionTypes.USER_DATA_FAILURE, error };
  }
}

function getRecents() {
  return dispatch => {
    dispatch(request());

    return dataPageService
      .getDataPage("Declare_pxRecents", { Work: true, Rule: false })
      .then(
        data => {
          return dispatch(success(data));
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };

  function request() {
    return { type: actionTypes.RECENTS_REQUEST };
  }
  function success(data) {
    return { type: actionTypes.RECENTS_SUCCESS, data };
  }
  function failure(error) {
    return { type: actionTypes.RECENTS_FAILURE, error };
  }
}

function updateAppSettings(appSettings) {
  return dispatch => {
    userService.updateAppSettings( appSettings);
    dispatch( success(appSettings) );
  };
  function success(appSettings) {
    return { type: actionTypes.APPSETTINGS_SUCCESS, appSettings };
  }
}
