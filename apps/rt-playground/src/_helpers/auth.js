import { PegaAuth, getHomeUrl } from '../_helpers/';
import { endpoints, loginBoxType } from '../_services/endpoints';
import { userService } from '../_services/';

let authMgr = null;
let userIsSignedIn = false;
let authTokenExpired = false;
// Since this variable is loaded in a separate instance in the popup scenario, use storage to coordinate across the two
let usePopupForRestOfSession =
  sessionStorage.getItem('pega_react_popup') == '1';
// To have this work smoothly on a browser refresh, use storage
let userHasRefreshToken =
  sessionStorage.getItem('pega_react_hasrefresh') == '1';

/*
 * Set to use popup experience for rest of session
 */
const forcePopupForReauths = (bForce) => {
  if (bForce) {
    sessionStorage.setItem('pega_react_popup', '1');
    usePopupForRestOfSession = true;
  } else {
    sessionStorage.removeItem('pega_react_popup');
    usePopupForRestOfSession = false;
  }
};

export const setIsEmbedded = (bEmbedded, appName) => {
  if (bEmbedded) {
    forcePopupForReauths(true);
    sessionStorage.setItem('pega_react_embedded', '1');
  } else {
    sessionStorage.removeItem('pega_react_embedded');
  }
  sessionStorage.setItem('pega_react_appName', appName);
  if (endpoints.use_OAuth) {
    initPegaOAuth();
  }
};

// Initialize endpoints structure
export const initEndpoints = () => {
  if (endpoints.PEGAURL && !endpoints.bInitialized) {
    const appBase =
      endpoints.PEGAURL +
      (endpoints.appAlias ? `/api/${endpoints.appAlias}` : '');
    if (!endpoints.BASEURL) {
      endpoints.BASEURL = appBase + '/api/v1';
    }
    if (endpoints.use_v2apis && !endpoints.BASEV2URL) {
      endpoints.BASEV2URL = `https://web.pega23.lowcodesol.co.uk/prweb/app/uipoc/api/v1`;
      //https://web.pega23.lowcodesol.co.uk/prweb/app/uipoc/api/v1/assignments
    }
    if (endpoints.use_OAuth) {
      const authConfig = endpoints.OAUTHCFG;
      // Always use pkce (works even if OAuth 2.0 client reg record doesn't have that checked)
      if (authConfig.use_pkce === undefined) {
        authConfig.use_pkce = true;
      }
      if (!authConfig.authorize) {
        authConfig.authorize =
          endpoints.PEGAURL + '/PRRestService/oauth2/v1/authorize';
      }
      if (!authConfig.token) {
        authConfig.token = endpoints.PEGAURL + '/PRRestService/oauth2/v1/token';
      }
      if (authConfig.use_revoke && !authConfig.revoke) {
        authConfig.revoke =
          endpoints.PEGAURL + '/PRRestService/oauth2/v1/revoke';
      }
    }
  }
  endpoints.bInitialized = true;
};

/* Initialize PegaOAuth library */
const initPegaOAuth = () => {
  const bEmbedded = sessionStorage.getItem('pega_react_embedded') === '1';
  const authConfig = endpoints.OAUTHCFG;

  // Check if sessionStorage exists (and if so if for same authorize endpoint).  Otherwise, assume
  //  sessionStorage is out of date (user just edited endpoints).  Else, logout required to clear
  //  sessionStorage and get other endpoints updates.
  // Doing this as sessionIndex might have been added to this storage structure
  let sSI = sessionStorage.getItem('pega_react_CI');
  if (sSI) {
    try {
      let oSI = JSON.parse(sSI);
      if (
        oSI.authorizeUri !== authConfig.authorize ||
        oSI.clientId !== authConfig.client_id ||
        oSI.authService !== authConfig.authService ||
        oSI.appAlias !== endpoints.appAlias ||
        oSI.embedded !== bEmbedded ||
        oSI.userIdentifier !== endpoints.EMBEDCFG.userIdentifier ||
        oSI.password !== endpoints.EMBEDCFG.password
      ) {
        clearAuthMgr();
        sSI = null;
      }
    } catch (e) {}
  }

  if (!sSI) {
    // redirect url needs to actually exist if rendered from a web server...so if that is the case, make it
    //  the root path (which will then serve up index.html)
    const homeUrl = getHomeUrl();
    const sAuthPagePath = `${window.location.origin + homeUrl}auth`;
    // Initialize authConfig structure so we can store it in sessionStorage and pass it to PegaAuth
    let paConfig = {
      clientId: authConfig.client_id,
      authorizeUri: authConfig.authorize,
      tokenUri: authConfig.token,
      redirectUri: sAuthPagePath,
      appAlias: endpoints.appAlias || '',
    };
    if (authConfig.authService) {
      paConfig.authService = authConfig.authService;
    }
    if (authConfig.use_locking) {
      paConfig.useLocking = true;
    }
    if (authConfig.revoke) {
      paConfig.revokeUri = authConfig.revoke;
    }
    if (authConfig.client_secret) {
      paConfig.clientSecret = authConfig.client_secret;
    }
    paConfig.embedded = bEmbedded;
    if (bEmbedded) {
      paConfig.userIdentifier = endpoints.EMBEDCFG.userIdentifier;
      paConfig.password = endpoints.EMBEDCFG.password;
    }
    sessionStorage.setItem('pega_react_CI', JSON.stringify(paConfig));
  }

  authMgr = new PegaAuth('pega_react_CI');
};

