import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Router, Switch, Route } from 'react-router-dom';
import {
  Container,
  Message,
  Sidebar,
  Menu,
  Icon,
  Header,
  Button,
} from 'semantic-ui-react';
import { history, isTrue, getHomeUrl, setIsEmbedded } from '../../_helpers';
import { PrivateRoute } from '../../_components';
import Workarea from '../../Workarea/Workarea';
import { LoginPage } from '../../LoginPage';
import { alertActions, caseActions } from '../../_actions';
import AlarmDetail from '../../_components/Alarm/AlarmDetail';
import DeviceDetail from '../../_components/Device/DeviceDetail';
import Device from '../../_components/Device/Device';
import Alarms from '../../_components/Alarm/Alarms';
import Cases from '../../_components/Cases/Cases';
import CaseDetail from '../../_components/Cases/CaseDetail';

function PegaApp() {
  const [visible, setVisible] = useState(false);
  const { user, cases, alert } = useSelector((state) => ({
    user: state.user,
    cases: state.cases,
    alert: state.alert,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    setIsEmbedded(false, '');
    if (
      user.loggedIn &&
      cases.caseTypes.length === 0 &&
      !cases.caseTypesError
    ) {
      dispatch(caseActions.getCaseTypes());
    }
  }, [user.loggedIn, cases.caseTypes.length, cases.caseTypesError, dispatch]);

  const getMenuItemsForCases = () => {
    let validCases = [];
    ``;
    if (cases.caseTypes && cases.caseTypes.length > 0) {
      cases.caseTypes.forEach((caseType, index) => {
        if (isTrue(caseType.CanCreate)) {
          if (caseType.startingProcesses) {
            caseType.startingProcesses.forEach((startingProcess) => {
              validCases.push(
                <Menu.Item
                  key={startingProcess.name + index}
                  name={startingProcess.name}
                  content={startingProcess.name}
                  onClick={() => createCase(caseType.ID, startingProcess)}
                />
              );
            });
          } else {
            validCases.push(
              <Menu.Item
                key={caseType.name + index}
                name={caseType.name}
                content={caseType.name}
                onClick={() => createCase(caseType.ID, null)}
              />
            );
          }
        }
      });
    }
    return validCases;
  };

  const createCase = (id, startingProcess) => {
    const processID =
      startingProcess && startingProcess.ID ? startingProcess.ID : null;
    if (startingProcess && isTrue(startingProcess.requiresFieldsToCreate)) {
      dispatch(caseActions.getCaseCreationPage(id, processID));
    } else {
      dispatch(caseActions.createCase(id, processID)).catch((error) => {
        dispatch(alertActions.error('Case creation failed'));
        dispatch(alertActions.error(error));
      });
    }
    setVisible(false);
  };

  const handleAlertDismiss = (id) => {
    dispatch(alertActions.closeAlert(id));
  };

  const handleAlertDismissAll = () => {
    alert.activeAlerts.forEach((alert) => {
      handleAlertDismiss(alert.id);
    });
  };

  const getAlertsRow = (alert, index) => {
    const { negative, positive, id, code, message } = alert;
    return (
      <Message
        floating
        key={index}
        negative={negative}
        positive={positive}
        onDismiss={() => handleAlertDismiss(id)}
      >
        <Message.Header>
          {code ? `${code}: ${message}` : message}
        </Message.Header>
      </Message>
    );
  };

  const homeUrl = getHomeUrl();
  return (
    <Router history={history}>
      <Switch>
        <Route>
          <div
            style={{
              background: 'white',
            }}
            id="router-root"
          >
            <Sidebar.Pushable className="main">
              <Sidebar
                as={Menu}
                animation="push"
                visible={visible}
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
                {getMenuItemsForCases()}
              </Sidebar>
              <Sidebar.Pusher
                dimmed={visible}
                onClick={() => setVisible(false)}
              >
                <Container className="main">
                  <Route
                    path={`${process.env.PUBLIC_URL}/login`}
                    component={LoginPage}
                  />
                </Container>
                <PrivateRoute exact path={homeUrl} component={Workarea} />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/devices`}
                  component={Device}
                />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/device`}
                  component={DeviceDetail}
                />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/alarm/:id`}
                  component={AlarmDetail}
                />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/alarms`}
                  component={Alarms}
                />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/device/:id`}
                  component={DeviceDetail}
                />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/cases`}
                  component={Cases}
                />
                <PrivateRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/cases/:id`}
                  component={CaseDetail}
                />
                <Container className="alert-container">
                  {alert.activeAlerts.map((alert, index) =>
                    getAlertsRow(alert, index)
                  )}
                  {alert.activeAlerts.lenygth > 1 && (
                    <Button onClick={handleAlertDismissAll}>Clear All</Button>
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

export { PegaApp };
