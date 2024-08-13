import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { endpoints } from "./endpoints";

import { getHomeUrl } from "../_helpers/appMisc";

import { loginBoxType } from "./endpoints";
import { Auth } from "../_helpers/auth";
import { calendarFormat } from "moment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  authUrl!: string;
  authMgr!: Auth;
  userIsSignedIn = false;
  authTokenExpired = false;
  // Since this variable is loaded in a separate instance in the popup scenario, use storage to coordinate across the two
  usePopupForRestOfSession = sessionStorage.getItem("pega_ng_popup") == "1";
  // To have this work smoothly on a browser refresh, use storage
  userHasRefreshToken = sessionStorage.getItem("pega_ng_hasrefresh") == "1";

  constructor(private http: HttpClient) {}

  /*
   * Set to use popup experience for rest of session
   */
  forcePopupForReauths = (bForce: boolean) => {
    if (bForce) {
      sessionStorage.setItem("pega_ng_popup", "1");
      this.usePopupForRestOfSession = true;
    } else {
      sessionStorage.removeItem("pega_ng_popup");
      this.usePopupForRestOfSession = false;
    }
  };

  // Initialize endpoints structure
  initEndpoints = () => {
    if (endpoints.PEGAURL && !endpoints.bInitialized) {
      const appBase = endpoints.PEGAURL + (endpoints.appAlias ? `/app/${endpoints.appAlias}` : '');
      if (!endpoints.PEAGABASEURL) {
        endpoints.PEAGABASEURL = appBase + '/api/v1';
      }
      if (endpoints.use_v2apis && !endpoints.BASEV2URL) {
        endpoints.BASEV2URL = appBase + "/api/application/v2";
      }
      if (endpoints.use_OAuth) {
        const authConfig = endpoints.OAUTHCFG;
        // Always use pkce (works even if OAuth 2.0 client reg record doesn't have that checked)
        if (authConfig.use_pkce === undefined) {
          authConfig.use_pkce = true;
        }
        if (!authConfig.authorize) {
          authConfig.authorize =
            endpoints.PEGAURL + "/PRRestService/oauth2/v1/authorize";
        }
        if (!authConfig.token) {
          authConfig.token =
            endpoints.PEGAURL + "/PRRestService/oauth2/v1/token";
        }
        if (authConfig.use_revoke && !authConfig.revoke) {
          authConfig.revoke =
            endpoints.PEGAURL + "/PRRestService/oauth2/v1/revoke";
        }
      }
    }
    endpoints.bInitialized = true;

    if (endpoints.use_OAuth) {
      this.initPegaOAuth();
    } else {
      this.authUrl = endpoints.PEAGABASEURL + endpoints.AUTH;
    }
  };

  /* Initialize PegaOAuth library */
  initPegaOAuth = () => {
    const authConfig = endpoints.OAUTHCFG;

    // Check if sessionStorage exists (and if so if for same authorize endpoint).  Otherwise, assume
    //  sessionStorage is out of date (user just edited endpoints).  Else, logout required to clear
    //  sessionStorage and get other endpoints updates.
    // Doing this as sessionIndex might have been added to this storage structure
    let sSI = sessionStorage.getItem("pega_ng_CI");
    if (sSI) {
      try {
        const oSI = JSON.parse(sSI);
        if (oSI.authorizeUri !== authConfig.authorize ||
           oSI.clientId !== authConfig.client_id) {
          this.clearAuthMgr();
          sSI = null;
        }
      } catch (e: any) { /* empty */ }
    }

    if (!sSI) {
      // redirect url needs to actually exist if rendered from a web server...so if that is the case, make it
      //  the root path (which will then serve up index.html)
      const homeUrl = getHomeUrl();
      const sAuthPagePath =
        window.location.origin +
        homeUrl + "auth";
      // Initialize authConfig structure so we can store it in sessionStorage and pass it to Auth
      const paConfig: any = {
        clientId: authConfig.client_id,
        authorizeUri: authConfig.authorize,
        tokenUri: authConfig.token,
        redirectUri: sAuthPagePath,
        appAlias: endpoints.appAlias || ``
      };
      if (authConfig.authService) {
        paConfig.authService = authConfig.authService;
      }
      if (authConfig.revoke) {
        paConfig.revokeUri = authConfig.revoke;
        if (authConfig.use_locking) {
          paConfig.useLocking = true;
        }
      }
      if (authConfig.client_secret) {
        paConfig.clientSecret = authConfig.client_secret;
      }
      sessionStorage.setItem("pega_ng_CI", JSON.stringify(paConfig));
    }

    this.authMgr = new Auth("pega_ng_CI");
  };

  /**
   * Clean up any web storage allocated for the user session.
   */
  clearAuthMgr = () => {
    // Remove any session storage for the user
    sessionStorage.removeItem("pega_ng_CI");
    sessionStorage.removeItem("pega_ng_TI");
    this.userIsSignedIn = false;
    // Not removing the authMgr structure itself...as it can be leveraged on next login
  };

  processTokenOnLogin = (token: { refresh_token: any; access_token: any; }) => {
    sessionStorage.setItem("pega_ng_TI", JSON.stringify(token));
    if (token.refresh_token) {
      this.userHasRefreshToken = true;
      sessionStorage.setItem("pega_ng_hasrefresh", "1");
    }
    this.userIsSignedIn = true;
    this.forcePopupForReauths(true);
    this.setToken(token.access_token);
  };

  getCurrentTokens = () => {
    let tokens = null;
    const sTI = sessionStorage.getItem("pega_ng_TI");
    if (sTI !== null) {
      try {
        tokens = JSON.parse(sTI);
      } catch (e: any) {
        console.log("error parsing saved token");
        tokens = null;
      }
    }
    return tokens;
  };

  /**
   * Do any login related activities
   */
  authLogin = () => {
    // Make sure page_react_TI has been removed
    sessionStorage.removeItem("pega_ng_TI");
    if (this.authIsMainRedirect()) {
      this.authMgr.loginRedirect();
      // Don't have token til after the redirect
      return Promise.resolve(undefined);
    } else {
      return new Promise((resolve, reject) => {
        this.authMgr
          .login()
          .then((token: any) => {
            // Store tokens in sessionStorage
            sessionStorage.setItem("pega_ng_TI", JSON.stringify(token));
            resolve(token.access_token);
          })
          .catch((e: any) => {
            console.log(e);
            reject(e);
          });
      });
    }
  };

  /**
   * Do any logout related activities
   */
  authLogout = () => {
    const tokens = this.getCurrentTokens();
    // Clear tokens first so if we get recalled, won't try to revoke them again
    this.clearAuthMgr();
    sessionStorage.removeItem("pega_ng_user");
    this.forcePopupForReauths(false);
    if (tokens && tokens.access_token) {
      // If we didn't configure the revoke endpoint this does nothing
      this.authMgr.revokeTokens(
        tokens.access_token,
        tokens.refresh_token ? tokens.refresh_token : null
      );
    }
  };

  authIsSignedIn = () => {
    return this.userIsSignedIn;
  };

  authRedirectCallback = (href: string | string[][] | Record<string, string> | URLSearchParams | undefined, fnLoggedInCB: Function) => {
    // Get code from href and swap for token
    const urlParams = new URLSearchParams(href);
    const code = urlParams.get("code");

    const token = this.authMgr.getToken(code).then((token: { refresh_token: any, access_token: any }) => {
      if (token && token.access_token) {
        this.processTokenOnLogin(token);
        if (fnLoggedInCB) {
          fnLoggedInCB(token.access_token);
        }
      }
    });
  };

  authIsMainRedirect = () => {
    // Even with main redirect, we want to use it only for the first login (so it doesn't wipe out any state or the reload)
    return (
      endpoints.OAUTHCFG.loginExperience == loginBoxType.Main &&
      !this.usePopupForRestOfSession
    );
  };

  authRefresh = () => {
    return new Promise((resolve, reject) => {
      // Launch full login ui
      const fnFullReauth = () => {
        sessionStorage.removeItem("pega_ng_TI");
        this.authMgr.login().then((newTkn: { access_token: any; }) => {
          this.processTokenOnLogin(newTkn as any);
          return resolve(newTkn.access_token);
        });
      };
      // If there is no refresh token, signinSilent will attempt to do a hidden iframe txn, so trying to avoid that
      //  by using the userHasRefreshToken constant
      if (this.userHasRefreshToken) {
        // load token info
        const token = this.getCurrentTokens();
        if (token && token.refresh_token) {
          this.authMgr
            .refreshToken(token.refresh_token)
            .then((newTkn: { access_token: unknown; }) => {
              if (newTkn && newTkn.access_token) {
                this.processTokenOnLogin(newTkn as any);
                alert(
                  "You have been reauthenticated with refresh token, please try again..."
                );
                return resolve(newTkn.access_token);
              } else {
                fnFullReauth();
              }
            })
            .catch((e: any) => {
              console.log(e);
              fnFullReauth();
            });
        }
      } else {
        fnFullReauth();
      }
    });
  };

  login(userName: string, password: string) {
    const encodedUser = btoa(userName + ":" + password);

    const authParams = new HttpParams();
    let authHeaders = new HttpHeaders();
    authHeaders = authHeaders.append("Authorization", "Basic " + encodedUser);

    sessionStorage.setItem("pega_ng_user", `Basic ${encodedUser}`);

    return this.http.get(this.authUrl + "/", {
      observe: "response",
      params: authParams,
      headers: authHeaders,
    });
  }

  setToken(token: {}) {
    const authHdr = token ? `Bearer ${token}` : "";
    sessionStorage.setItem("pega_ng_user", authHdr);
    return authHdr;
  }

  loginOauth(clientID: string) {
    this.authLogin().then((token) => {
      if (token) {
        this.setToken(token);
        // Route to workarea as well if popup (callback only happens on popup scenario
      }
    });
  }

  verifyHasTokenOauth() {
    // 
  }

  logout() {
    this.authLogout();
    sessionStorage.removeItem("pega_ng_user");
  }
}
