import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Menu,
  Container,
  Header,
  Segment,
  Dropdown,
  Breadcrumb,
  Message,
  Icon,
} from 'semantic-ui-react';
import _ from 'lodash';

import { caseActions, assignmentActions } from '../_actions';
import { PegaForm } from '../PegaForm/PegaForm';
import { endpoints } from '../_services';

/**
 * Wrapper React component for PegaForm.
 * Maintains breadcrumb, actions menu.
 * All form generation is handled by the PegaForm component.
 */
class WorkObject extends Component {
  constructor(props) {
    super(props);

    const stages = props.case && props.case.stages ? props.case.stages : [];
    const assignmentAction = props.assignment
      ? props.assignment.actions[0].ID
      : null;

    // To check if we're in /embedded mode
    const bIsEmbeddedMode =
      window.location.pathname === '/embedded' ? true : false;

    // Initial state
    this.state = {
      stages: stages,
      currAssignmentAction: assignmentAction,
      view: props.views[props.caseID],
      forceRefresh: false,
      showAttachmentsWidget: bIsEmbeddedMode
        ? false
        : this.props.appSettings.bShowAttachments,
    };
  }

  // componentWillUpdate lifecycle method was deprecated...so converted it to use componentDidUpdate
  componentDidUpdate(prevProps, prevState) {
    // We are doing this because when case status updates to pending, it does not return all its stages,
    // but we still want to display breadcrumb. Store stages the first time it is available.
    if (
      prevState &&
      prevState.stages.length === 0 &&
      this.props.case &&
      this.props.case.stages
    ) {
      this.setState({
        stages: this.props.case.stages,
      });
    }

    // We have changed assignment, so update the currAssignmentAction with 1st from new assignment
    if (
      this.props.assignment &&
      prevProps.assignment.ID !== this.props.assignment.ID
    ) {
      this.setState({
        currAssignmentAction: this.props.assignment.actions[0].ID,
      });
    }

    // Will update showAttachmentsWidget property within the state accordingly when 'Show Attachments' checkbox in settings modal changes.
    if (
      prevProps.appSettings.bShowAttachments !==
      this.props.appSettings.bShowAttachments
    ) {
      if (
        this.props.appSettings.bShowAttachments !==
        this.state.showAttachmentsWidget
      ) {
        this.toggleAttachmentsWidget();
      }
    }
  }

  /**
   * Get local actions for assignment
   * @return { Array } Array of local action Dropdown Items
   */
  getLocalActions() {
    return this.props.assignment.actions.map((action) => {
      if (action.type === 'Case') {
        return (
          <Dropdown.Item
            key={action.ID}
            text={action.name}
            onClick={() => this.handleCaseActions(action.ID)}
          />
        );
      } else {
        return null;
      }
    });
  }

  /**
   * Get assignment actions
   * @return { Array } Array of assignmet action Dropdown Items
   */
  getAssignmentActions() {
    let validActions = [];

    if (this.props.assignment) {
      this.props.assignment.actions.forEach((action) => {
        if (
          action.type === 'Assignment' &&
          action.ID !== this.state.currAssignmentAction
        ) {
          validActions.push(
            <Dropdown.Item
              key={action.ID}
              text={action.name}
              onClick={() => this.handleAssignmentActions(action.ID)}
            />
          );
        }
      });
    }

    return validActions;
  }

  /**
   * Gets the fundamental case component.
   * In the event that we have no more assignments, get basic confirm.
   * If we do have an assignment, get the form
   * @return { Object } React element corresponding to case component
   */
  getCaseComponent() {
    return this.getForm();
  }

  /**
   * Helper method to call getForm from reference helper.
   * First set metadata needed in form creation.
   * @return { Object } React elem corresponding to the form
   */
  getForm() {
    const { caseID } = this.props;

    return (
      <PegaForm
        key={caseID}
        caseID={caseID}
        assignment={this.props.assignment}
        currAssignmentAction={this.state.currAssignmentAction}
        page={this.props.page}
        view={this.props.views[caseID]}
        caseView={this.props.caseViews[caseID]}
        header={this.props.viewHeaders[caseID]}
        loading={this.props.loadingStatus[caseID]}
        caseStatus={this.props.case ? this.props.case.status : null}
        etag={this.props.case ? this.props.case.etag : null}
        updateCurrAssignmentAction={(action) =>
          this.updateCurrAssignmentAction(action)
        }
        forceRefresh={this.state.forceRefresh}
        resetForceRefresh={() => this.resetForceRefresh()}
        showAttachmentsWidget={this.state.showAttachmentsWidget}
        validationErrors={this.props.errors.validationErrors[caseID]}
      />
    );
  }

  /**
   * Helper method
   * @param { Object } obj - object to check
   * @return { Bool }
   */
  isObject(obj) {
    return obj === Object(obj);
  }