initEndpoints();
if (
  endpoints.use_OAuth &&
  sessionStorage.getItem('pega_react_appName') !== null
) {
  initPegaOAuth();
}

/**
 * Clean up any web storage allocated for the user session.
 */
const clearAuthMgr = () => {
  // Remove any local storage for the user
  sessionStorage.removeItem('pega_react_CI');
  sessionStorage.removeItem('pega_react_TI');
  userIsSignedIn = false;
  // Not removing the authMgr structure itself...as it can be leveraged on next login
};

const processTokenOnLogin = (token) => {
  sessionStorage.setItem('pega_react_TI', JSON.stringify(token));
  if (token.refresh_token) {
    userHasRefreshToken = true;
    sessionStorage.setItem('pega_react_hasrefresh', '1');
  }
  userIsSignedIn = true;
  forcePopupForReauths(true);
  userService.setToken(token.access_token);
};

const getCurrentTokens = () => {
  let tokens = null;
  const sTI = sessionStorage.getItem('pega_react_TI');
  if (sTI !== null) {
    try {
      tokens = JSON.parse(sTI);
      userIsSignedIn = true;
    } catch (e) {
      console.log('error parsing saved token');
      tokens = null;
    }
  }
  return tokens;
};

/**
 * Do any login related activities
 */
export const authLogin = () => {
  // Make sure page_react_TI has been removed
  sessionStorage.removeItem('pega_react_TI');
  if (authIsMainRedirect()) {
    authMgr.loginRedirect();
    // Don't have token til after the redirect
    return Promise.resolve(undefined);
  } else {
    return new Promise((resolve, reject) => {
      authMgr
        .login()
        .then((token) => {
          // Store tokens in sessionStorage
          sessionStorage.setItem('pega_react_TI', JSON.stringify(token));
          resolve(token.access_token);
        })
        .catch((e) => {
          console.log(e);
          reject(e);
        });
    });
  }
};

/**
 * Do any logout related activities
 */
export const authLogout = () => {
  const tokens = getCurrentTokens();
  // Clear tokens first so if we get recalled, won't try to revoke them again
  clearAuthMgr();
  forcePopupForReauths(false);
  if (tokens && tokens.access_token) {
    // If we didn't configure the revoke endpoint this does nothing
    authMgr.revokeTokens(
      tokens.access_token,
      tokens.refresh_token ? tokens.refresh_token : null
    );
  }
};

export const authIsSignedIn = () => {
  return userIsSignedIn;
};

export const authRedirectCallback = (href, fnLoggedInCB = null) => {
  // Get code from href and swap for token
  // Having issues with URLSearchParams with production builds so use regular regexp
  // Running into problems using URLSearchParams so implement own regexp
  const re = new RegExp('\\?code=([^&]*)');
  const found = href.match(re);
  const code = found[1];

  const token = authMgr.getToken(code).then((token) => {
    if (token && token.access_token) {
      processTokenOnLogin(token);
      if (fnLoggedInCB) {
        fnLoggedInCB(token.access_token);
      }
    }
  });
};

export const authIsMainRedirect = () => {
  // Even with main redirect, we want to use it only for the first login (so it doesn't wipe out any state or the reload)
  return (
    endpoints.OAUTHCFG.loginExperience == loginBoxType.Main &&
    !usePopupForRestOfSession
  );
};

export const authRefresh = () => {
  return new Promise((resolve, reject) => {
    // Launch full login ui
    let fnFullReauth = () => {
      sessionStorage.removeItem('pega_react_TI');
      authMgr.login().then((newTkn) => {
        processTokenOnLogin(newTkn);
        return resolve(newTkn.access_token);
      });
    };
    // If there is no refresh token, signinSilent will attempt to do a hidden iframe txn, so trying to avoid that
    //  by using the userHasRefreshToken constant
    if (userHasRefreshToken) {
      // load token info
      const token = getCurrentTokens();
      if (token && token.refresh_token) {
        authMgr
          .refreshToken(token.refresh_token)
          .then((newTkn) => {
            if (newTkn && newTkn.access_token) {
              processTokenOnLogin(newTkn);
              return resolve(newTkn.access_token);
            } else {
              fnFullReauth();
            }
          })
          .catch((e) => {
            console.log(e);
            fnFullReauth();
          });
      }
    } else {
      fnFullReauth();
    }
  });
};
