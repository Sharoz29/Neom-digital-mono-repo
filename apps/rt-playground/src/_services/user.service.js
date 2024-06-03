import { endpoints } from "./endpoints";
import { axios, getError, authLogin, authLogout } from "../_helpers";

/**
 * Functions used to issue AJAX requests and manage responses.
 * All of the included methods use the Axios library for Promise-based requests.
 */
export const userService = {
  login,
  setToken,
  logout,
  operator,
  updateAppSettings,
};

function login(username, password) {
  if (endpoints.use_OAuth) {
    return authLogin().then((token) => {
      if (token) {
        userService.setToken(token);
        // Route to workarea as well if popup (callback only happens on popup scenario
      }
    });
  } else {
    alert(endpoints.BASEV2URL);
    const encodedUser = btoa(username + ":" + password);
    const authHdr = `Basic ${encodedUser}`;
    sessionStorage.setItem("pega_react_user", authHdr);

    return axios
      .get(endpoints.BASEURL + endpoints.AUTHENTICATE)
      .then(function (response) {
        return authHdr;
      })
      .catch(function (error) {
        return Promise.reject(getError(error));
      });
  }
}

function setToken(token) {
  const authHdr = token ? `Bearer ${token}` : "";
  sessionStorage.setItem("pega_react_user", authHdr);
  return authHdr;
}

function logout() {
  authLogout();
  sessionStorage.removeItem("pega_react_user");
}

function operator() {
  return axios
    .get(endpoints.BASEURL + endpoints.DATA + "/D_OperatorID")
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return Promise.reject(getError(error));
    });
}

function updateAppSettings(appSettings) {
  localStorage.setItem(
    "useEmbeddedPageInstructions",
    appSettings.bUseEmbeddedPageInstructions ? "1" : ""
  );
  localStorage.setItem(
    "useRepeatPageInstructions",
    appSettings.bUseRepeatPageInstructions ? "1" : ""
  );
  localStorage.setItem(
    "useLocalOptionsForDataPage",
    appSettings.bUseLocalOptionsForDataPage ? "1" : ""
  );
  localStorage.setItem(
    "useLocalOptionsForClipboardPage",
    appSettings.bUseLocalOptionsForClipboardPage ? "1" : ""
  );
  localStorage.setItem(
    "usePostAssignmentsSave",
    appSettings.bUsePostAssignmentsSave ? "1" : ""
  );
  localStorage.setItem("useScreenFlow", appSettings.bUseScreenFlow ? "1" : "");
  localStorage.setItem(
    "showCaseDetails",
    appSettings.bShowCaseDetails ? "1" : ""
  );
  localStorage.setItem("saveButton", appSettings.bSaveButton ? "1" : "");
  localStorage.setItem("createCaseContext", appSettings.createCaseContext);
  localStorage.setItem(
    "showWorkgroupBaskets",
    appSettings.bshowWorkgroupBaskets ? "1" : ""
  );
  localStorage.setItem(
    "showAttachments",
    appSettings.bShowAttachments ? "1" : ""
  );
}
