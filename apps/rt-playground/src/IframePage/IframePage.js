import React, { Component } from "react";
import { connect } from "react-redux";


class IframePage extends Component {
  constructor(props) {
    super(props);

    // Setup call back function to receive postMessage from page loaded in iframe
    window.addEventListener("message", (event) => {
      // Check origin
      if( event.origin != window.location.origin)
        return;
      if( "JSO" == event.data ) {
        event.source.postMessage(window.location.href, window.location.origin);
      }
    }, false);

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

const connectedIframePage = connect(mapStateToProps)(IframePage);
export { connectedIframePage as IframePage };
