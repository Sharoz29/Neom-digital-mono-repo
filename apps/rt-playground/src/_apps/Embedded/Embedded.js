import React, { Component } from "react";
import { connect } from "react-redux";
import { endpoints } from '../../_services';
import { BundleSwatch } from "./BundleSwatch";
import { alertActions, caseActions, userActions } from "../../_actions";
import { setIsEmbedded, authLogout, isTrue } from "../../_helpers";
import { WorkObject } from "../../WorkObject/WorkObject";
import "./Embedded.css";

const embeddedScreen = {
  TriplePlayOptions: 1,
  PegaCase: 2,
  Resolution: 3
};

class Embedded extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: embeddedScreen.TriplePlayOptions
    };

    // Array of 3 shopping options to display
    this.shoppingOptions = [
      {
        "play" : "Triple Play",
        "level" : "Basic",
        "channels": "100+",
        "channels_full" : "100+ (Basic +)",
        "banner" : "Value package",
        "internetSpeed" : "25 Mbps",
        "extra_calling": "",
        "price": "99.00"
      },
      {
        "play" : "Triple Play",
        "level" : "Silver",
        "channels" : "125+",
        "channels_full" : "125+ (Deluxe)",
        "banner" : "Most popular",
        "internetSpeed" : "100 Mbps",
        "extra_calling": "",
        "price": "120.00"
      },
      {
        "play" : "Triple Play",
        "level" : "Gold",
        "channels" : "175+",
        "channels_full" : "175+ (Premium)",
        "banner" : "All the channels you want",
        "internetSpeed" : "300 Mbps",
        "extra_calling": " & International",
        "price": "150.00"
      }
    ];

    this.contentChoices = {
      "Basic": {
        TV: "true",
        TVOption: "Basic Plus",
        Internet: "true",
        InternetOption: "25 Mbps",
        Phone: "true",
        PhoneOption: "US/Canada"
      },
      "Silver": {
        TV: "true",
        TVOption: "Deluxe",
        Internet: "true",
        InternetOption: "100 Mbps",
        Phone: "true",
        PhoneOption: "International Limited"
      },
      "Gold" : {
        TV: "true",
        TVOption: "Premium",
        Internet: "true",
        InternetOption: "300 Mbps",
        Phone: "true",
        PhoneOption: "International Full"
      }
    };
    setIsEmbedded(true, "embedded");
  }

  componentDidUpdate(prevProps, prevState) {
    /* Check if assignment is open */
    /* No need to check caseDetails (just assignmentDetails) */
    if( prevState.screen === embeddedScreen.TriplePlayOptions && this.props.caseID && this.props.assignmentID && 
        this.props.assignmentDetails && this.props.assignmentDetails[this.props.caseID] ) {
      this.onCaseOpened();
      return;
    }
    /* Check if assignment is now closed */
    if( prevState.screen === embeddedScreen.PegaCase && prevProps.caseID !== null && this.props.caseID === null ) {
      if( this.props.pages && this.props.pages[prevProps.caseID] === null ) {
        this.onCaseCancelled();
      }
      else if( this.props.caseID === null ) {
        this.onCaseComplete();
      }
    }
  }

  setEmbeddedScreen( nScreen ) {
    this.setState( {screen: nScreen});
  }

  createCase(id, startingProcess, oContent) {
    const processID =
      startingProcess && startingProcess.ID ? startingProcess.ID : null;
    if (startingProcess && isTrue(startingProcess.requiresFieldsToCreate)) {
      this.props.dispatch(caseActions.getCaseCreationPage(id, processID));
    } else {
      this.props
        .dispatch(caseActions.createCase(id, processID, oContent))
        .catch((error) => {
          // If axios auth hdr is not available attempt to retry
          if( error === "Invalid access token" ) {
            authLogout();
            console.log("Attempting to retry onShopNow action");
            if( !this.state.bRetry ) {
              this.onShopNow(this.state.optionClicked, true);
            }
          }
          this.props.dispatch(alertActions.error("Case creation failed"));
          this.props.dispatch(alertActions.error(error));
        });
    }
  }


  onShopNow(optionClicked, bRetry=false) {

    this.setState({optionClicked, bRetry});

    const bHasToken = !!sessionStorage.getItem("pega_react_TI");
    const oEmbedCfg = endpoints.EMBEDCFG;
    const sCaseType = oEmbedCfg.caseType;
    const oChoiceContent = oEmbedCfg.passContent ? this.contentChoices[optionClicked] : {};

    if( !bHasToken ) {
      const username = oEmbedCfg.userIdentifier;
      const password = window.atob(oEmbedCfg.password);
      this.props.dispatch(userActions.login(username, password)).then( ()=> {
        this.createCase( sCaseType, {ID:"pyStartCase", requiresFieldsToCreate: false}, oChoiceContent );
      });  
    } else {
      this.createCase( sCaseType, {ID:"pyStartCase", requiresFieldsToCreate: false}, oChoiceContent );
    }
  }

  onCaseOpened() {
    this.setEmbeddedScreen( embeddedScreen.PegaCase );
  }

  onCaseComplete() {
    this.setEmbeddedScreen( embeddedScreen.Resolution );
  }

  onCaseCancelled() {
    this.setEmbeddedScreen( embeddedScreen.TriplePlayOptions );
  }

  getTriplePlayOptionsMarkup() {
    return (
      <div className="cc-main-screen">
        <div className="cc-banner">
            Combine TV, Internet, and Voice for the best deal
        </div>
        <div style={{display:"flex",justifyContent:"space-evenly"}}>
          <BundleSwatch config={this.shoppingOptions[0]} onClick={this.onShopNow.bind(this)} />
          <BundleSwatch config={this.shoppingOptions[1]} onClick={this.onShopNow.bind(this)} />
          <BundleSwatch config={this.shoppingOptions[2]} onClick={this.onShopNow.bind(this)} />
        </div>  
      </div>
    );
  }

  getPegaCaseMarkup() {
    const caseID = this.props.caseID;
    return (
      <div className="cc-info">
        <div className="cc-info-pega">
          <WorkObject
            assignment={this.props.assignmentDetails[caseID]}
            caseID={caseID}
            case={this.props.caseDetails[caseID]}
            page={this.props.pages[caseID]}
          />
          <br />
          <div style={{paddingLeft:"50px"}}> * - required fields</div>
        </div>
        <div className="cc-info-banner">
            <div className="cc-info-banner-text">
                We need to gather a little information about you.
            </div>
            <div>
                <img src={require(`../../assets/img/cableinfo.png`)} className="cc-info-image" />
            </div>         
        </div>
      </div>
    );
  }

  getResolutionsScreenMarkup() {
    return(
      <div className="cc-resolution">
        <div className="cc-card">
          <div className="cc-header">
              Welcome!
          </div>
          <div className="cc-body">
              Thanks for selecting a package with us. <br /><br />
              A technican will contact you with in the next couple of days to schedule an installation.<br /><br />
              If you have any questions, you can contact us directly at <b>1-800-555-1234</b> or you can chat with us.
          </div>
        </div>
        <div>
          <img src={require(`../../assets/img/cablechat.png`)} className="cc-chat-image" />
          <button className="cc-chat-button" >Chat Now</button>
        </div>
     </div>
    );
  }

  render() {

    return (
      <div>
        <div className="cc-toolbar">
          <h1>Cable Connect&nbsp;</h1><img src={require(`../../assets/img/antenna.svg`).default} className="cc-icon" />
        </div>
        <div className="cc-main-div">
        {this.state.screen === embeddedScreen.TriplePlayOptions && (
          this.getTriplePlayOptionsMarkup()
        )}
        {this.state.screen === embeddedScreen.PegaCase && (
          this.getPegaCaseMarkup()
        )}
        {this.state.screen === embeddedScreen.Resolution && (
          this.getResolutionsScreenMarkup()
        )}
        </div>
      </div>
    );

  }
  
}

function mapStateToProps(state) {
  let caseID=null, assignmentID=null;
  const {
    openAssignments,
    assignmentDetails
  } = state.assignments;
  const { caseDetails, pages } = state.cases;
  const openAssignment = openAssignments && openAssignments.length > 0 ? openAssignments[0] : null;
  const appSettings = state.user?.appSettings;
  if( openAssignment ) {
    caseID = openAssignment.caseID;
    assignmentID = openAssignment.ID || openAssignment.caseID;
  }
  return {
    caseID,
    caseDetails,
    assignmentID,
    assignmentDetails,
    pages,
    appSettings
  };
}

const connectedEmbedded = connect(mapStateToProps)(Embedded);

export default connectedEmbedded;
