import React, { Component } from "react";
import { connect } from "react-redux";
import { userManager } from "../_services";


class SilentPage extends Component {
  constructor(props) {
    super(props);
    window.onload = function() {
      userManager.signinSilentCallback(location.href);
    };
    
  }

  render() {
    return ( <div />
   );
  }
}

function mapStateToProps(state) {
  const { loggingIn } = state.user;
  return {
    loggingIn
  };
}

const connectedSilentPage = connect(mapStateToProps)(SilentPage);
export { connectedSilentPage as SilentPage };