  /**
   * Handle local actions and change assignment actions for Case.
   * @param { String } action - action to change to, can be local or case action
   */
  handleCaseActions(action) {
    const woID = this.props.caseID;
    this.props.dispatch(
      caseActions.getFieldsForCase(woID, this.props.case, action)
    );
    this.setState({
      currAssignmentAction: action,
    });
  }

  handleAssignmentActions(action) {
    const woID = this.props.caseID;
    this.props.dispatch(
      assignmentActions.getFieldsForAssignment(
        woID,
        this.props.assignment,
        action
      )
    );
    this.setState({
      currAssignmentAction: action,
    });
  }

  /**
   * Update currAssignmentAction in state.
   * This value is shared by the WorkObject and the PegaForm, and can be updated by both.
   * For this reason, we must pass this function as a handler to the PegaForm.
   * @param { String } action - next assignment action to store
   */
  updateCurrAssignmentAction(action) {
    this.setState({
      currAssignmentAction: action,
    });
  }

  /**
   * Perform refresh for the case
   */
  performRefresh() {
    const woID = this.props.caseID;
    this.props.dispatch(caseActions.refreshCase(woID, this.props.caseID));
    this.props
      .dispatch(
        assignmentActions.refreshAssignment(
          woID,
          this.props.assignment.ID,
          this.state.currAssignmentAction
        )
      )
      .then(() => this.setState({ forceRefresh: true }));
  }

  /**
   * Helper method used by the PegaForm instance to reset the force refresh flag.
   */
  resetForceRefresh() {
    this.setState({ forceRefresh: false });
  }

  /**
   * Get page level messages
   * @return { Array } array of react components containing error messages
   */
  getErrors() {
    let validationErrors = this.props.errors.validationErrors;

    if (!validationErrors[this.props.caseID]) {
      return;
    }

    let validationMessages = [];

    validationErrors[this.props.caseID].ValidationMessages.forEach(
      (message, index) => {
        if (!message.Path) {
          validationMessages.push(
            <Message floating negative key={index}>
              <Message.Header>{message.ValidationMessage}</Message.Header>
            </Message>
          );
        }
      }
    );

    return validationMessages;
  }

  /**
   * Get breadcrumb component for case
   * @return { Object } React component for breadcrumb
   */
  getBreadcrumb() {
    if (!this.props.case) {
      return;
    }

    const { stage } = this.props.case;
    const { stages } = this.state;

    return (
      <Breadcrumb size="large">
        {stage
          ? _.flatMap(
              stages.map((aStage) => {
                return (
                  <Breadcrumb.Section
                    key={aStage.ID}
                    link={aStage.ID !== stage}
                    active={aStage.ID === stage}
                  >
                    {aStage.name}
                  </Breadcrumb.Section>
                );
              }),
              (value, index, array) =>
                array.length - 1 !== index
                  ? [
                      value,
                      <Breadcrumb.Divider key={index} icon="right chevron" />,
                    ]
                  : value
            )
          : []}
      </Breadcrumb>
    );
  }

  toggleAttachmentsWidget() {
    this.setState({
      showAttachmentsWidget: !this.state.showAttachmentsWidget,
    });
  }

  render() {
    let assignmentActions = this.getAssignmentActions();

    return (
      <Container fluid>
        {this.props.case && (
          <Menu attached="top">
            <Menu.Item>{this.getBreadcrumb()}</Menu.Item>
            <Menu.Menu position="right">
              {!this.props.page && (
                <>
                  {endpoints.EMBEDCFG.attachAction && (
                    <Menu.Item>
                      <Icon
                        className="widget-card-icon"
                        name="paperclip"
                        size="large"
                        id="attachment-toggle-icon"
                        onClick={() => this.toggleAttachmentsWidget()}
                      />
                    </Menu.Item>
                  )}
                  <Dropdown text="Actions" pointing className="link item">
                    <Dropdown.Menu>
                      <Dropdown.Header
                        icon="briefcase"
                        content="Local Actions"
                      />
                      <Dropdown.Divider />
                      <Dropdown.Item
                        text="Refresh"
                        onClick={() => this.performRefresh()}
                      />
                      {this.getLocalActions()}
                      {assignmentActions.length > 0 && [
                        <Dropdown.Divider key="dividerStart" />,
                        <Dropdown.Header
                          key="assignmentActionHeader"
                          icon="pencil"
                          content="Assignment Actions"
                        />,
                        <Dropdown.Divider key="dividerStop" />,
                        ...assignmentActions,
                      ]}
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}
            </Menu.Menu>
          </Menu>
        )}
        {this.getErrors()}
        {this.getCaseComponent()}
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    views: state.assignments.views,
    viewHeaders: state.assignments.viewHeaders,
    loadingStatus: state.assignments.assignmentLoading,
    pages: state.cases.pages,
    caseViews: state.cases.caseViews,
    errors: state.error,
    appSettings: state.user.appSettings,
  };
}

const connectedWorkObject = connect(mapStateToProps)(WorkObject);
export { connectedWorkObject as WorkObject };
