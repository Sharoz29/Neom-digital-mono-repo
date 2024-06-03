import React, { Component } from "react";
import { Router, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import {
  Container,
  Message,
  Sidebar,
  Menu,
  Icon,
  Header,
  Button,
} from "semantic-ui-react";

import { history, isTrue, getHomeUrl, setIsEmbedded } from "../../_helpers";
import { PrivateRoute } from "../../_components";
import { Workarea } from "../../Workarea/Workarea";
import { LoginPage } from "../../LoginPage";
//import { IframePage } from "../IframePage";
//import { SilentPage } from "../SilentPage";
import { AppHeader } from "../../AppHeader";
import {
  alertActions,
  caseActions,
  assignmentActions,
  userActions,
} from "../../_actions";

class PegaApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      loginRedirect: false,
    };
    setIsEmbedded(false, "");
  }

  componentDidMount() {
    // Added check for not having already encountered an error (to avoid repeated attempts)
    // When misconfigured...no use trying repeatedly...once is enough (CORS errors seem to have the error as..."Network Error")
    // Commenting this code to avoid duplicate calls
    // if (this.props.user.loggedIn && this.props.caseTypes.length === 0 && !this.props.caseTypesError) {
    //   this.props.dispatch(caseActions.getCaseTypes());
    // }
  }

  static getDerivedStateFromProps(props, state) {
    // Added check for not having already encountered an error (to avoid repeated attempts)
    if (
      props &&
      props.user.loggedIn &&
      !props.requestInProgress &&
      props.caseTypes.length === 0 &&
      !props.caseTypesError
    ) {
      props.dispatch(caseActions.getCaseTypes());
    }

    return state;
  }

  getMenuItemsForCases() {
    let validCases = [];

    // Don't try to add Menu.Item when there's nothing to add
    if (this.props.caseTypes && this.props.caseTypes.length > 0) {
      this.props.caseTypes.forEach((caseType) => {
        if (isTrue(caseType.CanCreate)) {
          if (caseType.startingProcesses) {
            caseType.startingProcesses.forEach((startingProcess) => {
              validCases.push(
                <Menu.Item
                  key={startingProcess.name + validCases.length}
                  name={startingProcess.name}
                  content={startingProcess.name}
                  onClick={(e) => this.createCase(caseType.ID, startingProcess)}
                />
              );
            });
          } else {
            validCases.push(
              <Menu.Item
                key={caseType.name + validCases.length}
                name={caseType.name}
                content={caseType.name}
                onClick={(e) => this.createCase(caseType.ID, null)}
              />
            );
          }
        }
      });
    }

    return validCases;
  }

  createCase(id, startingProcess) {
    const processID =
      startingProcess && startingProcess.ID ? startingProcess.ID : null;
    if (startingProcess && isTrue(startingProcess.requiresFieldsToCreate)) {
      this.props.dispatch(caseActions.getCaseCreationPage(id, processID));
    } else {
      this.props
        .dispatch(caseActions.createCase(id, processID))
        .catch((error) => {
          this.props.dispatch(alertActions.error("Case creation failed"));
          this.props.dispatch(alertActions.error(error));
        });
    }

    this.setState({ visible: false });
  }

  closeSidebar() {
    if (this.state.visible) {
      this.setState({ visible: false });
    }
  }

  toggleSidebar = () => this.setState({ visible: !this.state.visible });

  handleAlertDismiss = (id) => {
    this.props.dispatch(alertActions.closeAlert(id));
  };

  handleAlertDismissAll = () => {
    this.props.alert.activeAlerts.map((alert, index) => {
      this.handleAlertDismiss(alert.id);
    });
  };

  getAlertsRow = (alert, index) => {
    const { negative, positive, id, code, message } = alert;
    return (
      <Message
        floating
        key={index}
        negative={negative}
        positive={positive}
        onDismiss={() => this.handleAlertDismiss(id)}
      >
        <Message.Header>
          {code ? `${code}: ${message}` : message}
        </Message.Header>
      </Message>
    );
  };

  render() {
    const homeUrl = getHomeUrl();

    return (
      <Router history={history}>
        <Switch>
         <Route>
            <div id="router-root">
              <AppHeader toggleSidebar={this.toggleSidebar} />
              <Sidebar.Pushable className="main">
                <Sidebar
                  as={Menu}
                  animation="push"
                  visible={this.state.visible}
                  icon="labeled"
                  width="thin"
                  vertical
                  inverted
                >
                  <Menu.Item name="create">
                    <Header as="h3" inverted>
                      <Icon name="plus" />
                      Create
                    </Header>
                  </Menu.Item>
                  {this.getMenuItemsForCases()}
                </Sidebar>
                <Sidebar.Pusher
                  dimmed={this.state.visible}
                  onClick={() => this.closeSidebar()}
                >
                  <div className="workarea">
                    <Container className="main">
                      <Route
                        path={`${process.env.PUBLIC_URL}/login`}
                        component={LoginPage}
                      />
                      {/*
                        <Route path={`${process.env.PUBLIC_URL}/iframe`} component={IframePage} />
                        <Route path={`${process.env.PUBLIC_URL}/silent`} component={SilentPage} />
                      */}
                    </Container>
                    <PrivateRoute exact path={homeUrl} component={Workarea} />
                  </div>
                  <Container className="alert-container">
                    {this.props.alert.activeAlerts.map((alert, index) => {
                      return this.getAlertsRow(alert, index);
                    })}
                    {this.props.alert.activeAlerts.length > 1 && (
                      <Button onClick={() => this.handleAlertDismissAll()}>
                        Clear All
                      </Button>
                    )}
                  </Container>
                </Sidebar.Pusher>
              </Sidebar.Pushable>
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

function mapStateToProps(state) {
  const { alert, cases, user } = state;
  return {
    alert,
    caseTypes: cases.caseTypes,
    caseTypesError: cases.caseTypesError,
    requestInProgress: cases.caseTypesRequestInProgress,
    user: user,
  };
}

const connectedPegaApp = connect(mapStateToProps)(PegaApp);
export { connectedPegaApp as PegaApp };
