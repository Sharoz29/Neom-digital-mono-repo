export class Auth {
  bEncodeSI: boolean;
  config: any;
  ssKeyConfig: any;
  constructor(ssKeyConfig: any) {
    this.ssKeyConfig = ssKeyConfig;
    this.bEncodeSI = false;
    this.#reloadConfig();
  }

  #reloadConfig() {
    const peConfig = window.sessionStorage.getItem(this.ssKeyConfig);
    let obj = {};
    if (peConfig) {
      try {
        obj = JSON.parse(peConfig);
      } catch (e: any) {
        try {
          obj = JSON.parse(window.atob(peConfig));
        } catch (e: any) {
          obj = {};
        }
      }
    }

    this.config = peConfig ? obj : null;
  }

  #updateConfig() {
    const sSI = JSON.stringify(this.config);
    window.sessionStorage.setItem(
      this.ssKeyConfig,
      this.bEncodeSI ? window.btoa(sSI) : sSI
    );
  }

  // For PKCE the authorize includes a code_challenge & code_challenge_method as well
  async #buildAuthorizeUrl(state: string) {
    const {
      clientId,
      redirectUri,
      authorizeUri,
      authService,
      sessionIndex,
      appAlias,
      useLocking,
      userIdentifier,
      password,
    } = this.config;

    // Generate random string of 64 chars for verifier.  RFC 7636 says from 43-128 chars
    let buf = new Uint8Array(64);
    window.crypto.getRandomValues(buf);
    this.config.codeVerifier = this.#base64UrlSafeEncode(buf);
    // Persist codeVerifier in session storage so it survives the redirects that are to follow
    this.#updateConfig();

    if (!state) {
      // Calc random state variable
      buf = new Uint8Array(32);
      window.crypto.getRandomValues(buf);
      state = this.#base64UrlSafeEncode(buf);
    }

    // Trim alias to include just the real alias piece
    const addtlScope = appAlias
      ? "+app.alias." + appAlias.replace(/^app\//, "")
      : "";

    // Add explicit creds if specified to try to avoid login popup
    const moreAuthArgs =
      (authService
        ? `&authentication_service=${encodeURIComponent(authService)}`
        : "") +
      (sessionIndex ? `&session_index=${sessionIndex}` : "") +
      (useLocking ? `&enable_psyncId=true` : "") +
      (userIdentifier
        ? `&UserIdentifier=${encodeURIComponent(userIdentifier)}` +
          (password
            ? `&Password=${encodeURIComponent(window.atob(password))}`
            : "")
        : "");

    return this.#getCodeChallenge(this.config.codeVerifier).then((cc) => {
      // Now includes new enable_psyncId=true and session_index params
      return `${authorizeUri}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid${addtlScope}&state=${state}&code_challenge=${cc}&code_challenge_method=S256${moreAuthArgs}`;
    });
  }

  async login(): Promise<any> {
    const fnGetRedirectUriOrigin = () => {
      const redirectUri = this.config.redirectUri;
      const nRootOffset = redirectUri.indexOf("//");
      const nFirstPathOffset =
        nRootOffset !== -1 ? redirectUri.indexOf("/", nRootOffset + 2) : -1;
      return nFirstPathOffset !== -1
        ? redirectUri.substring(0, nFirstPathOffset)
        : redirectUri;
    };

    const redirectOrigin = fnGetRedirectUriOrigin();
    const state = window.btoa(location.origin);

    return new Promise((resolve, reject) => {
      /* eslint-disable consistent-return */
      this.#buildAuthorizeUrl(state).then((url) => {
        let myWindow: Window | null = null; // popup or iframe
        let elIframe: HTMLIFrameElement | null = null;
        let bWinIframe =
          (!!this.config.userIdentifier && !!this.config.password) ||
          this.config.authService !== "pega";
        let tmrAuthComplete: any= null,
          checkWindowClosed: any = null;
        const myWinOnLoad = () => {
          try {
            if (bWinIframe) {
              elIframe?.contentWindow?.postMessage(
                { type: "PegaAuth" },
                redirectOrigin
              );
              console.log("authjs(login): loaded a page in iFrame");
            } else {
              myWindow?.postMessage({ type: "PegaAuth" }, redirectOrigin);
            }
          } catch (e: any) {
            console.log(
              "authjs(login): Exception trying to postMessage on load"
            );
          }
        };
        const fnOpenPopup = () => {
          myWindow = window.open(
            url,
            "_blank",
            "width=700,height=500,left=200,top=100"
          );
          if (!myWindow) {
            // Blocked by popup-blocker
            return reject("blocked");
          }
          checkWindowClosed = setInterval(() => {
            if (myWindow?.closed) {
              clearInterval(checkWindowClosed as number);
              reject("closed");
            }
          }, 500);
          try {
            myWindow.addEventListener("load", myWinOnLoad, true);
          } catch (e: any) {
            console.log(
              "authjs(login): Exception trying to add onload handler to opened window;"
            );
          }
        };
        // If there is a userIdentifier and password specified or an external SSO auth service,
        //  we can try to use this silently in an iFrame first
        if (bWinIframe) {
          elIframe = document.createElement("iframe");
          elIframe.setAttribute("id", "pe" + this.config.clientId);
          elIframe.setAttribute("style", "position:absolute;display:none");
          // Add Iframe to DOM to have it load
          document.getElementsByTagName("body")[0].appendChild(elIframe);
          elIframe.addEventListener("load", myWinOnLoad, true);
          elIframe.setAttribute("src", url);
          // If the password was wrong, then the login screen will be in the iframe
          // ..and with Pega without realization of US-372314 it may replace the top (main portal) window
          // For now set a timer and if the timer expires, remove the iFrame and use same url within
          // visible window
          tmrAuthComplete = setTimeout(() => {
            clearTimeout(tmrAuthComplete as number);
            // remove password from config
            if (this.config.password) {
              delete this.config.password;
              this.#updateConfig();
            }
            elIframe?.parentNode?.removeChild(elIframe as Node);
            elIframe = null;
            // Now try to do regular popup open
            bWinIframe = false;
            fnOpenPopup();
          }, 5000);
        } else {
          fnOpenPopup();
        }

        let authMessageReceiver: { (this: Window, ev: MessageEvent<any>): any; (event: any): void; (this: Window, ev: MessageEvent<any>): any; } | null = null;
        /* Retrieve token(s) and close login window */
        const fnGetTokenAndFinish = (code: any) => {
          window.removeEventListener("message", authMessageReceiver as any, false);
          this.getToken(code)
            .then((token) => {
              if (bWinIframe) {
                clearTimeout(tmrAuthComplete as number);
                elIframe?.parentNode?.removeChild(elIframe);
                elIframe = null;
              } else {
                clearInterval(checkWindowClosed as number);
                myWindow?.close();
              }
              resolve(token);
            })
            .catch((e) => {
              reject(e);
            });
        };
        /* Handler to receive the auth code */
        authMessageReceiver = (event: { origin: any; data: { type: string; code: { toString: () => any; }; }; }) => {
          // Check origin to make sure it is the redirect origin
          if (event.origin !== redirectOrigin) return;
          if (!event.data || !event.data.type || event.data.type !== "PegaAuth")
            return;
          console.log("authjs(login): postMessage received with code");
          const code = event.data.code.toString();
          fnGetTokenAndFinish(code);
        };
        window.addEventListener("message", authMessageReceiver, false);
        window.authCodeCallback = function (code: any) {
          console.log("authjs(login): authCodeCallback used with code");
          fnGetTokenAndFinish(code);
        };
      });
    });
  }

  // Login redirect
  loginRedirect() {
    const state = window.btoa(location.origin);
    this.#buildAuthorizeUrl(state).then((url) => {
      location.href = url;
    });
  }

  // For PKCE token endpoint includes code_verifier
  getToken(authCode: string | null) {
    // Reload config to pick up the previously stored codeVerifier
    this.#reloadConfig();

    const { clientId, clientSecret, redirectUri, tokenUri, codeVerifier } =
      this.config;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = authCode || urlParams.get("code");

    const formData = new URLSearchParams();
    formData.append("client_id", clientId);
    if (clientSecret) {
      formData.append("client_secret", clientSecret);
    }
    formData.append("grant_type", "authorization_code");
    formData.append("code", code as string);
    formData.append("redirect_uri", redirectUri);
    formData.append("code_verifier", codeVerifier);

    return fetch(tokenUri, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/x-www-form-urlencoded",
      }),

      body: formData.toString(),
    })
      .then((response) => response.json())
      .then((token) => {
        // .expires_in contains the # of seconds before access token expires
        // add property to keep track of current time when the token expires
        /* eslint-disable camelcase */
        token.eA = Date.now() + token.expires_in * 1000;
        let bUpdateConfig = false;
        if (this.config.codeVerifier) {
          delete this.config.codeVerifier;
          bUpdateConfig = true;
        }
        // If there is a session_index then move this to the peConfig structure (as used on authorize)
        if (token.session_index) {
          this.config.sessionIndex = token.session_index;
          // Also update the session storage to contain this update
          bUpdateConfig = true;
        }
        if (bUpdateConfig) {
          this.#updateConfig();
        }
        return token;
        /* eslint-enable camelcase */
      })
      .catch((e) => console.log(e));
  }

  /* eslint-disable camelcase */
  async refreshToken(refresh_token: string) {
    const { clientId, clientSecret, tokenUri } = this.config;

    const formData = new URLSearchParams();
    formData.append("client_id", clientId);
    if (clientSecret) {
      formData.append("client_secret", clientSecret);
    }
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", refresh_token);

    return fetch(tokenUri, {
      method: "POST",
      headers: new Headers({
        "content-type": "application/x-www-form-urlencoded",
      }),

      body: formData.toString(),
    })
      .then((response) => {
        if (!response.ok && 401 === response.status) {
          return null;
        }
        return response.json();
      })
      .then((token) => {
        if (token) {
          // .expires_in contains the # of seconds before access token expires
          // add property to keep track of current time when the token expires
          token.eA = Date.now() + token.expires_in * 1000;
        }
        return token;
      })
      .catch((e) => console.log(e));
  }

  async revokeTokens(access_token: string, refresh_token = null) {
    if (!this.config || !this.config.revokeUri) {
      // Must have a config structure and revokeUri to proceed
      return;
    }
    const { clientId, clientSecret, revokeUri } = this.config;

    const hdrs: Record<string,string> = { "content-type": "application/x-www-form-urlencoded" };
    if (clientSecret) {
      hdrs["authorization"] =
        "Basic " + window.btoa(clientId + ":" + clientSecret);
    }
    const aTknProps = ["access_token"];
    if (refresh_token) {
      aTknProps.push("refresh_token");
    }
    aTknProps.forEach((prop) => {
      const formData = new URLSearchParams();
      if (!clientSecret) {
        formData.append("client_id", clientId);
      }
      formData.append(
        "token",
        prop === "access_token" ? access_token : refresh_token || ""
      );
      formData.append("token_type_hint", prop);
      fetch(revokeUri, {
        method: "POST",
        headers: new Headers(hdrs),
        body: formData.toString(),
      })
        .then((response) => {
          if (!response.ok) {
            console.log("Error revoking " + prop + ":" + response.status);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
    // Also clobber any sessionIndex
    if (this.config.sessionIndex) {
      delete this.config.sessionIndex;
      this.#updateConfig();
    }
  }
  /* eslint-enable camelcase */

  /* eslint-disable-next-line class-methods-use-this */
  #sha256Hash(str: string | undefined) {
    return window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(str)
    );
  }

  // Base64 encode
  /* eslint-disable-next-line class-methods-use-this */
  #encode64(buff: Iterable<number>) {
    return window.btoa(
      new Uint8Array(buff).reduce((s, b) => s + String.fromCharCode(b), "")
    );
  }

  /*
   * Base64 url safe encoding of an array
   */
  #base64UrlSafeEncode(buf: any) {
    const s = this.#encode64(buf)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    return s;
  }

  /* Calc code verifier if necessary
   */
  /* eslint-disable camelcase */
  #getCodeChallenge(code_verifier: any) {
    return this.#sha256Hash(code_verifier)
      .then((hashed) => {
        return this.#base64UrlSafeEncode(hashed);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        return null;
      });
  }
  /* eslint-enable camelcase */
}
