import React, { Component } from "react";
import { connect } from "react-redux";
import { authIsMainRedirect, authRedirectCallback, getHomeUrl } from "../_helpers";
import { userActions } from "../_actions";

class AuthPage extends Component {
  constructor(props) {
    super(props);
    if( authIsMainRedirect() ) {
      authRedirectCallback(location.href, (token) => {
        this.props.dispatch(userActions.setToken(token));
        const sAppName = sessionStorage.getItem("pega_react_appName") || "";
        location.href = getHomeUrl() + sAppName;
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
          } catch(e) {
              fnLog("auth.html: Failed to directly access authCodeCallback.")
          }

          // Post messages require a targetDomain...trying to pass this via state
          let embedOrigin = getEmbedOriginFromState(state);
          if( !bSuccess ) {
              try {
                  window.opener.postMessage({type:"PegaAuth", code:code}, embedOrigin);
                  bSuccess = true;
              } catch(e) {
                  fnLog("auth.html: Failed to directly post message to opener");
              }
          }

          if( !bSuccess ) {
              window.addEventListener("message", (event) => {
                  if( event.data && event.data.type && event.data.type==="PegaAuth" ) {
                      event.source.postMessage({type:"PegaAuth", code:code}, embedOrigin);
                  }
              });        
          }

      }

    }
  }

  render() {
    return (<div />);
  }
}

function getEmbedOriginFromState(state) {
  let embedOrigin = null;
  try {
      // Expect state to contain the embedding page's origin
      if( state ) {
          embedOrigin = window.atob(state);
      }
  } catch(e) {
  }
  if( !embedOrigin ) {
      embedOrigin = location.origin;
  }
  return embedOrigin;
}


function mapStateToProps(state) {
  const { loggingIn } = state.user;
  return {
    loggingIn
  };
}

const connectedAuthPage = connect(mapStateToProps)(AuthPage);
export { connectedAuthPage as AuthPage };
