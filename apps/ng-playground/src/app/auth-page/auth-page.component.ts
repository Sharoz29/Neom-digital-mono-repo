import { Component, OnInit } from "@angular/core";
import { getHomeUrl } from "../_helpers/appMisc";
import { AuthService } from "../_services/auth.service";

declare global {
  interface Window {
    console: any;
    authCodeCallback: any;
  }
}

@Component({
  selector: "app-auth-page",
  templateUrl: "./auth-page.component.html",
  styleUrls: ["./auth-page.component.scss"],
})
export class AuthPageComponent implements OnInit {
  constructor(private authservice: AuthService,
) {
    if (this.authservice.authIsMainRedirect()) {
      this.authservice.authRedirectCallback(location.href, (token: {}) => {
        this.authservice.setToken(token);
        location.href = getHomeUrl();
      });
    } else {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      let bTryOpenerLogging = false;
      let fnLog = bTryOpenerLogging ? window.opener.console.log : console.log;
      let bSuccess = false;

      if (code) {
        fnLog("Testing");
        try {
          window.opener.authCodeCallback(code);
          bSuccess = true;
        } catch (e: any) {
          fnLog("auth-page: Failed to directly access authCodeCallback.");
        }

        // Post messages require a targetDomain...trying to pass this via state
        let embedOrigin = this.getEmbedOriginFromState(state);
        if (!bSuccess) {
          try {
            window.opener.postMessage(
              { type: "Auth", code: code },
              embedOrigin
            );
            bSuccess = true;
          } catch (e: any) {
            fnLog("auth-page: Failed to directly post message to opener");
          }
        }

        if (!bSuccess) {
          window.addEventListener("message", (event) => {
            if (event.data && event.data.type && event.data.type === "Auth") {
              if (!(event.source instanceof Window)) return;
              event.source.postMessage(
                { type: "Auth", code: code },
                embedOrigin
              );
            }
          });
        }
      }
    }
  }

  getEmbedOriginFromState(state: string | null) {
    let embedOrigin = null;
    try {
      // Expect state to contain the embedding page's origin
      if (state) {
        embedOrigin = window.atob(state);
      }
    } catch (e: any) {
      // Ignore
    }
    if (!embedOrigin) {
      embedOrigin = location.origin;
    }
    return embedOrigin;
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // 
  }
}
