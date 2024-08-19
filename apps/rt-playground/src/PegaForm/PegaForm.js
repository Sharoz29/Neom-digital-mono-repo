/* eslint no-eval: 0 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Checkbox, Form, Radio } from 'formsy-semantic-ui-react';

import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Label,
  Modal,
  Segment,
  Table,
  Pagination,
  Dropdown,
  Dimmer,
  Loader,
} from 'semantic-ui-react';

import _, { isDate, update } from 'lodash';
import {
  isValid as datefn_isValid,
  format as datefn_format,
  formatDistanceToNow as datefn_fromNow,
  formatISO as datefn_formatISO,
  parseISO as datefn_parseISO,
  parse as datefn_parse,
  quartersToYears,
} from 'date-fns';
import DatePicker from 'react-datepicker';

import { assignmentActions, caseActions } from '../_actions';
import {
  fieldTypes,
  sourceTypes,
  layoutTypes,
  refTypes,
  rowEditingTypes,
  pageNames,
  actionNames,
  iconSources,
  localActionTargets,
  formButtonActionIDs,
  formButtonLabels,
} from '../_constants';
import { DataPageDropdown, PegaAutoComplete } from '../_components';
import { PageInstructions } from '../_helpers/PageInstructions';
import {
  ReferenceHelper,
  htmlDecode,
  getImageInfo,
  isTrue,
  dateToPegaDateValue,
  getPostableFieldsPI,
  axios,
} from '../_helpers';
import { errorActions, alertActions } from '../_actions';
import { AttachContent } from '../_components/AttachContent';
import { AttachmentsWidget } from '../Widgets/AttachmentsWidget';
import { MaskedText } from '../_components/MaskedText';
import { endpoints } from '../_services';
// import { fieldResolver } from '../_helpers/fieldLogic';

// import { locale } from "core-js";

/**
 * Component to handle building forms from Pega layout APIs
 * Can be used to build an entire form, page, or single view.
 */
class PegaForm extends Component {
  /**
   * Constructor stores WorkObject
   * @param { Object } workObject - React component corresponding to the WorkObject
   */
  constructor(props) {
    super(props);

    this.supportedActions = [
      actionNames.POST_VALUE,
      actionNames.SET_VALUE,
      actionNames.REFRESH,
      actionNames.PERFORM_ACTION,
      actionNames.RUN_SCRIPT,
      actionNames.OPEN_URL,
      actionNames.ADD_ROW,
      actionNames.DELETE_ROW,
      actionNames.LOCAL_ACTION,
      actionNames.CANCEL,
      actionNames.OPEN_ASSIGNMENT,
    ];

    // Info stored for each repeating layout (grid/page list) and dynamic layout (page group)
    this.oRepeatLayoutInfo = {};
    // Keep track of whether processing JSON within a grid or repeating dynamic layout
    this.repeatLayoutTypeStack = [];
    // Keeps track of selected reference within a set of Local (or Global) Radio fields
    this.oLocalRadio = {};

    let viewOrPage = props.view ? props.view : props.page;

    this.bLoadingDlgView = false;

    // Using a structure, so this might be passed to AutoComplete and possibly other sub components
    this.refreshInfo = {
      bDoingRefresh: false,
      bWithinRefreshStateUpdate: false,
    };
    // Tried putting pi in state but value is not required for render and delayed state updates were causing issues
    //  with refresh transactions not having the latest info

    this.postableFields = new Set();
    this.changedFields = new Set();

    const appSettings = this.props.appSettings;
    this.pi = new PageInstructions({
      bUseEmbedPI: appSettings.bUseEmbeddedPageInstructions,
      bUseRepeatPI: appSettings.bUseRepeatPageInstructions,
      bOnlyModifiedContent: false,
      postableFields: this.postableFields,
      changedFields: this.changedFields,
    });

    // Used to force adding/removing rows without honoring PI (temporary).  This correlates to passing false to the old bHonorPI argument
    this.postSettingsIgnorePI = {
      bUseEmbedPI: appSettings.bUseEmbeddedPageInstructions,
      bUseRepeatPI: false,
      bOnlyModifiedContent: false,
      postableFields: this.postableFields,
      changedFields: this.changedFields,
    };
    // Used to force use of PI when adding/removing rows
    // Used to force adding/removing rows without honoring PI (temporary).  This correlates to passing false to the old bHonorPI argument
    this.postSettingsHonorPI = {
      bUseEmbedPI: appSettings.bUseEmbeddedPageInstructions,
      bUseRepeatPI: true,
      bOnlyModifiedContent: false,
      postableFields: this.postableFields,
      changedFields: this.changedFields,
    };
    this.bUsingAnyPI =
      appSettings.bUseEmbeddedPageInstructions ||
      appSettings.bUseRepeatPageInstructions;

    // Used to temporarly save & restore state before/after local actions for modal dialog or replace current
    this.localActionInfo = null;
    // Used to keep track of if a change event processed for this assignment
    this.bDirtyFlag = false;
    // formBtnInfo.aBtns is a lookup array of specific actionID values (will be empty when not in screenflow)
    // Used to build up form button info once rather than at each render (seeing 6-7 renders per assignment)
    this.formBtnsInfo = { bScanButtons: true, aBtns: [] };
    // Used for server validations with formsy
    this.formRef = React.createRef();
    // Used to check whether page has close button or not
    this.isCancelButtonPresent = false;

    // openCasesData within assignments state and prop saves all the state data that should be saved for tab transitions
    const caseData =
      props.openCasesData && props.openCasesData[props.caseID]
        ? props.openCasesData[props.caseID]
        : null;

    // To keep track of whether we're at confirm page, this info will be used for disabling 'Delete' buttons within attachments widget on confirm page.
    this.bIsConfirm = false;

    // Note: Explored having an updatedValues entry in state to keep track of just changed fields to be technically more accurate on a PUT, but
    //  this doesn't work well for Pega apps that often have additional properties added to pages via pre/post activities and hence these aren't
    //  part of the page/view and need to be posted back.
    this.state = {
      controls: {},
      values:
        caseData && caseData.values && Object.keys(caseData.values).length !== 0
          ? caseData.values
          : ReferenceHelper.getInitialValuesFromView(viewOrPage).values,
      loadingElems: {},
      validationErrors: this.getValidationErrorsByKey(props.validationErrors),
      processID:
        props.page && props.page.processID ? props.page.processID : null,
      showLocalDialog: false,
      oLocalDialogInfo: null,
      dates: caseData?.dates ? caseData.dates : {},
      gridRuntime: caseData?.gridRuntime ? caseData.gridRuntime : {},
    };
  }

  _fields;

  /**
   * Hooking into lifecycle methods to ensure when getting a new view, we initialize
   * the state of the values object.
   * Also using this hook to ensure validationErrors are stored correctly.
   * Was using componentWillUpdate.  Since this is being deprecated changed to use componentDidUpdate.
   * @param { Object } nextProps
   * @param { Object } nextState
   */
  componentDidUpdate(prevProps, prevState) {
    if (
      !this.props.refreshRequestInProgress &&
      this.refreshInfo.bDoingRefresh &&
      !this.refreshInfo.bWithinRefreshStateUpdate
    ) {
      // Might be trying to reset some values to initial values, so old and new view may be same
      this.refreshInfo.bWithinRefreshStateUpdate = true;
      // New view may be set as part of a submit and new assignment or as part of an explicit refresh operation.  For the
      //  refresh case we want to retain existing state for the values.  Otherwise, if those fields are hidden by a server
      //  side expression, those values will not be returned and will be lost.
      const prevStateValues = { ...this.state.values };
      let updState = ReferenceHelper.getInitialValuesFromView(
        this.props.view,
        this.state
      );
      const newStateValues = { ...updState.values };
      this.postableFields.clear();
      this.changedFields.clear();
      this.updatePageInstructionsWithNewValues(prevStateValues, newStateValues);
      this.setState(
        {
          values: updState.values,
          dates: updState.dates,
        },
        () => {
          this.refreshInfo.bWithinRefreshStateUpdate = false;
        }
      );
    } else if (!_.isEqual(this.props.view, prevProps.view)) {
      // If we have a new view, reinitialize our values
      let updState = ReferenceHelper.getInitialValuesFromView(this.props.view);
      this.setState({
        values: updState.values,
        dates: updState.dates,
      });
    } else if (this.props.page && !prevProps.page) {
      // If we are getting a new page (harness), we may need values from its fields
      let updState = ReferenceHelper.getInitialValuesFromView(this.props.page);
      this.setState({
        values: updState.values,
        dates: updState.dates,
      });
    } else if (this.props.forceRefresh && !prevProps.forceRefresh) {
      // If we have performed a app level case refresh, should we salvage unsaved data or not?
      //  At preent this is not, treating it as same as close the case and reopen it
      this.pi.clearPageInstructions();
      this.bDirtyFlag = false;
      let updState = ReferenceHelper.getInitialValuesFromView(this.props.view);
      this.setState({
        values: updState.values,
        dates: updState.dates,
      });
      this.props.resetForceRefresh();
    } else if (this.bLoadingDlgView && this.props.dlgInfo.view) {
      // Used for local action show dialog as well as for replace current
      this.localActionTriggerDialog();
    }

    if (
      this.props.validationErrors &&
      !_.isEqual(prevProps.validationErrors, this.props.validationErrors)
    ) {
      this.setState({
        validationErrors: this.getValidationErrorsByKey(
          this.props.validationErrors
        ),
      });
    }
  }

  componentWillUnmount() {
    this.props.dispatch(
      assignmentActions.saveCaseData(this.props.caseID, {
        values: this.state.values,
        dates: this.state.dates,
        gridRuntime: this.state.gridRuntime,
      })
    );
  }

  // Error boundary exploration
  componentDidCatch(error, errorInfo) {
    console.log('PageForm: componentDidCatch');
    this.props.dispatch(alertActions.error(error));
  }

  /**
   * This method only looks for prior field values that have been updated or values of newer fields
   * There is currently no comparable method to identify any fields that were present and are now no longer present
   *   as there is no clear page instruction to generated for that scenario
   * @param {Object} prevStateValues
   * @param {Object} newStateValues
   */
  updatePageInstructionsWithNewValues(prevStateValues, newStateValues) {
    for (let key in newStateValues) {
      if (newStateValues[key] !== prevStateValues[key]) {
        let refType = null;
        let oRefInfo = ReferenceHelper.getTargetAndIndex(key);
        if (oRefInfo.index) {
          // The type returned by getTargetAndIndex is likely sufficient, but layoutInfo is supposed to have
          //  the definitive answer...so trying that first
          let oLayout = this.getRepeatLayoutInfo(key);
          refType = oLayout && (oLayout.referenceType || oRefInfo.type);
        }
        if (
          (refType && this.pi.getPostSettings().bUseRepeatPI) ||
          (!refType && this.pi.getPostSettings().bUseEmbedPI)
        ) {
          this.pi.updatePageInstructions(key, newStateValues[key], refType);
        }
      }
    }
  }

  /**
   * Top level method to be called when generating the form.
   * @return { Object } React component for the form
   * Note: The type="button" for non-primary buttons is important if you wanted ENTER key to invoke the primary button click
   */
  getForm() {
    let view =
      this.localActionInfo?.target == localActionTargets.REPLACE_CURRENT
        ? this.props.dlgInfo.view
        : this.props.view;
    let assignmentDetails = this.props.assignmentDetails;
    // Finding navigation property is not there for assignments in non flow processes (actionButtons is)
    // Within actionButtons (primary and secondary groupings), the button label ("name" attribute) was originally missing in 8.5.2
    //  and added in 8.5.3.  Same for presence of save button.
    // This code isn't yet honoring the order or grouping of where the buttons appear in model
    let bScreenFlow =
      this.props.appSettings.bUseScreenFlow &&
      assignmentDetails.navigation !== undefined;
    let formBtnsInfo = this.formBtnsInfo;
    let aStdBtnLabels = formButtonLabels;
    let fnGetLabel = (actionID) => {
      return formBtnsInfo.aBtns[actionID] && formBtnsInfo.aBtns[actionID].name
        ? formBtnsInfo.aBtns[actionID].name
        : aStdBtnLabels[actionID];
    };
    if (bScreenFlow && formBtnsInfo.bScanButtons) {
      // Attempt to minimize scanning thru buttons only when transitioning to a new screen
      // handleCancel and handleSubmit once again set the bScanButtons flag
      formBtnsInfo.aBtns = [];
      if (bScreenFlow) {
        let btnGroups = ['secondary', 'main'];
        btnGroups.forEach((grp) => {
          let aSecButtons = assignmentDetails?.actionButtons?.[grp];
          for (let i = 0; aSecButtons && i < aSecButtons.length; i++) {
            let btnInfo = aSecButtons[i];
            formBtnsInfo.aBtns[btnInfo.actionID] = btnInfo;
          }
        });
        formBtnsInfo.bScanButtons = false;
      }
    }

    let bLastStep = false;
    // "submit" seems to be the actionID used for final step submit.  If there is no label use what we were originally
    //  using...Finish (which allows that to be a different label if desired)
    let sLastStepActionID = formButtonActionIDs.SUBMIT;
    if (bScreenFlow) {
      if (bScreenFlow && assignmentDetails?.navigation.steps) {
        let steps = assignmentDetails.navigation.steps;
        bLastStep = steps[steps.length - 1].visited_status === 'current';
        if (
          !this.formBtnsInfo.aBtns[sLastStepActionID] ||
          !formBtnsInfo.aBtns[sLastStepActionID].name
        ) {
          sLastStepActionID = formButtonActionIDs.FINISH;
        }
      }
    }
    return (
      <Form
        ref={this.formRef}
        onValidSubmit={(model, reset, invalidateForm) =>
          this.handleSubmit(model, reset, invalidateForm)
        }
        loading={this.props.loading}
      >
        <Segment attached="top">
          <Header as="h2" textAlign="center">
            {this.props.header}
          </Header>
        </Segment>

        <Segment attached className={view && this.getFirstLayoutStyle(view)}>
          {view && this.createView(view)}
        </Segment>
        <Segment attached="bottom" style={{ overflow: 'hidden' }}>
          <Button.Group floated="left">
            {((bScreenFlow && formBtnsInfo.aBtns[formButtonActionIDs.CANCEL]) ||
              !bScreenFlow) && (
              <Button
                type="button"
                onClick={(e, data) => this.handleCancel(e, data)}
              >
                {fnGetLabel(formButtonActionIDs.CANCEL)}
              </Button>
            )}
            {bScreenFlow &&
              !this.localActionInfo &&
              formBtnsInfo.aBtns[formButtonActionIDs.BACK] && (
                <Button
                  type="button"
                  onClick={(e, data) =>
                    this.handleBack(
                      e,
                      formBtnsInfo.aBtns[formButtonActionIDs.BACK].links.open
                    )
                  }
                >
                  {fnGetLabel(formButtonActionIDs.BACK)}
                </Button>
              )}
          </Button.Group>
          <Button.Group floated="right">
            {(this.props.appSettings.bSaveButton ||
              formBtnsInfo.aBtns[formButtonActionIDs.SAVE]) &&
              !this.localActionInfo &&
              true /*!bScreenFlow*/ && (
                /* No save button for Replace Current */
                <Button
                  type="button"
                  onClick={(e, data) => this.handleSave(e, data)}
                  disabled={!this.bDirtyFlag}
                >
                  {fnGetLabel(formButtonActionIDs.SAVE)}
                </Button>
              )}
            {bScreenFlow && (
              <Button type="submit" primary>
                {bLastStep
                  ? fnGetLabel(sLastStepActionID)
                  : fnGetLabel(formButtonActionIDs.NEXT)}
              </Button>
            )}
            {!bScreenFlow && (
              <Button type="submit" primary>
                {fnGetLabel(formButtonActionIDs.SUBMIT)}
              </Button>
            )}
          </Button.Group>
        </Segment>
      </Form>
    );
  }

  /**
   * Top level method to call when generating a page. (Pega harness)
   * @return { Object } React component for the page
   */
  getPage() {
    const isNew = this.props.page.name === pageNames.NEW;
    const isConfirm = this.props.page.name === pageNames.CONFIRM;
    this.bIsConfirm = isConfirm;

    return (
      <Form
        ref={this.formRef}
        onValidSubmit={
          isNew
            ? (model, reset, invalidateForm) =>
                this.handleCaseCreate(model, reset, invalidateForm)
            : null
        }
      >
        <Segment attached="top">
          <Header as="h2" textAlign="center">
            {this.props.page.name}
            {isConfirm && (
              <Header.Subheader>
                Status: {this.props.caseStatus}
              </Header.Subheader>
            )}
          </Header>
        </Segment>
        <Segment attached={isNew ? true : 'bottom'}>
          {this.props.page && this.createView(this.props.page)}
        </Segment>
        {isNew && (
          <Segment attached="bottom">
            <Button
              type="button"
              onClick={(e, data) => this.handleCancel(e, data)}
            >
              Cancel
            </Button>
            <Button type="submit" primary floated="right">
              Create
            </Button>
          </Segment>
        )}
        {isConfirm && !this.isCancelButtonPresent && (
          <div className="middle aligned row">
            <Grid centered>
              <Grid.Column textAlign="center">
                <Button
                  primary
                  onClick={(e, data) => this.handleCancel(e, data)}
                >
                  Close
                </Button>
              </Grid.Column>
            </Grid>
          </div>
        )}
      </Form>
    );
  }

  /**
   * Top level method to call when generating a standalone view for case. (Section)
   * @return { Object } React component for the view
   */
  getCaseView() {
    const { caseView } = this.props;

    if (!caseView) {
      return <Segment loading />;
    }

    return (
      <Form>
        <Segment attached="top">
          <Header as="h2" textAlign="center">
            {caseView.name}
          </Header>
        </Segment>
        <Segment attached="bottom">{this.createView(caseView)}</Segment>
      </Form>
    );
  }

  /**
   * Create a view.
   * @param { Object } view - view returned from the API. Can be a nested view.
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component with all the view's children.
   */
  createView(view, index = 0) {
    if (view.visible === false || !view.groups) {
      return null;
    }

    const header = view.title ? (
      <Header as="h3" textAlign="left">
        {htmlDecode(view.title)}
      </Header>
    ) : null;

    return (
      <div key={index}>
        {header}
        {view.groups.map((group, childIndex) => {
          return this.createGroup(group, childIndex);
        })}
      </div>
    );
  }

  /**
   * Create a group.
   * @param { Object } group - Single group returned from API.
   * @param { int } index - index for elem. Needed for unique component keys.
   * @param { boolean } [showLabel=true] - whether to display the label
   * @return { Object } React component with all the group's children.
   */
  createGroup(group, index = 0, showLabel = true) {
    if (group.view) {
      // DigExp app (particularly the Repeats screen) looks bad with these dividers so removing them
      // const incDivider = group.view.visible;
      const incDivider = false;

      return (
        <div key={index}>
          {incDivider && <Divider />}
          {this.createView(group.view, index)}
        </div>
      );
    }

    if (group.layout) {
      return this.createLayout(group.layout, index);
    }

    if (group.paragraph) {
      return this.createParagraph(group.paragraph, index);
    }

    if (group.caption) {
      return this.createCaption(group.caption, index);
    }

    if (group.field) {
      this._fields = this._fields || {};
      this._fields[group.field.fieldID] = group.field;
      return this.createField(group.field, index, showLabel);
    }
  }

  /**
   * Create a layout.
   * @param { Object } layout - Single layout returned from API.
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component with all the layout's children.
   */
  createLayout(layout, index = 0) {
    if (layout.visible === false) {
      return;
    }

    let header = layout.title ? (
      <Header as="h3" textAlign="left">
        {htmlDecode(layout.title)}
      </Header>
    ) : null;

    switch (layout.groupFormat) {
      case layoutTypes.INLINE_GRID_DOUBLE:
        return (
          <div className={this.getLayoutStyle(layout)} key={index}>
            {header}
            <Grid columns={2}>
              <Grid.Row>
                {layout.groups.map((group, childIndex) => {
                  return (
                    <Grid.Column width={8} key={childIndex}>
                      {this.createGroup(group)}
                    </Grid.Column>
                  );
                })}
              </Grid.Row>
            </Grid>
          </div>
        );
      case layoutTypes.INLINE_GRID_TRIPLE:
        return (
          <div className={this.getLayoutStyle(layout)} key={index}>
            {header}
            <Grid columns={3}>
              <Grid.Row>
                {layout.groups.map((group, childIndex) => {
                  return (
                    <Grid.Column key={childIndex}>
                      {this.createGroup(group)}
                    </Grid.Column>
                  );
                })}
              </Grid.Row>
            </Grid>
          </div>
        );
      case layoutTypes.INLINE_GRID_70_30:
      case layoutTypes.INLINE_GRID_30_70:
        let colWidths =
          layout.groupFormat === layoutTypes.INLINE_GRID_70_30
            ? [11, 5]
            : [5, 11];
        return (
          <div className={this.getLayoutStyle(layout)} key={index}>
            {header}
            <Grid columns={2}>
              <Grid.Row>
                {layout.groups.map((group, childIndex) => {
                  return (
                    <Grid.Column width={colWidths[childIndex]} key={childIndex}>
                      {this.createGroup(group)}
                    </Grid.Column>
                  );
                })}
              </Grid.Row>
            </Grid>
          </div>
        );
      case layoutTypes.STACKED:
        return (
          <div className={this.getLayoutStyle(layout)} key={index}>
            {header}
            {layout.groups.map((group, childIndex) => {
              return this.createGroup(group, childIndex);
            })}
          </div>
        );
      case layoutTypes.GRID:
        this.saveRepeatLayoutInfo(layout);
        return (
          <div className={this.getLayoutStyle(layout)} key={index}>
            {header}
            {this.createGrid(layout, index)}
          </div>
        );
      case layoutTypes.DYNAMIC:
        this.saveRepeatLayoutInfo(layout);
        return this.createRDL(header, layout, index);
      default:
        console.log(
          'Unexpected layout type encountered: ' + layout.groupFormat
        );
      // fall thru
      case layoutTypes.DEFAULT:
      case layoutTypes.EMPTY:
      case layoutTypes.MIMIC_A_SENTENCE:
      case layoutTypes.INLINE:
      case layoutTypes.INLINE_MIDDLE:
      case layoutTypes.SIMPLE_LIST:
        /* Will enable the ones below once I see a screen which utilizes these */
        //case layoutTypes.ACTION_AREA:
        //case layoutTypes.SIMPLE_LIST:
        if (layout.groups) {
          return (
            <div className={this.getLayoutStyle(layout)} key={index}>
              {header}
              {layout.groups.map((group, childIndex) => {
                return this.createGroup(group, childIndex);
              })}
            </div>
          );
        }

        if (layout.view) {
          return (
            <div className={this.getLayoutStyle(layout)} key={index}>
              {header}
              {this.createView(layout.view)}
            </div>
          );
        }
        break;
    }
  }

  saveRepeatLayoutInfo(layout) {
    // layout.groupFormat will discern whether this is a Grid or a RDL(Dynamic).
    // RDLs were not returning a reference property prior to recent FUA versions.  Grids
    //  and RDLs both have a fieldListID value.
    // Since there may be both a Grid and a RDL with the same reference, introduced a groupFormat
    //  level of indirection to avoid one wiping out the other.

    // Create substructure of Grid or RDL if doesn't exist (first time it is needed)
    if (!this.oRepeatLayoutInfo[layout.groupFormat]) {
      this.oRepeatLayoutInfo[layout.groupFormat] = {};
    }
    // If reference isn't there, use the relative fieldListID value (which will only be
    //  the relative portion of the full reference) and fix this up when first embedded field is created
    let layoutInfoIndex = layout.reference
      ? layout.reference
      : layout.fieldListID
      ? layout.fieldListID.substring(1)
      : null;
    if (layoutInfoIndex) {
      this.oRepeatLayoutInfo[layout.groupFormat][layoutInfoIndex] = layout;
    }
  }

  // Get back the layout reference given a reference.  However, if there is both a Grid and a RDL with
  //  the same reference, no current way to properly discern which is the proper desired layout.  The
  //  first one found will be used.
  getRepeatLayoutInfo(reference, repeatLayoutType = null) {
    let repeatRef = ReferenceHelper.getRepeatRef(reference);
    if (repeatLayoutType) {
      return this.oRepeatLayoutInfo[repeatLayoutType][repeatRef];
    } else {
      for (let grpFmt in this.oRepeatLayoutInfo) {
        if (this.oRepeatLayoutInfo[grpFmt][repeatRef]) {
          return this.oRepeatLayoutInfo[grpFmt][repeatRef];
        }
      }
    }
    return null;
  }

  // Check layout info structure and make sure the reference is there for RDL
  fixupRDLayoutInfo(reference) {
    let repeatRef = ReferenceHelper.getRepeatRef(reference);
    if (!this.oRepeatLayoutInfo[layoutTypes.DYNAMIC][repeatRef]) {
      let aRefParts = repeatRef.split('.');
      let rdlRef = aRefParts[aRefParts.length - 1];
      if (this.oRepeatLayoutInfo[layoutTypes.DYNAMIC][rdlRef]) {
        this.oRepeatLayoutInfo[layoutTypes.DYNAMIC][repeatRef] =
          this.oRepeatLayoutInfo[layoutTypes.DYNAMIC][rdlRef];
        delete this.oRepeatLayoutInfo[layoutTypes.DYNAMIC][rdlRef];
      }
    }
  }

  /**
   * Get layout style (classname values to be used for groupFormat)
   * @param { layout } layout - Single layout returned from API
   */
  getLayoutStyle(layout) {
    let layoutStyle = '';
    let repeatLayoutStyle = '';

    if (layout && layout.containerFormat) {
      if (layout.containerFormat.toUpperCase() === 'WARNINGS') {
        layoutStyle = 'layout-warning';
      } else if (layout.containerFormat.toUpperCase() === 'ERROR') {
        layoutStyle = 'layout-error';
      }
    }

    if (layout && layout.repeatLayoutFormat) {
      repeatLayoutStyle =
        'pr-layout-' + layout.repeatLayoutFormat.replaceAll(' ', '-');
    }

    return `pr-layout-${layout.groupFormat.replaceAll(
      ' ',
      '-'
    )} ${repeatLayoutStyle} ${layoutStyle}`;
  }

  /**
   * Get First Layout style within view.  Used to propogate up the warning or error style to outer container.
   * @param { layout } view - Single view returned from API.
   */

  getFirstLayoutStyle(view) {
    let layoutStyle = '';
    if (view.groups) {
      for (let i = 0; i < view.groups.length; i++) {
        if (view.groups[i].layout && view.groups[i].layout.visible) {
          layoutStyle = this.getLayoutStyle(view.groups[i].layout);
          break;
        }
      }
    }
    return layoutStyle;
  }

  gridHandlePageSizeChange(e, obj, layout) {
    const gridRuntime = this.state.gridRuntime;
    let runtime = gridRuntime[layout.reference]
      ? gridRuntime[layout.reference]
      : {};
    const pageSize = obj.value;
    runtime.pageSize = pageSize;
    this.setState({
      gridRuntime: {
        ...this.state.gridRuntime,
        [layout.reference]: runtime,
      },
    });
  }

  gridChangePage(e, layout) {
    const gridRuntime = this.state.gridRuntime;
    let runtime = gridRuntime[layout.reference]
      ? gridRuntime[layout.reference]
      : {};
    const activePage = e.target.getAttribute('value');
    runtime.activePage = activePage;
    this.setState({
      gridRuntime: {
        ...this.state.gridRuntime,
        [layout.reference]: runtime,
      },
    });
  }

  /**
   * Create a repeating grid. For PageGroups and PageLists.
   * @param { Object } layout - Single layout returned from API, that contains a grid.
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component with all the grid's children.
   */
  createGrid(layout, index = 0) {
    const reference = layout.reference;

    const actionHandler = (e, data) => this.gridHandleActions(e, data, layout);
    const footerWidth =
      layout.referenceType === refTypes.GROUP
        ? layout.header.groups.length + 1
        : layout.header.groups.length;

    this.repeatLayoutTypeStack.push(layout.groupFormat);

    const fnGetTableSlice = (data, startIndex, endIndex) => {
      let retSlice = [];
      if (data && data.length > 0) {
        retSlice = data.slice(startIndex, endIndex);
      }
      return retSlice;
    };

    // We are storing some additional properties in the layout structure to help with paging state
    //  Perhaps this should be stored in true state instead (might do that when grid is broken out to
    //  a separate true component)
    const activePage = this.state.gridRuntime[layout.reference]?.activePage
      ? this.state.gridRuntime[layout.reference].activePage
      : 1;
    const pageSize = this.state.gridRuntime[layout.reference]?.pageSize
      ? this.state.gridRuntime[layout.reference].pageSize
      : 10;
    const endIndex = activePage * pageSize;
    const startIndex = endIndex - pageSize;
    const data = layout.rows;
    const bEnablePagination = data.length > 5;
    // Note: displayGridFooter is only available when FUA is enabled (Infinity 8.8, 8.7.2, 8.6.5), so the other
    //  criteria checks are important for supporting scenarios where this is not available.
    const bEditRows =
      !(layout.displayGridFooter === false) &&
      layout.repeatRowOperations &&
      layout.repeatRowOperations.rowEditing !== rowEditingTypes.READONLY &&
      layout.readOnly !== true;

    const totalPages = Math.ceil(data.length / pageSize);
    const pageOptions = [
      { key: 5, text: '5', value: 5 },
      { key: 10, text: '10', value: 10 },
      { key: 20, text: '20', value: 20 },
      { key: 30, text: '30', value: 30 },
      { key: 50, text: '50', value: 50 },
    ];

    const rows = bEnablePagination
      ? fnGetTableSlice(data, startIndex, endIndex)
      : data;

    let gridMarkup = (
      <Table compact key={index}>
        <Table.Header className="pr-grid-header">
          <Table.Row className="pr-grid-headerrow">
            {layout.referenceType == 'Group' && (
              <Table.HeaderCell className="pr-gird-headercell"></Table.HeaderCell>
            )}
            {layout.header.groups.map((group, childIndex) => {
              return (
                <Table.HeaderCell
                  key={childIndex}
                  className="pr-grid-headercell"
                >
                  {this.createGroup(group, childIndex)}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row, childIndex) => {
            return (
              <Table.Row key={childIndex} className="pr-grid-row">
                {row.groupIndex && (
                  <Table.Cell className="pr-grid-cell">
                    {row.groupIndex}
                  </Table.Cell>
                )}
                {row.groups.map((group, childIndexB) => {
                  return (
                    <Table.Cell key={childIndexB} className="pr-grid-cell">
                      {this.createGroup(group, childIndexB, false)}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
        {(bEnablePagination || bEditRows) && (
          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan={footerWidth}>
                {bEnablePagination && (
                  <span style={{ paddingRight: '1.5em' }}>
                    <Pagination
                      activePage={activePage}
                      totalPages={totalPages}
                      onPageChange={(e, rows) => this.gridChangePage(e, layout)}
                    />
                  </span>
                )}
                {bEditRows && (
                  <>
                    <Button
                      icon
                      labelPosition="left"
                      primary
                      size="small"
                      onClick={actionHandler}
                      action={'addRow'}
                      reference={reference}
                      referencetype={layout.referenceType}
                      loading={this.state.loadingElems[reference]}
                    >
                      <Icon name="plus" /> Add Row
                    </Button>
                    <Button
                      icon
                      disabled={!layout.rows.length}
                      labelPosition="left"
                      negative
                      size="small"
                      onClick={actionHandler}
                      action={'removeRow'}
                      reference={reference}
                      referencetype={layout.referenceType}
                      loading={this.state.loadingElems[reference]}
                    >
                      <Icon name="minus" /> Delete Row
                    </Button>
                  </>
                )}

                {bEnablePagination && (
                  <>
                    <Dropdown
                      selection
                      floating
                      labeled
                      style={{ float: 'right' }}
                      options={pageOptions}
                      onChange={(e, obj) =>
                        this.gridHandlePageSizeChange(e, obj, layout)
                      }
                      text={pageSize + ' records'}
                    />
                    <label
                      style={{
                        float: 'right',
                        marginTop: '10px',
                        paddingRight: '.5em',
                      }}
                    >
                      Rows per page:
                    </label>
                  </>
                )}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        )}
      </Table>
    );

    this.repeatLayoutTypeStack.pop();

    return gridMarkup;
  }

  /**
   * Create a repeating dynamic layout
   * @param { Object } layout - Single layout returned from API, that contains a grid.
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component with all the RDL's children.
   */
  createRDL(header, layout, index = 0) {
    this.repeatLayoutTypeStack.push(layout.groupFormat);

    let rdlMarkup = (
      <div className={this.getLayoutStyle(layout)} key={index}>
        {header}
        {layout.rows &&
          layout.rows.map((row, childIndex) => {
            if (row.groups) {
              return row.groups.map((group, childIndexB) => {
                return this.createGroup(group, childIndexB);
              });
            }
          })}
      </div>
    );

    this.repeatLayoutTypeStack.pop();

    return rdlMarkup;
  }

  /**
   * Create a paragraph
   * @param { Object } paragraph - Paragraph returned from API
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component corresponding to the paragraph.
   */
  createParagraph(paragraph, index) {
    if (!paragraph.visible) {
      return null;
    }

    return (
      <div key={index} dangerouslySetInnerHTML={{ __html: paragraph.value }} />
    );
  }

  /**
   * Create a caption
   * @param { Object } caption - caption returned from API
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component corresponding to the paragraph.
   */
  createCaption(caption, index) {
    if (caption.visible === false) {
      return;
    }
    return this.getReadOnlyText(htmlDecode(caption.value), '', index);
  }

  /**
   * Create a field.
   * @param { Object } field - Single field returned from API.
   * @param { int } index - index for elem. Needed for unique component keys.
   * @return { Object } React component correpsonding to the field.
   */
  createField(field, index, showLabel) {
    const bottomLabel = <Label color="red" pointing />;
    const rightLabel = <Label color="red" pointing="left" />;
    const msgRequiredInput = 'You must enter a value';
    const msgRequiredOption = 'You must select an option';

    if (field.visible === false) {
      return;
    }

    // Cope with edge condition that field.control doesn't exist (and there is only a validationMessage with an error and a fieldID)
    // field.reference is significant as well
    if (!field.control || !field.reference) {
      if (field.validationMessages) {
        this.props.dispatch(
          errorActions.pegaError(this.props.caseID, field.validationMessages)
        );
        return;
      }
    }

    this.postableFields.add(field.fieldID);

    // If in a repeat construct of type "Dynamic" (RDL), then cope with missing reference (in non-FUA enabled versions of Infinity)
    const repeatLayoutType = this.repeatLayoutTypeStack.length
      ? this.repeatLayoutTypeStack[this.repeatLayoutTypeStack.length - 1]
      : null;
    if (repeatLayoutType === layoutTypes.DYNAMIC && field.reference) {
      this.fixupRDLayoutInfo(field.reference);
    }

    let fieldElem;

    let value = field.reference ? this.state.values[field.reference] : null;
    if (value === undefined || value === null) {
      value = htmlDecode(field.value);
      if (!value) value = '';
    }

    const handleChange = (e, data, callback, field) =>
      this.handleChange(e, data, callback, field);

    // handleEvent doesn't do any filtering of actions based on the current event type, whereas handleNamedEvent does
    let handleEvent = this.generateEventHandler(field);
    // Previously the Dropdown element's onblur handler was using handleEvent.  This causes issues
    let handleNamedEvent = (e, data) => this.generateEventHandler(field, e);

    let required = field.required ? true : false;
    let readOnly = field.readOnly ? true : false;
    let disabled = field.disabled ? true : false;
    const bModesExist = field.control.modes && field.control.modes.length > 0;

    let label = null;

    if (showLabel) {
      if (!field.label && field.labelReserveSpace) {
        label = ' ';
      } else if (field.label) {
        let bStripOuterQuotes = false;
        switch (field.control.type) {
          case fieldTypes.LINK:
          case fieldTypes.CHECKBOX:
          case fieldTypes.BUTTON:
            bStripOuterQuotes = true;
            break;
          default:
            break;
        }
        label = htmlDecode(field.label, bStripOuterQuotes);
      }
    }

    /**
     * Loading direct masked text label when obfuscated is true
     */
    if (
      field?.control?.modes?.length > 1 &&
      field.control.modes[1]?.obfuscated
    ) {
      return <MaskedText field={field} label={label} index={index} />;
    }

    let error = false;
    // Note: some field.control.type values do not start with px
    const fieldClass = 'pr-field-' + field.control.type.replace(/^(px)/, '');

    // field transformer to resolve the customAttributes.fieldLogic
    // fieldResolver(this._fields, field);
    // if (field.hide) {
    //   return null;
    // }

    // Hide and Disable here

    const model = this._fields;
    let _options = [];

    const evalStr = (str) => {
      try {
        return eval(str);
      } catch (error) {
        console.error(`Error evaluating expression: ${str}`, error);
        return null;
      }
    };

    const { customAttributes } = field;
    let fieldLogic = customAttributes?.fieldLogic;
    if (fieldLogic) {
      fieldLogic = JSON.parse(fieldLogic);
      if (fieldLogic) {
        if (evalStr(fieldLogic.hide)) {
          return null;
        }
        if (evalStr(fieldLogic.disabled)) {
          disabled = true;
        }
        // if(!!fieldLogic.data && fieldLogic.data.page) {
        //   let query = evalStr(fieldLogic.data.query);
        //   if (query && query.charAt(query.length - 1) != '=') {
        //     const url = `https://web.pega23.lowcodesol.co.uk/prweb/app/uipoc/api/v1/data/${fieldLogic.data.page}?${query}`;
        //     axios.interceptors.request.use((request) => {
        //       // Add authorization header if set
        //       const authHdr = sessionStorage.getItem("pega_react_user");
        //       if (authHdr) {
        //         request.headers.Authorization = authHdr;
        //       } else {
        //         if (endpoints.use_OAuth) {
        //           // Tried to implement popping up login dialog, but with scenarios where async requests might fire
        //           //  was much easier to leverage the reAuth logic to coordinate this
        //           // Should always have an authHdr (and we keep around expired ones to trigger the reauth logic)
        //           //  If we do fall in here, just cancel, as you are guaranteed to get a 400 failure on server without
        //           //  the Auhtorization header
        //           throw new axios.Cancel("Invalid access token");
        //         }
        //       }
        //       return request;
        //     });

        //       const res = axios
        //       .get(url,{params: {c: 1}}).then(res => {
        //         if(res) {
        //           _options = this.state[field.reference];
        //           const _oldOptions = _options;
        //           const prop = fieldLogic.data.prop;
        //           _options = res.data.pxResults.map(v => ({key: v[prop], text: v[prop], value: v[prop]}));
        //           if (!_.isEqual(_oldOptions, _options)) {
        //             this.setState({[field.fieldId]: _options});
        //           }
        //         }
        //     });
        //   }
        // }
      }
    }

    this.onFocus = (e, data) => {
      console.log('State: ', this.state);
      if (!!fieldLogic?.data && fieldLogic?.data.page) {
        this.setState({
          controls: { ...this.state.controls, [field.fieldID]: [] },
          loadingElems: { ...this.state.loadingElems, [field.fieldID]: true },
        });
        let query = evalStr(fieldLogic.data.query);
        if (query && query.charAt(query.length - 1) != '=') {
          const url = `https://web.pega23.lowcodesol.co.uk/prweb/app/uipoc/api/v1/data/${fieldLogic.data.page}?${query}`;
          axios.interceptors.request.use((request) => {
            // Add authorization header if set
            const authHdr = sessionStorage.getItem('pega_react_user');
            if (authHdr) {
              request.headers.Authorization = authHdr;
            } else {
              if (endpoints.use_OAuth) {
                // Tried to implement popping up login dialog, but with scenarios where async requests might fire
                //  was much easier to leverage the reAuth logic to coordinate this
                // Should always have an authHdr (and we keep around expired ones to trigger the reauth logic)
                //  If we do fall in here, just cancel, as you are guaranteed to get a 400 failure on server without
                //  the Auhtorization header
                throw new axios.Cancel('Invalid access token');
              }
            }
            return request;
          });

          const res = axios
            .get(
              endpoints.API__V1_URL +
                endpoints.DATA +
                '/' +
                fieldLogic.data.page +
                '?' +
                query,
              {
                params: { $c: 1, $f: fieldLogic?.data?.fields?.join(',') },
              }
            )
            .then((res) => {
              if (res) {
                _options = this.state.controls[field.fieldID];
                const _oldOptions = _options;
                const prop = fieldLogic.data.prop;
                // function evalLabel(model){
                //   try {
                //     this = {...this, model};
                //     return evalStr(prop);
                //   } catch (error) {
                //     console.error(`Error evaluating expression: ${model}`, error);
                //     return model[prop];
                //   }
                // }
                _options = res.data.pxResults.map((v) => ({
                  key: v[prop],
                  text: v[prop],
                  value: v[prop],
                }));
                if (!_.isEqual(_oldOptions, _options)) {
                  this.setState({
                    controls: {
                      ...this.state.controls,
                      [field.fieldID]: _options,
                    },
                    loadingElems: {
                      ...this.state.loadingElems,
                      [field.fieldID]: false,
                    },
                  });
                }
              }
            });
        }
      }
    };
    switch (field.control.type) {
      case fieldTypes.CHECKBOX:
        value = field.value === 'true' || value === true;
        if (readOnly) {
          let displayValue = this.getDisplayTextFormattedValue(field);
          fieldElem = this.getReadOnlyText(label, displayValue, index);
        } else if (
          bModesExist &&
          field.control.modes[0].captionPosition === 'left'
        ) {
          /* Note: the onChange handler is causing every other click to be not honored */
          fieldElem = (
            <Form.Field
              key={field.reference}
              required={required}
              disabled={field.disabled}
              error={error}
              reference={field.reference}
              label={field.showLabel ? label : null}
            >
              <label className="pr-leftcb-label" for={field.fieldID}>
                {htmlDecode(field.control.label)}
              </label>
              <Form.Checkbox
                className={`pr-leftcb ${fieldClass}`}
                reference={field.reference}
                repeatlayouttype={repeatLayoutType}
                name={field.reference}
                defaultChecked={value}
                id={field.fieldID}
                onChange={(e, data) => {
                  handleChange(e, data, handleEvent, field);
                }}
                data-test-id={field.testID}
                {...this.getTooltip(field)}
                value={value}
              />
            </Form.Field>
          );
        } else {
          fieldElem = (
            <div>
              <label className="readonlytext-label">
                {field.showLabel && label}
              </label>
              <Form.Checkbox
                key={field.reference}
                required={required}
                disabled={field.disabled}
                error={error}
                className={fieldClass}
                name={field.reference}
                label={htmlDecode(field.control.label)}
                defaultChecked={value}
                onChange={(e, data) => {
                  handleChange(e, data, handleEvent, field);
                }}
                reference={field.reference}
                repeatlayouttype={repeatLayoutType}
                data-test-id={field.testID}
                {...this.getTooltip(field)}
                value={value}
              />
            </div>
          );
        }
        break;
      case fieldTypes.ATTACHCONTENT:
        fieldElem = (
          <AttachContent
            className={fieldClass}
            caseID={this.props.caseID}
            state={this.state.cases?.attachmentDetails || undefined}
            disabled={disabled || readOnly}
            label={htmlDecode(value)}
            value={value}
            reference={field.reference}
            data-test-id={field.testID}
            onChange={(e, data) =>
              this.handleChange(e, data, handleEvent, field)
            }
          />
        );
        break;
      case fieldTypes.RADIOBUTTONS:
        // Radio buttons do not explicitly look at listSources presently.  API should map DP or CP data to local options
        if (readOnly) {
          fieldElem = this.getReadOnlyText(
            label,
            htmlDecode(field.value),
            index
          );
        } else {
          // this is to handle single row selection on the Grid.
          const { customAttributes } = field;
          let formLogic;
          if (customAttributes?.formLogic) {
            try {
              formLogic = JSON.parse(customAttributes.formLogic);
            } catch (error) {
              console.error('Error parsing formLogic', error);
            }

            // Check Logic and return if hide
            if (formLogic && formLogic.hide) {
              if (
                this._fields[formLogic.hide?.prop] &&
                this._fields[formLogic.hide?.prop]['value'] ===
                  formLogic.hide?.value
              ) {
                return null;
              }
            }
          }

          if (
            field.fieldID === 'pySelected' &&
            repeatLayoutType === layoutTypes.GRID
          ) {
            let checked = isTrue(value);
            if (checked) {
              this.setLocalRadioSelectedReference(field.reference);
            }
            fieldElem = (
              <div style={{ padding: '5px' }}>
                <Form.Radio
                  className={fieldClass}
                  key={index}
                  disabled={disabled || readOnly}
                  label={label}
                  value={value}
                  name={field.reference}
                  checked={checked}
                  data-test-id={field.testID}
                  onChange={(e, data) => {
                    data.pegaFieldType = fieldTypes.LOCALRADIO;
                    this.handleChange(e, data, handleEvent, field);
                  }}
                />
              </div>
            );

            break;
          }

          // Semantic Form.Group without grouped attribute seems to do inline
          // Form.Group with grouped seems to misbehave for vertical, so not using it
          let bHoriz = field.control.modes[0].orientation === 'horizontal';

          // When field is configured to use a True-False property the options may attribute may not exist
          let options = bModesExist
            ? field.control.modes[0].options
            : undefined;
          if (options === undefined && field.type === 'True-False') {
            options = [
              { value: 'True', key: 'true' },
              { value: 'False', key: 'false' },
            ];
          }

          const choices = options?.map((option) => {
            // Appears the value might be encoded but not the key when using property type "Prompt list" but both are encoded when
            //  using property type "Local list".  Best to always decode both values
            // On change doesn't seem to be firing for Form.Radio but does for Form.RadioGroup (so it is defined there)
            const decodedKey = htmlDecode(option.key);
            const checked = decodedKey === value;
            return (
              <Form.Radio
                className={fieldClass}
                key={decodedKey}
                disabled={disabled || readOnly}
                label={htmlDecode(option.value)}
                value={decodedKey}
                reference={field.reference}
                repeatlayouttype={repeatLayoutType}
                checked={checked}
                data-test-id={field.testID}
              />
            );
          });

          // Class name is used to bring in some CSS needed to resolve some vertical radio group layout issues on click
          let vertRGClass = !bHoriz ? 'pr-rgvert' : undefined;

          // Semantic seems to not properly validate required radio button groups (but formsy does)
          fieldElem = (
            <Form.RadioGroup
              key={index}
              grouped={!bHoriz}
              name={field.reference}
              required={required}
              disabled={field.disabled}
              error={error}
              label={label}
              reference={field.reference}
              repeatlayouttype={repeatLayoutType}
              {...this.getTooltip(field)}
              errorLabel={bHoriz ? rightLabel : bottomLabel}
              validationError={msgRequiredOption}
              onChange={(e, data) => {
                this.handleChange(e, data, handleEvent, field);
              }}
              value={value}
              className={`${vertRGClass} ${fieldClass}`}
              data-test-id={field.testID}
            >
              {choices}
            </Form.RadioGroup>
          );
        }
        break;
      case fieldTypes.LOCALRADIO:
        // Local Radio buttons don't have options (one use case is selection within a grid row)
        // label is not displayed by pega desktop (web client) (so ignoring it for now)
        // Selecting one radio button within row causes all others to be deselected (using same name value for that)
        //  (Noticed pega desktop has this value set to "LocalRadio" )
        if (readOnly) {
          fieldElem = this.getReadOnlyText(
            label,
            htmlDecode(field.value),
            index
          );
        } else {
          let labelClass =
            'readonlytext-label' + (disabled ? ' disabled field ' : '');
          let checked = isTrue(value);
          if (checked) {
            this.setLocalRadioSelectedReference(field.reference);
          }
          fieldElem = (
            <div style={{ padding: '5px' }}>
              <Form.Radio
                className={fieldClass}
                key={index}
                disabled={disabled || readOnly}
                label={label}
                value={value}
                name={field.reference}
                reference={field.reference}
                repeatlayouttype={repeatLayoutType}
                checked={checked}
                data-test-id={field.testID}
                onChange={(e, data) => {
                  data.pegaFieldType = fieldTypes.LOCALRADIO;
                  this.handleChange(e, data, handleEvent, field);
                }}
              />
            </div>
          );
        }
        break;
      case fieldTypes.AUTOCOMPLETE:
        if (readOnly) {
          fieldElem = this.getReadOnlyText(
            label,
            htmlDecode(field.value),
            index
          );
        } else {
          let mode = bModesExist ? field.control.modes[0] : {};
          let placeholder = mode.placeholder
            ? this.getPropertyValue(mode.placeholder)
            : '';
          // If don't want to use mode.options...null it out.  Using this as a mechanism to always load the DP (rather
          //  than passing in or re-reading the bUseLocalOptionsForDataPage value currently set)
          if (
            (mode.listSource === sourceTypes.DATAPAGE &&
              !this.props.appSettings.bUseLocalOptionsForDataPage) ||
            (mode.listSource === sourceTypes.PAGELIST &&
              !this.props.appSettings.bUseLocalOptionsForClipboardPage)
          ) {
            mode.options = null;
          }
          fieldElem = (
            <PegaAutoComplete
              className={fieldClass}
              key={index}
              mode={mode}
              caseDetail={this.props.caseDetail}
              reference={field.reference}
              repeatlayouttype={repeatLayoutType}
              refreshInfo={this.refreshInfo}
              onChange={(e, data) => this.handleChange(e, data, handleEvent)}
              name={field.reference}
              value={value}
              required={required}
              disabled={disabled || readOnly}
              label={label}
              placeholder={placeholder}
              errorLabel={bottomLabel}
              validationError={msgRequiredInput}
              error={error}
              tooltip={this.getTooltip(field)}
              testid={field.testID}
              customAttributes={field.customAttributes}
            />
          );
        }
        break;
      case fieldTypes.DROPDOWN:
        if (readOnly) {
          let displayValue = this.getDisplayTextFormattedValue(field);
          fieldElem = this.getReadOnlyText(label, displayValue, index);
        } else {
          let control = field.control;
          let mode = bModesExist ? control.modes[0] : {};
          let placeholder = mode.placeholder
            ? this.getPropertyValue(mode.placeholder)
            : '';
          // Was specifying fluid for dropdowns but this causes them sometimes to be the full width of screen
          //  Now can adjust width via pr-field-Dropdown class in styles.css if want to go back to full width
          if (
            mode.listSource === sourceTypes.DATAPAGE &&
            !this.props.appSettings.bUseLocalOptionsForDataPage
          ) {
            fieldElem = (
              <DataPageDropdown
                className={fieldClass}
                key={index}
                placeholder={placeholder}
                labeled
                selection
                search
                clearable
                mode={mode}
                reference={field.reference}
                repeatlayouttype={repeatLayoutType}
                onChange={(e, data) => this.handleChange(e, data, handleEvent)}
                onBlur={handleNamedEvent}
                value={value}
                required={required}
                disabled={field.disabled}
                label={label}
                name={field.reference}
                errorLabel={bottomLabel}
                validationError={msgRequiredOption}
                error={error}
                tooltip={this.getTooltip(field)}
                testid={field.testID}
              />
            );
          } else {
            const options = this.getDropdownOptions(field, []);
            fieldElem = (
              <div key={index}>
                <Form.Dropdown
                  className={fieldClass}
                  required={required}
                  disabled={field.disabled}
                  label={label}
                  name={field.reference}
                  placeholder={placeholder}
                  labeled
                  selection
                  search
                  clearable
                  loading={this.state.loadingElems[field.fieldID]}
                  // onFocus={async (e, data) => {

                  // }}
                  onFocus={this.onFocus}
                  options={
                    options && options.length > 0
                      ? options
                      : this.state.controls[field.fieldID] || []
                  }
                  onChange={(e, data) => {
                    handleChange(e, data, handleEvent);
                  }}
                  lazyLoad
                  noResultsMessage={
                    this.state.loadingElems[field.fieldID]
                      ? 'Loading...'
                      : 'No results found'
                  }
                  onBlur={handleNamedEvent}
                  reference={field.reference}
                  repeatlayouttype={repeatLayoutType}
                  value={value}
                  errorLabel={bottomLabel}
                  validationError={msgRequiredOption}
                  error={error}
                  data-test-id={field.testID}
                  {...this.getTooltip(field)}
                />
              </div>
            );
          }
        }
        ['Pakistan', 'USA'].includes('Pakistan');
        break;
      case fieldTypes.EMAIL:
      case fieldTypes.PHONE:
      case fieldTypes.INTEGER:
      case fieldTypes.NUMBER:
      case fieldTypes.URL:
      case fieldTypes.CURRENCY:
      case fieldTypes.TEXTINPUT:
      case fieldTypes.PASSINPUT:
        if (readOnly) {
          fieldElem = this.getReadOnlyText(
            label,
            htmlDecode(field.value),
            index,
            field
          );
        } else {
          // let isNum =
          //   field.control.type === fieldTypes.INTEGER ||
          //   field.control.type === fieldTypes.NUMBER ||
          //   field.control.type === fieldTypes.CURRENCY;
          let type = this.getFormatType(field);
          // For type==="tel" fields might look at tooltip value and see if it a pattern to try to do
          //  client side validation...but look awkward if we display a tooltip pattern that is different
          //  than the placehoder pattern.  Disabling the tel pattern for now
          // let pattern = type === "tel" ? { pattern: "[0-9]{3}-[0-9]{3}-[0-9]{4}" } : {};
          let pattern = {};
          let mode = bModesExist ? field.control.modes[0] : {};

          // validations and validationErros objects will be passed as a prop to Input element only when specific min/max chars are specified for field
          // + used below as minimal way to convert from string to integer
          let validations = {},
            validationErrors = {};
          if (mode.minChars || mode.maxChars) {
            if (mode.minChars) {
              validations['minLength'] = +mode.minChars;
              validationErrors[
                'minLength'
              ] = `You must enter at least ${mode.minChars} characters`;
            }
            if (mode.maxChars) {
              validations['maxLength'] = +mode.maxChars;
              validationErrors[
                'maxLength'
              ] = `You must enter at most ${mode.maxChars} characters`;
            }
          }

          let placeholder = mode.placeholder
            ? this.getPropertyValue(mode.placeholder)
            : '';
          let telPlaceholder = null;
          if (type === 'tel') {
            telPlaceholder = this.getTooltip(field);
          }
          value = htmlDecode(value);
          fieldElem = (
            <Form.Input
              className={fieldClass}
              key={index}
              required={required}
              disabled={field.disabled}
              name={field.reference}
              type={type}
              fluid
              {...pattern}
              label={label}
              placeholder={
                placeholder
                  ? placeholder
                  : telPlaceholder && telPlaceholder['data-tooltip']
                  ? telPlaceholder['data-tooltip']
                  : ''
              }
              onChange={handleChange}
              onKeyPress={(e) => this.disableEnter(e)}
              onBlur={handleEvent}
              value={value}
              reference={field.reference}
              repeatlayouttype={repeatLayoutType}
              errorLabel={bottomLabel}
              validationError={msgRequiredInput}
              validations={validations}
              validationErrors={validationErrors}
              error={error}
              data-test-id={field.testID}
              {...this.getTooltip(field)}
            />
          );
        }
        break;
      case fieldTypes.TEXTAREA:
        if (readOnly) {
          fieldElem = this.getReadOnlyText(
            label,
            htmlDecode(field.value),
            index
          );
        } else {
          let mode = bModesExist ? field.control.modes[0] : {};
          let placeholder =
            mode && mode.placeholder
              ? this.getPropertyValue(mode.placeholder)
              : '';
          fieldElem = (
            <div key={index} {...this.getTooltip(field)}>
              <Form.TextArea
                className={fieldClass}
                required={required}
                disabled={field.disabled}
                name={field.reference}
                label={label}
                placeholder={placeholder}
                onChange={handleChange}
                onBlur={handleEvent}
                value={value}
                reference={field.reference}
                repeatlayouttype={repeatLayoutType}
                error={error}
                data-test-id={field.testID}
              />
            </div>
          );
        }
        break;
      case fieldTypes.DISPLAYTEXT:
        let displayTextVal = field.value;
        if (field.type === 'Date Time') {
          // displayTextVal.replace("GMT", "+0000"),
          displayTextVal = datefn_fromNow(
            datefn_parseISO(displayTextVal.replace(' GMT', 'Z'))
          );
        } else {
          displayTextVal = this.getDisplayTextFormattedValue(field);
        }
        fieldElem = this.getReadOnlyText(label, displayTextVal, index, field);
        break;
      case fieldTypes.DATETIME:
        if (readOnly) {
          const displayDate = this.getDisplayTextFormattedValue(field);
          fieldElem = this.getReadOnlyText(label, displayDate, index, field);
        } else {
          let mode = bModesExist ? field.control.modes[0] : {};
          let placeholder = mode.placeholder
            ? this.getPropertyValue(mode.placeholder)
            : '';
          let fmtDetails = this.getDatePickerFmtDetails(field);
          let maxDate = null;
          let minDate = null;
          if (!(mode.futureDateRange === '0' && mode.pastDateRange === '0')) {
            // To set maxDate/FutureDateRange for DatePicker
            if (mode.useFutureDateRange) {
              let date = new Date();
              maxDate = date.setFullYear(
                date.getFullYear() + Number(mode.futureDateRange)
              );
            } else if (mode.useFutureDateRange === false) {
              maxDate = new Date();
            }
            // To set minDate/PastDateRange for DatePicker
            if (mode.usePastDateRange) {
              let date = new Date();
              minDate = date.setFullYear(
                date.getFullYear() - Number(mode.pastDateRange)
              );
            } else if (mode.usePastDateRange === false) {
              minDate = new Date();
            }
          }
          // Set date to false when value is not a date so no selected attribute is passed to DatePicker
          let date = false;
          if (!this.state.dates[field.reference]) {
            date = value ? datefn_parseISO(value.replace(' GMT', 'Z')) : false;
            if (date && !datefn_isValid(date)) {
              date = false;
            }
          } else {
            date = this.state.dates[field.reference];
          }

          let handleDateOnChange = (date, e) => {
            // Synthentic "change" (text input) and "click" events are generated (but only when a date changes)
            // e seems to be undefined when selecting a time
            // target.value gets current value
            // Distinguish between clicks and text input
            let bClick = !e || e.type === 'click';
            if (bClick) {
              let obj = {
                name: field.fieldID,
                date: date,
                reference: field.reference,
                repeatlayouttype: repeatLayoutType,
              };
              //console.log("DatePicker(Change-click): %s; date: %s", (datefn_isValid(date) ? datefn_format(date, bIncludeTime ? "M/d/yyyy h:mm a" : "M/d/yyyy") : date), date)
              handleChange(date, obj, handleEvent, field);
            } else {
              let ev = e?.nativeEvent ? e.nativeEvent : e;
              //console.log("DatePicker(Change-change): %s; date: %s", ev ? ev.target.value : ev, date);
            }
          };

          let handleRawChange = (e) => {
            // Synthetic "change" and "click" type events are generated
            let bChange = e?.type === 'change';
            if (bChange) {
              let ev = e.nativeEvent ? e.nativeEvent : e;
              handleChange(ev, ev.target, undefined, field);
              //console.log("DatePicker(ChangeRaw-change):" + e.target.value);
            } else {
              //console.log("DatePicker(ChangeRaw-"+e.type+":" + e.target.value);
            }
          };

          /* Note: Some css styles are specified in index.css to get the 100% width */
          fieldElem = (
            <Form.Input
              key={index}
              className={fieldClass}
              required={required}
              label={label}
              name={field.reference}
              value={value}
              reference={field.reference}
              repeatlayouttype={repeatLayoutType}
              errorLabel={bottomLabel}
              validationError={msgRequiredInput}
              error={error}
              data-test-id={field.testID}
              {...this.getTooltip(field)}
            >
              <div className="ui icon input">
                <DatePicker
                  placeholderText={placeholder}
                  selected={date}
                  onChange={handleDateOnChange}
                  onChangeRaw={handleRawChange}
                  onBlur={(e) => {
                    handleChange(e, e.target, handleEvent, field);
                    //console.log("DatePicker(Blur):" + e.target.value);
                  }}
                  dateFormat={fmtDetails.fmtString}
                  showTimeSelect={fmtDetails.bIncludeTime}
                  showTimeSelectOnly={fmtDetails.bOnlyTime}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  maxDate={maxDate}
                  minDate={minDate}
                  dateFormatCalendar="MMMM"
                />
                <i aria-hidden="true" className="calendar alternate icon"></i>
              </div>
            </Form.Input>
          );
        }
        break;
      case fieldTypes.BUTTON:
        let buttonFormat = this.getButtonFormat(field);
        fieldElem = (
          <Form.Button
            className={fieldClass}
            key={index}
            content={htmlDecode(field.control.label)}
            name={field.reference}
            required={required}
            disabled={readOnly || disabled}
            onClick={handleEvent}
            label={field.showLabel ? label : null}
            reference={field.reference}
            repeatlayouttype={repeatLayoutType}
            data-test-id={field.testID}
            {...this.getTooltip(field)}
            {...buttonFormat}
          />
        );
        break;
      case fieldTypes.LABEL:
        fieldElem = (
          <Label
            key={index}
            size="large"
            data-test-id={field.testID}
            className={fieldClass}
          >
            {label}
          </Label>
        );
        break;
      case fieldTypes.LINK:
        const linkMode = bModesExist ? field.control.modes[0] : {};
        const href = this.getPropertyValue(linkMode.linkData);
        let linkStyle = this.getLinkFormat(field);
        linkStyle['paddingLeft'] = 0;

        // Images can be displayed with class attribute on the <i> tag.  This is what both Pega and Semantic
        //  do.  Problem is mapping the class attributes from pega to meaningufl Semantic values.
        let linkImgInfo = getImageInfo(
          linkMode.linkImageSource,
          linkMode.linkStyle,
          linkMode.linkStandard,
          linkMode.linkImage
        );
        let bLinkOnLeft =
          linkMode.linkImageSource &&
          linkMode.linkImageSource != 'none' &&
          linkMode.linkIconClass != '' &&
          linkMode.linkImagePosition == 'left';
        let bLinkOnRight =
          linkMode.linkImageSource &&
          linkMode.linkImageSource != 'none' &&
          linkMode.linkIconClass != '' &&
          linkMode.linkImagePosition == 'right';
        let link = null;

        if (linkImgInfo.src) {
          link = (
            <img src={linkImgInfo.src.default} alt="Link image from file" />
          );
        } else if (linkImgInfo.class && linkImgInfo.src != '') {
          link = <i className={linkImgInfo.class}></i>;
        } else {
          switch (linkMode.iconSource) {
            case iconSources.EXTERNAL_URL:
              link = (
                <img
                  src={linkMode.iconUrl}
                  alt="Icon from external URL"
                  onClick={handleEvent}
                />
              );
              break;
            case iconSources.PROPERTY:
              link = (
                <img
                  src={this.getPropertyValue(linkMode.linkProperty)}
                  alt="Icon from property"
                  onClick={handleEvent}
                />
              );
              break;
            default:
              break;
          }
        }

        let labelClass =
          'readonlytext-label ' +
          (disabled ? 'disabled field ' : '') +
          fieldClass;
        fieldElem = (
          <div
            key={index}
            style={{ padding: '5px' }}
            data-test-id={field.testID}
          >
            {field.showLabel && <label className={labelClass}>{label}</label>}
            <Label
              as="a"
              className={labelClass}
              style={linkStyle}
              href={href}
              basic
              target="_blank"
              size="large"
              {...this.getTooltip(field)}
              onClick={!href || href === '' ? handleEvent : null}
            >
              {bLinkOnLeft && link}
              {this.getPropertyValue(field.control.label)}
              {<span style={{ paddingLeft: '1em' }} />}
              {bLinkOnRight && link}
            </Label>
          </div>
        );
        break;
      case fieldTypes.ICON:
        const iconMode = bModesExist ? field.control.modes[1] : {};
        let imgInfo = getImageInfo(
          iconMode.iconSource,
          iconMode.iconStyle,
          iconMode.iconStandard,
          iconMode.iconImage
        );
        let icon = null;
        if (imgInfo.src) {
          icon = (
            <img
              src={imgInfo.src.default}
              alt="Icon from file"
              onClick={handleEvent}
            />
          );
        } else if (imgInfo.class && imgInfo.src != '') {
          icon = <i className={imgInfo.class} onClick={handleEvent}></i>;
        } else {
          switch (iconMode.iconSource) {
            case iconSources.EXTERNAL_URL:
              icon = (
                <img
                  src={iconMode.iconUrl}
                  alt="Icon from external URL"
                  onClick={handleEvent}
                />
              );
              break;
            case iconSources.PROPERTY:
              icon = (
                <img
                  src={this.getPropertyValue(iconMode.iconProperty)}
                  alt="Icon from property"
                  onClick={handleEvent}
                />
              );
              break;
            default:
              break;
          }
        }

        fieldElem = (
          <div
            key={index}
            {...this.getTooltip(field)}
            data-test-id={field.testID}
            className={fieldClass}
          >
            {field.showLabel && (
              <label className="readonlytext-label">{label}</label>
            )}
            {icon}
          </div>
        );
        break;
      case fieldTypes.HIDDEN:
        return;
      /*
      case "":
        fieldElem = this.getReadOnlyText(label, htmlDecode(field.value), index);
        break;
 */
      default:
        fieldElem = (
          <Header key={index} as="h4" data-test-id={field.testID}>
            FormElement for '{field.control.type}' is undefined.
          </Header>
        );
        break;
    }

    return fieldElem;
  }

  /**
   * Get input field type
   * @param { field } field
   */

  getFormatType(field) {
    let type;
    if (
      !field ||
      !field.control ||
      !field.control.modes ||
      field.control.modes.length === 0
    ) {
      return 'text';
    }
    let fieldType = field.control.type;
    let formatType = field.control.modes[0].formatType;
    if (fieldType === fieldTypes.EMAIL || formatType === 'email') {
      type = 'email';
    } else if (fieldType === fieldTypes.PHONE || formatType === 'tel') {
      type = 'tel';
    } else if (fieldType === fieldTypes.URL || formatType === 'url') {
      type = 'url';
    } else if (
      fieldType === fieldTypes.INTEGER ||
      fieldType === fieldTypes.CURRENCY ||
      fieldType === fieldTypes.NUMBER ||
      formatType === 'number'
    ) {
      type = 'number';
    } else if (!type) {
      type = 'text';
    }
    if (fieldType === fieldTypes.PASSINPUT) type = 'password';

    return type;
  }

  /**
   * Get read only text given value.
   * Re-usable for ReadOnly elem values, and also for DisplayTexts.
   * @param { String } label
   * @param { String } value
   * @param { int } index - used for key on component, needed for unique React children
   */
  getReadOnlyText(label, value, index, field) {
    let displayValue = value;
    let displayValueClasses = [];
    const fieldClass = 'pr-field-' + field?.control?.type?.replace(/^(px)/, '');
    if (field && field.control.modes && field.control.modes.length > 1) {
      let mode = field.control.modes[1] ? field.control.modes[1] : {};

      switch (mode.formatType) {
        case 'email':
          displayValue = <a href={'mailto:' + value}>{value}</a>;
          break;
        case 'tel':
          displayValue = <a href={'tel:' + value}>{value}</a>;
          break;
        case 'url':
          displayValue = (
            <a
              target={'_blank'}
              href={value.startsWith('http') ? value : 'http://' + value}
            >
              {value}
            </a>
          );
          break;
        default:
          displayValue = this.getDisplayTextFormattedValue(field);
          break;
      }

      switch (mode.textAlign) {
        case 'Right':
          displayValueClasses.push('readonlytext-alignright');
          break;
        default:
          break;
      }
    }

    return (
      <div
        key={index}
        className={`readonlytext ${fieldClass}`}
        data-test-id={field?.testID}
      >
        <label className="readonlytext-label">{label ? label : ''}</label>
        {displayValue && displayValueClasses.length > 0 && (
          <div className={displayValueClasses.join(' ')}>{displayValue}</div>
        )}
        {displayValue && displayValueClasses.length === 0 && (
          <>{displayValue}</>
        )}
      </div>
    );
  }

  getDisplayTextFormattedValue(field) {
    let returnValue = field.value;
    if (field && field.control.modes.length > 0 && field.value) {
      let mode = field.control.modes[1];
      if (!mode) {
        return returnValue;
      }
      // For some set of fields check the options and make sure we get the "prompt (displayed) value"
      switch (field.control.type) {
        case fieldTypes.DROPDOWN:
          let mode0 = field?.control?.modes[0];
          if (mode0 && mode0.options) {
            let found = mode0.options.find(
              (element) => element.key === field.value
            );
            if (found) {
              returnValue = found.value;
            }
          }
          break;
        default:
          break;
      }
      if (
        (mode.dateFormat && mode.dateFormat.match(/Date-/)) ||
        (mode.dateTimeFormat && mode.dateTimeFormat.match(/DateTime-/))
      ) {
        if (returnValue.includes('GMT')) {
          // field.value = field.value.replace("GMT", "+0000");
          field.value = field.value.replace(' GMT', 'Z');
        }
        returnValue = this.generateDate(
          field.value,
          mode.dateTimeFormat ? mode.dateTimeFormat : mode.dateFormat
        );
      } else if (mode.formatType === 'number') {
        let decimalPlaces = mode.decimalPlaces;
        if (!decimalPlaces) decimalPlaces = 2;

        /**
         * conditions to consider when decimal places are auto ("-999")
         * If there are no decimal values for example; value is 70, the decimal places are 0. Just displays as 70.
         * If the value is 70.xx or 70.xxx (two or three decimal places), it displays the same manner.
         * If there are more than 3, it rounds to 3 decimal values
         *  */
        if (decimalPlaces == -999) {
          const decimals = returnValue.toString().split('.')[1];
          decimalPlaces = decimals
            ? decimals.length > 3
              ? 3
              : decimals.length
            : 0;
        }

        let options = {
          minimumFractionDigits: decimalPlaces,
        };
        if (mode.numberSymbol === 'currency')
          options = {
            ...options,
            ...this.getCurrencyFormatOptions(mode),
          };
        returnValue = Number(returnValue).toLocaleString(undefined, options);
      } else if (
        mode.formatType === 'text' &&
        (mode.autoAppend || mode.autoPrepend)
      ) {
        returnValue = mode.autoPrepend
          ? mode.autoPrepend + returnValue
          : returnValue;
        returnValue = mode.autoAppend
          ? returnValue + mode.autoAppend
          : returnValue;
      } else if (mode.formatType === 'truefalse') {
        returnValue = returnValue === 'true' ? mode.trueLabel : mode.falseLabel;
      } else if (mode.formatType === 'email') {
      } else if (mode.formatType === 'tel') {
        returnValue = this.generatePhoneNumber(htmlDecode(field.value));
      } else if (mode.formatType === 'url') {
        //console.log("mode.formatType=url encountered");
      } else if (mode.formatType === 'advancedtext') {
      } else {
      }
    }
    returnValue = htmlDecode(returnValue);
    return returnValue;
  }

  getCurrencyFormatOptions(mode) {
    // ignoring most of the settings, but you get the idea
    let locale = navigator.language;
    let sCurrency = 'USD';
    switch (locale) {
      case 'en-US':
      case 'es-US':
        sCurrency = 'USD';
        break;
      case 'en-CA':
      case 'fr-CA':
        sCurrency = 'CAD';
        break;
      case 'fr-FR':
      case 'es-ES':
      case 'de-DE':
        sCurrency = 'EUR';
        break;
      case 'en-GB':
        sCurrency = 'GBP';
        break;
      default:
        break;
    }

    let sDisplay = mode.currencySymbol;
    switch (sDisplay) {
      case 'currencySymbol':
        sDisplay = 'symbol';
        break;
      case 'currencyCode':
        sDisplay = 'code';
        break;
      case 'currencyName':
        sDisplay = 'name';
        break;
      default:
        break;
    }

    let props = {
      style: 'currency',
      currency: sCurrency,
      currencyDisplay: sDisplay,
    };

    return props;
  }

  generatePhoneNumber(sNum) {
    let locale = navigator.language;
    switch (locale) {
      case 'en-US':
      case 'es-US':
      case 'en-CA':
      case 'es-MX':
        let formattedNum = '';
        let phoneLen = sNum.length;
        if (phoneLen === 11) {
          formattedNum = sNum.substring(0, 1) + '-';
          sNum = sNum.substring(1);
        }
        if (sNum.length === 10) {
          formattedNum +=
            sNum.substring(0, 3) +
            '-' +
            sNum.substring(3, 6) +
            '-' +
            sNum.substring(6);
          sNum = formattedNum;
        }
        break;
      default:
        break;
    }

    return sNum;
  }

  /* Map from Pega datetime formats to DatePicker ones */
  getDatePickerFmtDetails(field) {
    let sReturnFmt = null;

    // dateTime might also have the value "auto", "dateTime", "date" and "time"
    // For "auto" look at modes[1].dateFormat and see if string is Date-* or DateTime-*
    const bModesExist = field.control.modes && field.control.modes.length > 0;
    let modes0 = bModesExist ? field.control.modes[0] : {};
    let modes1 = bModesExist ? field.control.modes[1] : {};
    let bIncludeTime =
      (!bModesExist && field.type !== 'Date') ||
      (bModesExist &&
        (modes0.dateTime === 'dateTime' ||
          modes0.dateTime === 'time' ||
          (modes0.dateTime === 'auto' &&
            modes1.dateFormat &&
            -1 != modes1.dateFormat.indexOf('Time-'))));
    let bOnlyTime =
      (!bModesExist && field.type === 'Time') ||
      (bModesExist && modes0.dateTime === 'time');
    let sDefaultDateFormat = 'Date-Short-YYYY';
    let dateFormat =
      !bIncludeTime && bModesExist && modes1.dateFormat
        ? modes1.dateFormat
        : bModesExist && modes1.dateTimeFormat
        ? modes1.dateTimeFormat
        : bModesExist && modes1.dateFormat
        ? modes1.dateFormat
        : sDefaultDateFormat;

    // Allows for special casing formats that can't just be handed as same Datefns format
    if (!bIncludeTime && dateFormat.match(/DateTime-/)) {
      dateFormat = dateFormat.replace('DateTime-', 'Date-');
    } else if (bIncludeTime && dateFormat.match(/Date-/)) {
      dateFormat = dateFormat.replace('Date-', 'DateTime-');
    }
    switch (dateFormat) {
      default:
        sReturnFmt = this.getDatefnFmtString(dateFormat);
    }
    return {
      fmtString: sReturnFmt,
      bIncludeTime: bIncludeTime,
      bOnlyTime: bOnlyTime,
    };
  }

  /* Map from Pega datetime formats to datefns ones */
  getDatefnFmtString(dateFormat) {
    let sReturnFmt = null;
    switch (dateFormat) {
      case 'Date-Short':
        // 1/1/01
        sReturnFmt = 'M/d/yy';
        break;
      case 'Date-Short-YYYY':
        // 1/1/2001
        sReturnFmt = 'M/d/yyyy';
        break;
      case 'Date-Short-Custom':
        // 01/01/01
        sReturnFmt = 'MM/dd/yy';
        break;
      case 'Date-Short-Custom-YYYY':
        // 01/01/2001
        sReturnFmt = 'P';
        break;
      case 'Date-Medium':
        // Jan 1, 2001
        sReturnFmt = 'PP';
        break;
      case 'Date-DayMonthYear-Custom':
        // 01-Jan-2001
        sReturnFmt = 'dd-MMM-yyyy';
        break;
      case 'Date-Full':
        // Monday, January 1, 2001
        sReturnFmt = 'eeee, MMMM d, yyyy';
        break;
      case 'Date-Long':
        // January 1, 2001
        sReturnFmt = 'MMMM d, yyyy';
        break;
      case 'Date-ISO-8601':
        // 2001/01/01 y/m/d
        sReturnFmt = 'yyyy/MM/dd';
        break;
      case 'Date-Gregorian-1':
        // 01 January, 2001
        sReturnFmt = 'dd MMMM, yyyy';
        break;
      case 'Date-Gregorian-2':
        // January 01, 2001
        sReturnFmt = 'MMMM dd, yyyy';
        break;
      case 'Date-Gregorian-3':
        // 2001, January 01
        sReturnFmt = 'yyyy, MMMM dd';
        break;
      case 'DateTime-Short':
      case 'DateTime-Frame-Short':
        // 1/1/01 1:00 AM
        sReturnFmt = 'M/d/yy h:mm a';
        break;
      case 'DateTime-Short-Custom':
        // 01/01/01 01:00 AM
        sReturnFmt = 'MM/dd/yy hh:mm a';
        break;
      case 'DateTime-Short-YYYY-Custom':
        sReturnFmt = 'M/d/yyyy hh:mm a';
        break;
      case 'DateTime-Short-YYYY':
        // 1/1/2001 1:00 AM
        sReturnFmt = 'M/d/yyyy h:mm a';
        break;
      case 'DateTime-Medium':
        // Jan 1, 2001 1:00:00 AM
        sReturnFmt = 'MMM d, yyyy h:mm:ss a';
        break;
      case 'DateTime-Long':
      case 'DateTime-Frame':
      case 'DateTime-Custom':
        // January 1, 2001 1:00:00 AM
        sReturnFmt = 'MMMM d, yyyy h:mm:ss a';
        break;
      case 'DateTime-DayMonthYear-Custom':
        // 01-Jan-2001 1:00:00 AM
        sReturnFmt = 'dd-MMM-yyyy h:mm:ss a';
        break;
      case 'DateTime-Full':
        // Monday, January 1, 2001 1:00 AM EDT
        sReturnFmt = 'dddd, MMMM d, yyyy h:mm a z';
        break;
      case 'DateTime-ISO-8601':
        // 2001/01/01 1:00:00 AM     y/m/d
        sReturnFmt = 'yyyy/MM/dd h:mm:ss a';
        break;
      case 'DateTime-Gregorian-1':
        // 01 January, 2001 1:00:00 AM
        sReturnFmt = 'dd MMMM, yyyy h:mm:ss a';
        break;
      case 'DateTime-Gregorian-2':
        // January 01, 2001 01:00:00 AM
        sReturnFmt = 'MMMM dd, yyyy hh:mm:ss a';
        break;
      case 'DateTime-Gregorian-3':
        // 2001, January 01 1:00:00 AM
        sReturnFmt = 'yyyy, MMMM dd h:mm:ss a';
        break;
      default:
        break;
    }
    return sReturnFmt;
  }

  generateDate(dateVal, dateFormat) {
    let sReturnDate = dateVal;
    let date = datefn_parseISO(sReturnDate.replace(' GMT', 'Z'));

    switch (dateFormat) {
      case 'DateTime-Frame':
      case 'DateTime-Frame-Short':
        // 2 days, 5 hours ago
        sReturnDate = datefn_fromNow(date);
        break;
      default:
        sReturnDate = datefn_format(date, this.getDatefnFmtString(dateFormat));
    }

    return sReturnDate;
  }

  /**
   * Get control format for a button
   * @param { field }
   */
  getButtonFormat(field) {
    let buttonFormat = {};
    if (
      field &&
      field.control &&
      field.control.modes &&
      field.control.modes.length > 1
    ) {
      let format = field.control.modes[1].controlFormat;
      if (format) {
        format = format.toUpperCase();
        if (format !== 'STANDARD' && format !== 'PZHC') {
          if (format === 'STRONG') buttonFormat.primary = true;
          else if (format === 'LIGHT') {
            buttonFormat.basic = true;
          } else if (format === 'RED') buttonFormat.color = 'red';
        }
      }
    }
    return buttonFormat;
  }

  /**
   * Get control format for a link
   * @param { field }
   */

  getLinkFormat(field) {
    let linkFormat = { border: 0 };
    if (
      field &&
      field.control &&
      field.control.modes &&
      field.control.modes.length > 1
    ) {
      let format = field.control.modes[1].controlFormat;
      if (format) {
        format = format.toUpperCase();
        if (format === 'STRONG') linkFormat.fontWeight = 'bolder';
        else if (format === 'LIGHT') {
          linkFormat.fontWeight = 'lighter';
          linkFormat.color = 'lightgray';
        } else if (format === 'STANDARD' && format === 'PZHC')
          linkFormat.fontWeight = 'normal';
        else if (format === 'RED') linkFormat.color = 'red';
        // else if (format === 'LIST LINK') linkFormat.color = 'red';
      }
    }
    return linkFormat;
  }

  /**
   * Get tooltip for a field
   * @param { field }
   */

  getTooltip(field) {
    let tooltip = {};
    if (
      field &&
      field.control &&
      field.control.modes &&
      field.control.modes.length > 1
    ) {
      if (
        field.control.type === fieldTypes.BUTTON ||
        field.control.type === fieldTypes.LINK ||
        field.control.type === fieldTypes.ICON
      ) {
        if (field.control.modes[1].tooltip) {
          tooltip['data-tooltip'] = htmlDecode(field.control.modes[1].tooltip);
        }
      } else {
        if (field.control.modes[0].tooltip) {
          tooltip['data-tooltip'] = htmlDecode(field.control.modes[0].tooltip);
        }
      }
      // To test if tooltip refers to a property and fetch the corresponding value if that is the case
      if (tooltip['data-tooltip']) {
        tooltip['data-tooltip'] = this.getPropertyValue(
          tooltip['data-tooltip']
        );
      }
    }
    return tooltip;
  }

  /**
   * Get dropdown options from a clipboard page
   * @param { field }
   */

  getDropdownOptions(field, options = []) {
    if (options && options.length > 0) return options;

    if (!field) return options;
    let control = field.control;
    let mode = control.modes[0];
    if (!mode) return options;

    if (
      mode &&
      mode.listSource === sourceTypes.PAGELIST &&
      !this.props.appSettings.bUseLocalOptionsForClipboardPage
    ) {
      let pageId = field.control.modes[0].clipboardPageID;
      let clipboardPagePrompt = field.control.modes[0].clipboardPagePrompt;
      let clipboardPageValue = field.control.modes[0].clipboardPageValue;
      if (pageId && clipboardPagePrompt && clipboardPageValue) {
        let optionsPage = this.props.caseDetail.content[pageId];
        if (optionsPage && optionsPage.length > 0) {
          options = optionsPage.map((item) => {
            return {
              key: item[clipboardPageValue],
              text: item[clipboardPagePrompt],
              value: item[clipboardPageValue],
            };
          });
        }
      }
    } else {
      // This is the typical sourceTypes.LOCALLIST path
      if (mode.options) {
        options = mode.options.map((option) => {
          // Finding option.value may be encoded when using property of type "Prompt list".  However, when using property of
          // type "Local list", the key is also encoded.
          let decodedKey = htmlDecode(option.key);
          return {
            key: decodedKey,
            text: htmlDecode(option.value),
            value: decodedKey,
          };
        });
      }
    }
    return options;
  }

  /* Get and Set local (or global) radio checked reference.  Those within a repeat target are considered a set as are ones on the outer form.
   */
  getLocalRadioSelectedReference(reference) {
    const oRefInfo = ReferenceHelper.getTargetAndIndex(reference);
    const sCheckedRef =
      this.oLocalRadio[oRefInfo.index ? oRefInfo.target : '$root$'];
    return sCheckedRef;
  }

  setLocalRadioSelectedReference(reference) {
    const oRefInfo = ReferenceHelper.getTargetAndIndex(reference);
    if (oRefInfo.target) {
      this.oLocalRadio[oRefInfo.index ? oRefInfo.target : '$root$'] = reference;
    }
  }

  createEventHandler(actionHandlers) {
    let eventHandler = (e, data) => {
      // This e.preventDefault is important to have things like alert actions not submit the form (and advance the stage) when
      //  they are dismissed.  However, it also intereferes with proper checkbox control event handling--both click (or left
      //  label checkboxes) and space bar press selection for both.
      if (
        e?.preventDefault &&
        !(
          data &&
          (data.type === 'checkbox' ||
            (data.type == 'radio' &&
              data.pegaFieldType === fieldTypes.LOCALRADIO))
        )
      ) {
        e.preventDefault();
      }

      actionHandlers.reduce((promise, item) => {
        return promise.then((d) => {
          item.handler.call(this, e, data, item.data, item.refreshFor);
          // The below was needed to fix a flash that occurs on a refresh (BUG-686045)
          this.formRef?.current?.setFormPristine(true);
        });
      }, Promise.resolve());
    };
    return eventHandler;
  }

  /**
   * Helper function to generate an event handler function.
   * This is to support multiple actions attached to the same element;.
   * Returns a function to be called on field blur / click / etc.
   * DOES NOT UPDATE STATE.
   * @param { Object } field - field object from the API
   * @param { Object } [e=null] - event argument (if specified) will result in checking the event type and only returning actions relevant for that type of event
   * @return { func } function to handle events
   */
  generateEventHandler(field, e = null) {
    let actionData = this.getActionData(field, this.supportedActions, e);
    // let eventHandler = (e, data) => {
    //   e.preventDefault();
    // };

    // Mark if we have already included a refresh, so we don't do duplicates
    let hasFieldRefresh = false;

    // Mark if we have both a refresh and a setValue
    // setValue using setState won't update date before the POST if we do not handle it separately
    let dataForSetValueAndRefresh =
      this.getDataForSetValueAndRefresh(actionData);

    let actionsList = [];

    // We are going to append together each function, startin with the base handler that does a preventDefault().
    for (let i = 0; i < actionData.length; i++) {
      switch (actionData[i].action) {
        case actionNames.SET_VALUE:
          if (!dataForSetValueAndRefresh) {
            actionsList.push({
              handler: this.handleSetValue,
              data: actionData[i].actionProcess,
            });
          }
          break;

        case actionNames.POST_VALUE:
          // For POST_VALUE it should effectively be a NOOP as value is updated just in local state and no refresh
          //  transaction is generated.  In Pega Desktop this is primarily used to update a value within stateful
          //  clipboard
          if (!hasFieldRefresh) {
            actionsList.push({ handler: this.handleFieldRefresh });
            hasFieldRefresh = true;
          }
          break;

        case actionNames.REFRESH:
          if (!hasFieldRefresh) {
            actionsList.push({
              handler: this.handleFieldRefresh,
              data: dataForSetValueAndRefresh,
              refreshFor: actionData[i],
            });
            hasFieldRefresh = true;
          }
          break;
        case actionNames.PERFORM_ACTION:
          actionsList.push({
            handler: this.handlePerformAction,
            data: actionData[i].actionProcess,
          });
          break;
        case actionNames.RUN_SCRIPT:
          actionsList.push({
            handler: this.handleRunScript,
            data: actionData[i].actionProcess,
          });
          break;
        case actionNames.OPEN_URL:
          actionsList.push({
            handler: this.handleOpenUrl,
            data: actionData[i].actionProcess,
          });
          break;
        case actionNames.ADD_ROW:
          actionsList.push({
            handler: this.handleAddRow,
            data: { actionReference: field.reference },
          });
          break;
        case actionNames.DELETE_ROW:
          actionsList.push({
            handler: this.handleDeleteRow,
            data: { actionReference: field.reference },
          });
          break;
        case actionNames.LOCAL_ACTION:
          actionsList.push({
            handler: this.handleLocalAction,
            data: actionData[i].actionProcess,
          });
          break;
        case actionNames.CANCEL:
          this.isCancelButtonPresent = true;
          actionsList.push({
            handler: this.handleCancel,
          });
          break;
        case actionNames.OPEN_ASSIGNMENT:
          actionsList.push({
            handler: this.handleOpenAssignment,
            data: actionData[i].actionProcess,
          });
          break;
        default:
          break;
      }
    }
    return this.createEventHandler(actionsList);
    // return eventHandler;
  }

  /**
   * This is to check if the elem has both a set value and refresh.
   * Must handle simultaneous setValue + refresh carefully, as using setState to update the target
   * of setValue won't update the data before the POST.
   * Does not currently support multiple DIFFERENT setValue actions, but will support multiple
   * values that are set under a single action.
   * @param { Object } actionData - object of actionData attached to field.
   * @return { Object } setValueData if field has refresh AND setValue, null otherwise.
   */
  getDataForSetValueAndRefresh(actionData) {
    let hasRefresh = false;
    let hasSetValue = false;
    let setValueData = null;

    for (let i = 0; i < actionData.length; i++) {
      if (actionData[i].action == actionNames.SET_VALUE) {
        hasSetValue = true;
        setValueData = actionData[i].actionProcess;
      }

      if (actionData[i].action == actionNames.REFRESH) {
        hasRefresh = true;
      }
    }

    if (hasRefresh && hasSetValue) {
      return setValueData;
    }

    return null;
  }

  /**
   * Generic way to check over actionSets.
   * Returns all actions/events that match one of the targetActions.
   * Returns empty array if none found.
   * @param { Object } field - field object from the API
   * @param { Array } targetActions - array of strings, actions to target
   * @param { Object } [e=null] - optional event to use to filter results to only be ones specified for this event
   * @return { Array } array of target actions if found, otherwise empty array.
   */
  getActionData(field, targetActions, e = null) {
    let result = [];

    if (field.control && field.control.actionSets) {
      let actionSets = field.control.actionSets;

      for (let i = 0; i < actionSets.length; i++) {
        // If we see one of the target actions, return that action
        let actions = actionSets[i].actions;
        let events = actionSets[i].events;

        for (let j = 0; j < events.length; j++) {
          if (!e || events[j].event == e.type) {
            for (let k = 0; k < actions.length; k++) {
              if (
                targetActions.some(
                  (targetAction) => targetAction === actions[k].action
                )
              ) {
                result.push({ ...actions[k], events: events });
              }
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Generic way to check over actionSets.
   * Returns the first action OR event that matches one of the targetActions or targetEvents.
   * Returns null if none found.
   * @param { Object } field - field object from the API
   * @param { Array } targetActions - array of strings, actions to target
   * @param { Array } targetEvents - array of strings, events to target
   * @return { Object } target action or event if found, otherwise null
   */
  actionSetChecker(field, targetActions, targetEvents) {
    if (field.control && field.control.actionSets) {
      let actionSets = field.control.actionSets;

      for (let i = 0; i < actionSets.length; i++) {
        // If we see one of the target actions, return that action
        let actions = actionSets[i].actions;
        for (let j = 0; j < actions.length; j++) {
          if (
            targetActions.some(
              (targetAction) => targetAction === actions[j].action
            )
          ) {
            return actions[j];
          }
        }

        // If we see one of the target event, return that event
        let events = actionSets[i].events;
        for (let j = 0; j < events.length; j++) {
          if (
            targetEvents.some((targetEvent) => targetEvent === events[j].event)
          ) {
            return events[j];
          }
        }
      }
    }

    return null;
  }

  /**
   * Helper function to expand relative path to fully qualified path.
   * Needed for storing correct values on state, and POSTing values to server.
   * e.g. converts ".Address(1).FirstName" to "Address(1).FirstName"
   * @param { String } relPath - relative path to expand to full path
   */
  expandRelativePath(relPath) {
    if (relPath.charAt(0) === '.') {
      return relPath.substring(1);
    }

    return relPath;
  }

  /**
   * Helper function to translate Pega string / bool / property reference to desired value.
   * If we receiving a direct string value from Pega, it will be enclosed in quotes.
   * If we recieve a property reference path, we want the actual value of the property.
   * If we receive a number, we want numerical type, not a string.
   * If we receive a bool in string form, we want a bool returned.
   * e.g. "\"I am a sample string\"" yields "I am a sample string"
   *      OR true yields true
   *      OR ".FirstName" yields actual value of FirstName property
   * @param { String / Bool } property - desired property to get value of
   * @return { String / Int / Bool } value of property, depending on contents
   */
  getPropertyValue(property, valueReference) {
    // If the property is a bool, return it directly
    if (typeof property === 'boolean') {
      return property;
    }

    // Decode the property value first (and strip any outer quotes)
    property = htmlDecode(property, true);

    let value = undefined;
    // If the property starts with a . character, then convert it to full path and get its value
    if (property.charAt(0) === '.' && this.state?.values) {
      // if property is part of a field with reference
      value = this.state.values[this.expandRelativePath(property)];
    }

    // if the property is part of case details
    if (value === undefined) {
      value =
        this.props.caseDetail?.content?.[this.expandRelativePath(property)];
    }

    // If valueReference structure is passed in, then this value may be a reference without the leading ".", and otherwise,
    //  use the last saved value
    if (valueReference && value === undefined) {
      value = this.state.values[this.expandRelativePath(property)];

      if (value === undefined && valueReference.lastSavedValue) {
        value = htmlDecode(valueReference.lastSavedValue);
      }
    }

    // The property format was unhandled, return it directly
    if (value === undefined) value = property;
    return value;
  }

  /**
   * Disable the ENTER key so that it doesn't invoke a defined onClick handler for the submit button (or the first button).
   *  If you really want to have the ENTER key within input fields to lead to submit, unwire this handler
   */
  disableEnter(e) {
    if (e.which === 13) {
      e.preventDefault();
    }
  }

  /**
   * This section includes functions that handle updating state for the PegaForm component.
   * Data is maintained on state on the PegaForm.
   */

  /**
   * Handle change for field. Update state correspondingly.
   * Can handle input, checkboxes, dropdowns, and date times.
   * @param { Object } e - synthetic event
   * @param { Object } data - typically form element that called handler
   * @param { Func } callback - callback to be called after setState completes
   * @param { Object } field - DX API field structure (will be there for DateTime...not yet for all)
   */
  handleChange(e, obj, callback = null, field) {
    let value = null;
    let date = null;
    let bDateCleared = false;
    let sPriorSetLocalRadioRef = null;

    if (field && field.control?.type == fieldTypes.DATETIME) {
      let fmtDetails = this.getDatePickerFmtDetails(field);
      let fmtDateTime = !fmtDetails.bIncludeTime
        ? 'date'
        : fmtDetails.bOnlyTime
        ? 'time'
        : 'dateTime';

      if (e && isDate(e) && datefn_isValid(e)) {
        date = e;
        // Handle date time
        // Convert JS Date object value to Pega expected date value
        value = dateToPegaDateValue(e, fmtDateTime);
        // Set e to null for now (so we don't confuse this for an event when callback might be invoked.
        //  Perhaps generate a new Event if important to distinguish which action sets are run based on event being handled
        //  since we are not doing that yet.)
        e = null;
        //console.log("handleChange: e is valid date");
      } else if (obj?.date && isDate(obj.date) && datefn_isValid(obj.date)) {
        value = dateToPegaDateValue(obj.date, fmtDateTime);
        //console.log("handleChange: obj.date is valid date");
      } else if (e && obj?.value) {
        value = obj.value;
        //console.log("handleChange: using obj.value");
      } else if (e?.target) {
        value = e.target.value;
        //console.log("handleChange: using e.target.value");
      } else {
        // Date was cleared so null date
        value = '';
        bDateCleared = true;
        //console.log("handleChange: emptying value");
      }
      if (!date && value) {
        // parse the value and see if it is a legit date...if so, update the date in state
        let dateVal = datefn_parse(value, fmtDetails.fmtString, new Date());
        if (dateVal && datefn_isValid(dateVal)) {
          date = dateVal;
        }
      }
    } else {
      if (!obj) {
        if (e.target) {
          obj = e.target;
        }
        if (!obj) {
          return;
        }
      }
      // Handle inputs for checkboxes and local radio buttons and pySelected radio button (but exclude regular radio buttons)
      if (
        field &&
        (field.control?.type === fieldTypes.CHECKBOX ||
          field.control?.type === fieldTypes.LOCALRADIO ||
          (field.control?.type === fieldTypes.RADIOBUTTONS &&
            field.fieldID === 'pySelected'))
      ) {
        if (
          (field.control.type === fieldTypes.LOCALRADIO ||
            field.fieldID === 'pySelected') &&
          obj.checked
        ) {
          // If setting a new radio button, make sure the prior selected value is now false
          const sCheckedRef = this.getLocalRadioSelectedReference(
            field.reference
          );
          if (sCheckedRef && field.reference != sCheckedRef) {
            sPriorSetLocalRadioRef = sCheckedRef;
            this.setLocalRadioSelectedReference(field.reference);
          }
        }
        // use "true" or "false" (string values)
        value = obj.checked ? 'true' : 'false';
      } else {
        if (e.target && e.target.classList) {
          e.target.classList.add('field');
        }
        value = obj.value;
      }
    }

    // Make sure we have a reference attribute on the obj else create a new obj
    // (DateTime synthetic events may not have a reference but should have passed in a field)
    if (field) {
      if (!obj.name) {
        obj.name = field.fieldID;
      }
      if (!obj.reference) {
        obj.reference = field.reference;
      }
    }

    let callbackFunc = null;
    if (callback) {
      if (e?.persist) e.persist();
      callbackFunc = () => {
        callback(e, obj);
      };
    }
    // Set flag indicating a change has been made
    this.bDirtyFlag = true;

    if (obj?.reference) {
      const nLastDot = obj.reference.lastIndexOf('.');
      const sFieldRef = obj.reference.substring(nLastDot + 1);
      this.changedFields.add(sFieldRef);
    }

    // Calc page instruction updates (if enabled),  Only update one or the other per change
    let bUpdatedPI = false;

    if (this.bUsingAnyPI) {
      // Determine if this is a repeating reference (has an index), and if so grab the referenceType
      let refType = null;
      let oRefInfo = ReferenceHelper.getTargetAndIndex(obj.reference);
      if (oRefInfo.index) {
        // The type returned by getTargetAndIndex is likely sufficient, but layoutInfo is supposed to have
        //  the definitive answer...so trying that first
        let oLayout = this.getRepeatLayoutInfo(
          obj.reference,
          obj.repeatlayouttype
        );
        refType =
          oLayout && oLayout.referenceType
            ? oLayout.referenceType
            : oRefInfo.type;
      }

      const sRef = obj.reference;
      if (this.pi.getPostSettings().bUseRepeatPI) {
        if (
          (refType != null && refType == refTypes.LIST) ||
          refType == refTypes.GROUP
        ) {
          // ignore ALL, because APPEND and INSERT are taken care of in repeating grid
          if (sRef != 'ALL') {
            this.pi.updatePageInstructionState(sRef, value, refType);
          }
          bUpdatedPI = true;
        } else if (sRef.indexOf('(') >= 0) {
          // is a page list/group
          this.pi.updatePageInstructionState(sRef, value, refType);
          bUpdatedPI = true;
        }
      }
      if (this.pi.getPostSettings().bUseEmbedPI) {
        if (refType == null && sRef.indexOf('.') > 0) {
          this.pi.updateEmbeddedPageInstructionState(sRef, value);
          bUpdatedPI = true;
        }
      }
    }
    // Store new values and also keep track of updated values for any future PUT calls (performRefreshOnAssignment)

    this._fields[obj.reference] = this._fields[obj.reference] || {};
    this._fields[obj.reference]['value'] = value;

    const updatedFields = Object.keys(this._fields).reduce(
      (prev, key) => ({
        ...prev,
        [key]: this._fields[key]['value'],
      }),
      {}
    );
    let updatedState = {
      values: {
        ...this.state.values,
        ...updatedFields,
        [obj.reference]: value,
      },
      dates: {
        ...this.state.dates,
      },
    };
    if (date || bDateCleared) {
      updatedState.dates[obj.reference] = date;
    }
    if (sPriorSetLocalRadioRef) {
      updatedState.values[sPriorSetLocalRadioRef] = '';
    }
    this.setState(updatedState, callbackFunc);
  }

  /**
   * Invoke assignments refresh
   * @param {Object} postContent
   * @param {Object} oActionData
   * @param {Object} postSettings - Settings related to pageInstructions and content
   */
  gridRefreshView(postContent, oActionData, postSettings) {
    let sRefreshFor = '';
    if (postContent == null) {
      postContent = {};
    }

    if (oActionData) {
      if (oActionData.refreshFor) {
        sRefreshFor = oAction.refreshFor;
      }
    }

    let currentAction = this.localActionInfo
      ? this.localActionInfo.assignmentAction
      : this.props.currAssignmentAction;

    this.setState({
      loadingElems: {
        ...this.state.loadingElems,
        [oActionData.layoutData.reference]: true,
      },
    });

    // Set flag so we know to keep prior field values (to cope with server not returning us these values because they now are hidden)
    this.refreshInfo.bDoingRefresh = true;
    const woID = this.props.caseID;
    this.props
      .dispatch(
        assignmentActions.performRefreshOnAssignment(
          woID,
          this.props.caseID,
          this.props.assignment.ID,
          currentAction,
          postContent,
          postSettings.bUseRepeatPI ? this.pi.getPageInstructions() : null
        )
      )
      .then(() => {
        this.setState({
          loadingElems: {
            ...this.state.loadingElems,
            [oActionData.layoutData.reference]: false,
          },
        });
      })
      .finally(() => {
        this.refreshInfo.bDoingRefresh = false;
      });
  }

  /**
   * Method used to invoke the refresh endpoint related to adding/removing rows
   *
   * @param {*} sAction - Action to execute
   * @param {*} oActionData - data for layout
   * @param {*} postSettings - whether to use Page intructions or not with the transaction
   */
  refreshAssignmentActions(sAction, oActionData, postSettings) {
    switch (sAction) {
      case 'addRow':
        // Don't strip out the content when adding row
        let postContentAdd = ReferenceHelper.getPostContent(
          this.state.values,
          postSettings
        );
        if (!postSettings.bUseRepeatPI) {
          // This is only significant if not using Page Instructions to append/insert a row
          let targetAdd = ReferenceHelper.getRepeatFromReference(
            oActionData.layoutData.reference,
            oActionData.layoutData.referenceType,
            postContentAdd
          );
          if (oActionData.layoutData.referenceType === 'List') {
            targetAdd.push(ReferenceHelper.getBlankRowForRepeat(targetAdd));
          } else {
            // group
            if (oActionData.rowName === null || oActionData.rowName === '') {
              return;
            }
            targetAdd[oActionData.rowName] = {};
          }
        }

        this.gridRefreshView(postContentAdd, oActionData, postSettings);

        break;
      case 'removeRow':
        let postContentRemove = ReferenceHelper.getPostContent(
          this.state.values,
          postSettings
        );

        if (!postSettings.bUseRepeatPI) {
          // This is only significant if not using Page Instructions to remove a row
          let targetRemove = ReferenceHelper.getRepeatFromReference(
            oActionData.layoutData.reference,
            oActionData.layoutData.referenceType,
            postContentRemove
          );

          if (oActionData.layoutData.referenceType === 'List') {
            if (targetRemove.length > 1) {
              targetRemove.pop();
              // check targetRemove
              var foo = 0;
            } else {
              // get a clear row
              let blankRow = ReferenceHelper.getBlankRowForRepeat(targetRemove);
              /*
              targetRemove.pop();
              targetRemove.push(blankRow);
              */
            }
          } else {
            // group
            if (oActionData.rowName === null || oActionData.rowName === '') {
              return;
            }

            if (targetRemove[oActionData.rowName]) {
              delete targetRemove[oActionData.rowName];
            }
          }
        }

        this.gridRefreshView(postContentRemove, oActionData, postSettings);

        break;
    }
  }

  /**
   *
   * @param {Object} oAction
   * @param {String} rowRef
   * @param {String} groupRowRef
   * @param {Boolean} bAppend
   * @returns
   */
  addRowAction(layout, rowRef, groupRowRef = null, bAppend = false) {
    // TODO remove this if we can get code to now always do a refresh to work
    let bForceRefreshOnRowUpdates = true;

    let sCompareRef = ReferenceHelper.getRepeatRef(rowRef);

    let sRowEditing = 'row';
    if (layout.repeatRowOperations && layout.repeatRowOperations.rowEditing) {
      sRowEditing = layout.repeatRowOperations.rowEditing;
    }

    if (sRowEditing === rowEditingTypes.READONLY) {
      return;
    }

    let sRef = layout.reference;

    if (sCompareRef != sRef) {
      return;
    }

    let sRefType = layout.referenceType;
    let sRowIndex = rowRef.substring(
      rowRef.lastIndexOf('(') + 1,
      rowRef.lastIndexOf(')')
    );
    let bUseNewRow = this.props.appSettings.bUseRepeatPageInstructions;
    let bUseRepeatPageInstructions =
      this.props.appSettings.bUseRepeatPageInstructions;

    if (!bUseNewRow) {
      return;
    }

    if (sRefType == 'List') {
      // pageList
      if (sRowIndex === '<APPEND>') {
        sRowIndex = layout.rows.length.toString();
      }
      let rowIndex = parseInt(sRowIndex);
      let rowRefName = rowRef.substring(0, rowRef.lastIndexOf('('));
      let sRowRef = rowRef.substring(0, rowRef.lastIndexOf(')') + 1);

      if (rowRefName == sRef) {
        let addRowNum = rowIndex; // already 1 greater, since 1 based, but array is 0 based

        // copy
        let addRowJSON = JSON.stringify(layout.newRow);
        let addRow = JSON.parse(addRowJSON);
        let sIndexPrefix = sRef;
        if (sIndexPrefix.indexOf('.') >= 0) {
          sIndexPrefix = sIndexPrefix.substring(
            sIndexPrefix.lastIndexOf('.') + 1
          );
        }

        // template newRow is (listIndex) for pageList
        let sRefToken = addRow.listIndex;

        if (bAppend) {
          rowIndex++;
        }

        let sNewRef = rowRefName
          .concat('(')
          .concat(rowIndex.toString())
          .concat(')');
        addRowJSON = ReferenceHelper.replaceReferenceJSON(
          addRowJSON,
          sRefToken,
          rowIndex.toString()
        );
        addRow = JSON.parse(addRowJSON);

        // remove listIndex
        delete addRow.listIndex;

        layout.rows.splice(rowIndex - 1, 0, addRow);

        // update rows array and state field values
        let fldValues = {
          ...this.state.values,
        };
        ReferenceHelper.updateRowsWithNewReferenceFrom(
          layout.rows,
          rowIndex,
          rowRefName,
          fldValues,
          true
        );
        // ReferenceHelper.processLayout(layout, fldValues);
        if (!bForceRefreshOnRowUpdates) {
          // TODO: Consider setting bDoingRefresh to trigger reloading (to fix no refresh mode
          //this.refreshInfo.bDoingRefresh = true;
        }

        if (bUseRepeatPageInstructions) {
          if (bAppend) {
            this.pi.updateGridPI(
              sRefType,
              'APPEND',
              sRef,
              rowIndex.toString(),
              {}
            );
          } else {
            this.pi.updateGridPI(
              sRefType,
              'INSERT',
              sRef,
              rowIndex.toString(),
              {}
            );
          }
        }

        this.pi.updatePageInstructions('ALL', null, sRefType);

        this.setState({
          values: fldValues,
        });
      }
    } else {
      // pageGroup

      // sRowIndex will be a string
      // TODO: Should this be setting groupRowRef to sRowIndex?
      let rowRefName = rowRef.substring(0, rowRef.lastIndexOf('('));

      let bGotGoodIndex = !!groupRowRef;
      while (!bGotGoodIndex) {
        groupRowRef = prompt(
          'Enter a unique alphanumeric row name which does not begin with a numeric character',
          ''
        );
        if (null === groupRowRef) {
          // Cancel
          break;
        }
        // Checking row name validity (Unique alphanumeric values starting with an alphabet are allowed)
        else if (groupRowRef !== '' && /^[a-z]+[a-z0-9]*$/i.test(groupRowRef)) {
          bGotGoodIndex = !layout.rows.find(
            (row) => row.groupIndex === groupRowRef
          );
        }
      }
      if (!bGotGoodIndex) {
        return;
      }

      if (rowRefName == sRef) {
        // template newRow is (groupIndex) for pageGroup
        let addRow = JSON.parse(JSON.stringify(layout.newRow));
        let sOldRef = rowRefName.concat('(' + addRow.groupIndex + ')');
        let sNewRef = sOldRef.replace(addRow.groupIndex, groupRowRef);

        // update rows array and state field values
        let fldValues = {
          ...this.state.values,
        };
        ReferenceHelper.replaceReference(
          addRow,
          'groups',
          sOldRef,
          sNewRef,
          fldValues,
          groupRowRef
        );

        addRow.groupIndex = groupRowRef;

        layout.rows.splice(layout.rows.length, 0, addRow);

        if (bUseRepeatPageInstructions) {
          this.pi.updateGridPI(sRefType, 'ADD', sRef, groupRowRef, {});
        }

        this.pi.updatePageInstructions('ALL', null, sRefType);

        this.setState({
          values: fldValues,
        });
      }
    }
  }
  /**
   *
   *
   * @param {Object} oAction
   * @param {String} rowRef
   * @param {String} [groupRowRef=""]
   * @returns
   * @memberof PegaForm
   */
  deleteRowAction(layout, rowRef, groupRowRef = '') {
    let sRowEditing = 'row';
    if (layout.repeatRowOperations && layout.repeatRowOperations.rowEditing) {
      sRowEditing = layout.repeatRowOperations.rowEditing;
    }

    // Other rowEditing values seen are "row" and "masterDetail"
    if (sRowEditing === rowEditingTypes.READONLY) {
      return;
    }

    let sCompareRef = ReferenceHelper.getRepeatRef(rowRef);

    let sRef = layout.reference;
    if (sCompareRef != sRef) {
      return;
    }

    let sRefType = layout.referenceType;
    let sRowIndex = rowRef.substring(
      rowRef.lastIndexOf('(') + 1,
      rowRef.lastIndexOf(')')
    );
    let bUseNewRow = this.props.appSettings.bUseRepeatPageInstructions;
    let bUseRepeatPageInstructions =
      this.props.appSettings.bUseRepeatPageInstructions;

    if (!bUseNewRow) {
      return;
    }

    if (sRefType == 'List') {
      if (sRowIndex === '<LAST>') {
        sRowIndex = layout.rows.length.toString();
      }
      let rowIndex = parseInt(sRowIndex);
      let rowRefName = rowRef.substring(0, rowRef.lastIndexOf('('));

      if (rowRefName == sRef) {
        // ref is 1 based, but array is 0 based
        let deleteRowNum = rowIndex - 1;
        let priorLastRow = layout.rows.length; // 1-based offset of last row
        if (layout.rows.length > deleteRowNum) {
          layout.rows.splice(deleteRowNum, 1);
        }

        // Update layout rows array and field values
        let fldValues = {
          ...this.state.values,
        };
        ReferenceHelper.updateRowsWithNewReferenceFrom(
          layout.rows,
          deleteRowNum,
          rowRefName,
          fldValues,
          false
        );
        let priorLastRowRef = rowRefName
          .concat('(')
          .concat(priorLastRow.toString())
          .concat(')');
        for (const key in fldValues) {
          if (0 == key.indexOf(priorLastRowRef)) {
            delete fldValues[key];
          }
        }
        this.setState({
          values: fldValues,
        });

        if (bUseRepeatPageInstructions) {
          this.pi.updateGridPI(
            sRefType,
            'DELETE',
            sRef,
            rowIndex.toString(),
            {}
          );
        }

        this.pi.updatePageInstructions('ALL', null, sRefType);
      }
    } else {
      // group
      let rowRefName = rowRef.substring(0, rowRef.lastIndexOf('('));

      if (rowRefName == sRef) {
        // going to have to iterate through list of rows, see if have it, get index
        let deleteRowIndex = ReferenceHelper.findIndexOfRow(
          layout.rows,
          rowRef
        );
        if (deleteRowIndex >= 0) {
          layout.rows.splice(deleteRowIndex, 1);
        }
        // Update field values
        let fldValues = {
          ...this.state.values,
        };
        for (const key in fldValues) {
          if (0 == key.indexOf(rowRefName)) {
            delete fldValues[key];
          }
        }
        this.setState({
          values: fldValues,
        });

        if (bUseRepeatPageInstructions) {
          this.pi.updateGridPI(sRefType, 'DELETE', sRef, groupRowRef, {});
        }

        this.pi.updatePageInstructions('ALL', null, sRefType);
      }
    }
  }

  /** Invoked from repeating grid bottom buttons
   * sAction {String} - addNow or removeRow
   */
  addRemoveRow(sAction, layout) {
    // TODO - Might remove logic related to setting this to true once the false path is fully tested
    // Not sure if the !bUseNewRow paths should also be bounded on this same flag or not
    let bForceRefreshOnRowUpdates = true;

    let bAdd = sAction == 'addRow';
    let sRowEditing = 'row';
    if (layout.repeatRowOperations && layout.repeatRowOperations.rowEditing) {
      sRowEditing = layout.repeatRowOperations.rowEditing;
    }

    if (sRowEditing !== rowEditingTypes.READONLY) {
      let bUseNewRow = this.props.appSettings.bUseRepeatPageInstructions;
      if (layout.referenceType === 'List') {
        // list
        // check if have "newRow", if so, use that method
        if (bUseNewRow) {
          let sRef = layout.reference.concat(bAdd ? '(<APPEND>)' : '(<LAST>)');
          if (bAdd) {
            this.addRowAction(layout, sRef, null, true);
          } else {
            this.deleteRowAction(layout, sRef);
          }

          if (bForceRefreshOnRowUpdates) {
            let rowData = { rowNum: '', layoutData: layout };
            this.refreshAssignmentActions(
              sAction,
              rowData,
              this.pi.getPostSettings()
            );
          }
        } else {
          if (bForceRefreshOnRowUpdates) {
            let rowData = { rowNum: '', layoutData: layout };
            this.refreshAssignmentActions(
              sAction,
              rowData,
              this.postSettingsIgnorePI
            );
          }
        }
      } else {
        // group
        let bGotGoodIndex = false;
        let rowName = '';

        while (!bGotGoodIndex) {
          rowName = prompt(
            bAdd
              ? 'Enter a unique alphanumeric row name which does not begin with a numeric character'
              : 'Enter an existing alphanumeric row name which does not begin with a numeric character',
            ''
          );
          if (null === rowName) {
            break;
          }
          // Checking row name validity (Unique alphanumeric values starting with an alphabet are allowed)
          else if (rowName !== '' && /^[a-z]+[a-z0-9]*$/i.test(rowName)) {
            if (bAdd) {
              bGotGoodIndex = !layout.rows.find(
                (row) => row.groupIndex === rowName
              );
            } else {
              bGotGoodIndex = layout.rows.find(
                (row) => row.groupIndex === rowName
              );
            }
          }
        }

        if (!bGotGoodIndex) {
          // Don't go any further if didn't specify a good group index
          return;
        }

        // check if have "newRow", if so, use that method
        if (bUseNewRow) {
          let sRef = layout.reference.concat('(' + rowName + ')');
          if (bAdd) {
            this.addRowAction(layout, sRef, rowName);
          } else {
            this.deleteRowAction(layout, sRef, rowName);
          }

          if (bForceRefreshOnRowUpdates) {
            let groupData = { rowName: rowName, layoutData: layout };
            this.refreshAssignmentActions(
              sAction,
              groupData,
              this.pi.getPostSettings()
            );
          }
        } else {
          if (bForceRefreshOnRowUpdates) {
            let groupData = { rowName: rowName, layoutData: layout };
            this.refreshAssignmentActions(
              sAction,
              groupData,
              this.postSettingsIgnorePI
            );
          }
        }
      }
    }
  }

  /**
   * Repeating Grid action handler
   * @param { Object } e - synthetic event
   * @param { Object } data - form element that called handler
   * @param { Object } layout
   */
  gridHandleActions(e, data, layout) {
    e.preventDefault();

    this.addRemoveRow(data.action, layout);
  }

  /**
   * This section handle actions attached to fields.
   *
   */

  /**
   * Method to handle field refresh. This is only triggered when we want to
   * send data to the server.
   * In the event that there are setValues connected to this refresh, we must directly
   * set those values in this method.
   * @param { Object } e - synthetic event
   * @param { Object } data - data representing the field that is triggering refresh
   * @param { Object } actionProcess - object with information about setValuePairs, if needed
   */
  handleFieldRefresh(e, data, actionProcess, refreshForData) {
    if (!this.props.assignment) {
      return;
    }

    this.postableFields.clear();
    this.changedFields.clear();

    let currentAction = this.localActionInfo
      ? this.localActionInfo.assignmentAction
      : this.props.currAssignmentAction;
    let postContent = ReferenceHelper.getPostContent(
      this.state.values,
      this.pi.getPostSettings()
    );
    // If we have setValues connected to this refresh, ensure the values are set before the POST
    // This is needed because setState is async, and calling it would not update the values in time
    if (actionProcess && actionProcess.setValuePairs) {
      actionProcess.setValuePairs.forEach((pair) => {
        // The paths attached to setvaluepairs include relative references.
        // Must make them absolute to be handled by ReferenceHelper.addEntry()
        let val;
        if (pair.valueReference) {
          val = this.getPropertyValue(
            pair.valueReference.reference,
            pair.valueReference
          );
          ReferenceHelper.addEntry(
            this.expandRelativePath(pair.name),
            val,
            postContent
          );
        } else {
          let fullPath = this.expandRelativePath(pair.name);
          val = this.getPropertyValue(pair.value);
          ReferenceHelper.addEntry(fullPath, val, postContent);
        }
      });
    }

    if (refreshForData && refreshForData.refreshFor) {
      ReferenceHelper.addEntry(
        'refreshFor',
        refreshForData.refreshFor,
        postContent
      );
    }

    // Set flag so we know to keep prior field values (to cope with server not returning us these values)
    this.refreshInfo.bDoingRefresh = true;

    const woID = this.props.caseID;
    return this.props
      .dispatch(
        assignmentActions.performRefreshOnAssignment(
          woID,
          this.props.caseID,
          this.props.assignment.ID,
          currentAction,
          postContent,
          this.bUsingAnyPI ? this.pi.getPageInstructions() : null
        )
      )
      .finally(() => {
        this.refreshInfo.bDoingRefresh = false;
      });
  }

  /**
   * Method to handle setValue for fields. This is only triggered when a setValue event
   * is found WITHOUT a refresh (which would POST the value).
   * setValue with refresh must happen simultaneously via handleFieldRefresh, as setState is async.
   * @param { Object } e - synthetic event
   * @param { Object } data - data representing the field that was blurred
   * @param { Object } actionProcess - object with information about setValuePairs
   */
  handleSetValue(e, data, actionProcess) {
    let newValues = Object.assign({}, this.state.values);

    actionProcess.setValuePairs.forEach((pair) => {
      // The paths attached to setvaluepairs include relative references.
      // Must make them absolute to be handled by ReferenceHelper.addEntry()
      if (pair.valueReference) {
        let val = this.getPropertyValue(
          pair.valueReference.reference,
          pair.valueReference
        );
        ReferenceHelper.addEntry(
          this.expandRelativePath(pair.valueReference.reference),
          val,
          newValues
        );
      } else {
        newValues[this.expandRelativePath(pair.name)] = this.getPropertyValue(
          pair.value
        );
      }
    });

    this.setState({
      values: newValues,
    });
  }

  // Dialog to support the localActions dialog example
  localActionDialog(index) {
    let bExists = this.state.oLocalDialogInfo != null;
    return (
      <Modal open={this.state.showLocalDialog} key={index}>
        <Modal.Header>
          {bExists && this.state.oLocalDialogInfo.name}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Segment attached="top"></Segment>
            <Segment attached="bottom">
              {bExists && this.createView(this.state.oLocalDialogInfo.view)}
            </Segment>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => {
              this.localActionEnd();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.localActionEnd(false);
              //Refresh happens within localActionEnd now
              //this.handleFieldRefresh();
            }}
            positive
          >
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  getDialogView(action) {
    //this.props.updateCurrAssignmentAction(sAction);

    const woID = this.props.caseID;
    this.props.dispatch(
      assignmentActions.getFieldsForAssignment(
        woID,
        this.props.assignment,
        action,
        true
      )
    );
    this.bLoadingDlgView = true;
    // Processing will continue in componentDidUpdate when the update to props.dlgInfo is detected
  }

  localActionTriggerDialog() {
    // view response is in state which is mapped to props (dlgInfo)
    this.bLoadingDlgView = false;

    switch (this.localActionInfo.target) {
      case localActionTargets.MODAL_DIALOG:
        let localView = ReferenceHelper.updateViewWithLocalState(
          this.props.dlgInfo.view,
          this.state.values
        );
        this.setState({
          showLocalDialog: true,
          oLocalDialogInfo: {
            view: localView,
            name: this.props.dlgInfo.name,
            // headers: response.headers,
            // action: this.props.dlgInfo.action,
            // assignmentID: this.props.assignment.ID
          },
        });
        break;
      case localActionTargets.REPLACE_CURRENT:
        ReferenceHelper.updateViewWithLocalState(
          this.props.dlgInfo.view,
          this.state.values
        );
        this.handleFieldRefresh();
        break;
      default:
        break;
    }
  }

  // Invoked from both PerformAction as well as LocalAction(s)
  takeAction(sAction) {
    // Try to move this to just perform action (and not replace current)
    //this.props.updateCurrAssignmentAction(sAction);

    const woID = this.props.caseID;
    // TODO: Perhaps need to update actions menu with latest actions?  Figure out whether to do that within a then clause...
    //  and then return the response
    this.props.dispatch(
      assignmentActions.getFieldsForAssignment(
        woID,
        this.props.assignment,
        sAction,
        this.localActionInfo ? true : false
      )
    );

    if (this.localActionInfo) {
      this.bLoadingDlgView = true;
      // Processing will continue in componentDidUpdate when the update to props.dlgInfo is detected
    }
  }

  /**
   * Method to handle PerformAction action. This is triggered when the event is seen.
   * @param { Object } e - synthetic event
   * @param { Object } data - data represneting the field that the perform action was triggered on
   * @param { Object } actionProcess - object with information about performAction
   */
  handlePerformAction(e, data, actionProcess) {
    this.props.updateCurrAssignmentAction(actionProcess.actionName);
    return this.takeAction(actionProcess.actionName);
  }

  /**
   * Method to handle RunScript action. This is triggered when the event is seen.
   * @param { Object } e - synthetic event
   * @param { Object } data - data representing the field that the perform action was triggered on
   * @param { Object } actionProcess - object with information about script to run
   */
  handleRunScript(e, data, actionProcess) {
    let evalString = actionProcess.functionName + '(';

    if (actionProcess.functionParameters) {
      let paramString = actionProcess.functionParameters
        .map((param) => {
          // let val = this.state.values[this.expandRelativePath(param.value)];
          let val;
          if (param.valueReference) {
            val = this.getPropertyValue(
              param.valueReference.reference,
              param.valueReference
            );
          } else {
            val = this.getPropertyValue(param.value);
          }

          if (val === undefined || val === null) {
            val = 'null';
          } else if (typeof val === 'string') {
            val = `"${val}"`;
          }

          return val;
        }, this)
        .join(', ');

      evalString += paramString;
    }

    evalString += ');';
    try {
      Function(evalString)();
    } catch (e) {
      alert('Error occurred on attempted run of:' + htmlDecode(evalString));
    }
  }

  /**
   * Method to handle OpenURL action. This is triggered when the event is seen.
   * @param { Object } e - synthetic event
   * @param { Object } data - data representing the field that the perform action was triggered on
   * @param { Object } actionProcess - object with information about url to open
   */
  handleOpenUrl(e, data, actionProcess) {
    let url;

    if (actionProcess.alternateDomain) {
      url = actionProcess.alternateDomain.url;
      if (!url && actionProcess.alternateDomain.urlReference)
        url = this.getPropertyValue(
          actionProcess.alternateDomain.urlReference.reference,
          actionProcess.alternateDomain.urlReference
        );
    }

    // url shouldn't have double quotes so just get rid of them (bounding double quotes have been encountered)
    url = url.replace(/"/g, '');
    // if a protocol isn't specified, launching it relative to localhost react server doesn't work so well
    if (url.indexOf('http') !== 0) {
      url = 'https://' + url;
    }

    let queryParams = actionProcess.queryParams
      .map((param) => {
        let parmValue;
        if (param.value) parmValue = htmlDecode(param.value);
        else if (param.valueReference.reference)
          parmValue = this.getPropertyValue(
            param.valueReference.reference,
            param.valueReference
          );
        return `${param.name}=${parmValue}`.replace(/"/g, '');
      })
      .join('&');

    if (queryParams) url += '?' + queryParams;
    window.open(url, actionProcess.windowName, actionProcess.windowOptions);
  }

  /**
   * Handle submit for the form
   * Dispatch action to perform action on assignment, with state stored on Work Object.
   */
  handleSubmit(model, reset, invalidateForm) {
    if (this.localActionInfo) {
      // Use the latest values (and also refresh)
      this.localActionEnd(false);
      // refresh now happens within localActionEnd
      //this.handleFieldRefresh();
      return;
    }
    const { assignment } = this.props;

    let newValues = Object.assign({}, this.state.values);

    let pi = Object.assign({}, this.pi.getPageInstructions());

    // Filter the fields from PI structure that are no longer visible in the form
    pi = getPostableFieldsPI(pi.postSettings.postableFields, pi);

    const woID = this.props.caseID;
    this.props
      .dispatch(
        assignmentActions.performActionOnAssignment(
          woID,
          this.props.caseID,
          assignment.ID,
          this.props.currAssignmentAction,
          newValues,
          pi
        )
      )
      .then((action) => {
        this.pi.clearPageInstructions();
        this.bDirtyFlag = false;
        this.formBtnsInfo.bScanButtons = true;
        this.postableFields.clear();
        this.changedFields.clear();
        // Scroll window to the top when form is submitted
        const elMain = document.querySelector('.main.pushable');
        if (elMain) {
          elMain.scrollTop = 0;
        }
        // This is to handle the case that we are changing actions on the same assignment
        if (
          action.assignment &&
          action.assignment.nextAssignmentID === assignment.ID
        ) {
          this.props.updateCurrAssignmentAction(action.nextActionID);
        }
      })
      .catch((error) => {
        // We could go extract the stuff from the error object, but we have already dispatched the error
        //  and state should be updated
        invalidateForm(this.state.validationErrors);
      });
  }

  /**
   * Method to handle addRow and deleteRow local actions. This is triggered when the event is seen.
   * @param { Object } e - synthetic event
   * @param { Object } actionProcess - data representing the field that the perform action was triggered on
   * @param { Object } oAction - object with information about local action
   */
  handleAddRow(e, data, actionProcess) {
    // TODO: Eliminate this flag once we test the false path
    let bForceRefreshOnRowUpdates = true;

    // actionProcess.actionReference will be the reference for the field that this was invoked on.  Using that
    // obtain the reference for the grid or dynamic layout reference
    let layout = this.getRepeatLayoutInfo(actionProcess.actionReference);
    if (!layout) {
      // This reference is not within a grid, so not supported.
      // TODO: Perhaps support looking up grid layouts and if there is only one in the flow action, retrieve and use it?
      const sError = "Action 'addRow' is supported only from within a table";
      //this.props.dispatch(alertActions.error(sError));
      alert(sError);
      return;
    }
    this.addRowAction(layout, actionProcess.actionReference, null, false);

    if (bForceRefreshOnRowUpdates) {
      let rowRef = actionProcess.actionReference;
      let sRowIndex = rowRef.substring(
        rowRef.lastIndexOf('(') + 1,
        rowRef.lastIndexOf(')')
      );
      let rowData = { rowNum: sRowIndex, layoutData: layout };
      this.refreshAssignmentActions(
        'addRow',
        rowData,
        this.postSettingsHonorPI
      );
    }
  }

  handleDeleteRow(e, data, actionProcess) {
    // TODO: Eliminate this flag once we test the false path
    let bForceRefreshOnRowUpdates = true;

    // actionProcess.actionReference will be the reference for the field that this was invoked on.  Using that
    // obtain the reference for the grid or dynamic layout reference
    let layout = this.getRepeatLayoutInfo(actionProcess.actionReference);
    this.deleteRowAction(layout, actionProcess.actionReference);

    if (bForceRefreshOnRowUpdates) {
      let rowRef = actionProcess.actionReference;
      let sRowIndex = rowRef.substring(
        rowRef.lastIndexOf('(') + 1,
        rowRef.lastIndexOf(')')
      );
      let rowData = { rowNum: sRowIndex, layoutData: layout };
      this.refreshAssignmentActions(
        'removeRow',
        rowData,
        this.postSettingsHonorPI
      );
    }
  }

  // Store all the info we need related to local action
  localActionBegin(sAction, sTarget) {
    this.localActionInfo = {
      // Flow action to be invoked for local action
      assignmentAction: sAction,
      // Target (Modal Dialog or Replace Current)
      target: sTarget,
      // Store state so we can restore it at end of local action
      storedValues: JSON.parse(JSON.stringify(this.state.values)),
      storedPI: this.pi.clonePageInstructions(),
    };
  }

  // Clean up any state setup for local action
  // Refresh also has moved here so it can be triggered properly after the state update has been applied
  localActionEnd(bRestoreState = true) {
    if (
      bRestoreState &&
      this.localActionInfo &&
      this.localActionInfo.storedValues
    ) {
      this.pi = this.localActionInfo.storedPI.clonePageInstructions();
      this.setState(
        {
          values: this.localActionInfo.storedValues,
          showLocalDialog: false,
          oLocalDialogInfo: null,
        },
        () => {
          this.handleFieldRefresh();
        }
      );
    } else {
      this.setState({ showLocalDialog: false, oLocalDialogInfo: null }, () =>
        this.handleFieldRefresh()
      );
    }
    this.localActionInfo = null;
  }

  /**
   * Method to handle localAction action. This is triggered when the event is seen.
   * @param { Object } e - synthetic event
   * @param { Object } data - data representing the field that the perform action was triggered on
   * @param { Object } actionProcess - object with information about url to open
   */
  handleLocalAction(e, data, actionProcess) {
    // Limit to a nesting depth of 1
    if (this.localActionInfo) {
      alert('Only one modal dialog or replace content may be used at a time.');
      return;
    }
    let sAction = actionProcess.localAction;
    let sTarget = actionProcess.target;
    let sTemplate = actionProcess.customTemplate;

    switch (sTarget) {
      case localActionTargets.REPLACE_CURRENT:
        this.localActionBegin(sAction, sTarget);
        this.takeAction(sAction);
        break;
      case localActionTargets.MODAL_DIALOG:
        this.localActionBegin(sAction, sTarget);
        this.getDialogView(sAction);
        break;
      case localActionTargets.OVERLAY:
        alert('Overlay not supported.');
        break;
    }
  }

  handleOpenAssignment(e, data, actionProcess) {
    const pzInsKey =
      actionProcess.assignment ||
      actionProcess.assignmentReference.lastSavedValue;
    if (pzInsKey) {
      const assignmentPath = pzInsKey.split('!')[0];
      const parts = assignmentPath.split(' ');
      parts.shift();
      const pxRefObjectKey = parts.join(' ');
      this.openAssignment(pzInsKey, pxRefObjectKey);
    }
  }

  openAssignment(id, caseID) {
    const woID = caseID;
    this.props.dispatch(assignmentActions.addOpenAssignment(woID, caseID, id));
    this.props.dispatch(assignmentActions.getAssignment(woID, id));
    this.props.dispatch(caseActions.getCase(woID, caseID));
    // Scroll window to the top when assignment tab is opened
    const elMain = document.querySelector('.main.pushable');
    if (elMain) {
      elMain.scrollTop = 0;
    }
  }

  /**
   * Handle cancel for the form. Closes the work object.
   * @param { Object } e - synthetic event
   * @param { Object } data
   */
  handleCancel(e, data) {
    e.preventDefault();
    if (this.localActionInfo) {
      this.localActionEnd();
      // refresh now happens within localActionEnd
      //this.handleFieldRefresh();
      return;
    }
    this.props.dispatch(errorActions.clearErrors(this.props.caseID));
    this.props.dispatch(assignmentActions.closeAssignment(this.props.caseID));
  }

  /**
   * Handle save for the form. Does not close the work object.
   * @param { Object } e - synthetic event
   * @param { Object } data
   */
  handleSave(e, data) {
    e.preventDefault();

    // Clear validationErrors
    this.props.dispatch(errorActions.clearErrors(this.props.caseID));
    // Below achieves clearing any validations on a save for required fields (which may have appeared as part
    //  of getting server validation errors displayed)
    this.formRef.current.setFormPristine(true);

    // Note: saveAssignment and updateCase actions methods use ReferenceHelpers.getBodyContent (which is needed to filter out the
    //  the extraneous content...so need to do that here)
    let newValues = Object.assign({}, this.state.values);
    let pi = Object.assign({}, this.pi.getPageInstructions());

    // Filter the fields from PI structure that are no longer visible in the form
    pi = getPostableFieldsPI(pi.postSettings.postableFields, pi);

    // Finding that we need to set dirty flag to true early...else Save is still enabled..so clear and then set it again on error
    let bPriorDirtyFlag = this.bDirtyFlag;
    this.bDirtyFlag = false;

    if (this.props.appSettings.bUsePostAssignmentsSave) {
      // 8.4 and greater
      // this is the PREFERRED way to save in an assignment as here we are saving the assignment and not the case
      // so there will be validation against the flow action properties that doesn't happen if you just save the case.
      const woID = this.props.caseID;
      this.props
        .dispatch(
          assignmentActions.saveAssignment(
            woID,
            this.props.caseID,
            this.props.assignment.ID,
            this.props.currAssignmentAction,
            newValues,
            pi
          )
        )
        .then((action) => {
          this.pi.clearPageInstructions();
        })
        .catch((error) => {
          // error[0].ValidationMessages contains errors, but can use the state set by reducer instead
          this.bDirtyFlag = bPriorDirtyFlag;
          // Below was necessary to get server validation messages to display properly.  Client validation
          //  messages will also display (but that is better than not getting any errors displayed)
          this.formRef.current.setFormPristine(false);
          this.formRef.current.updateInputsWithError(
            this.state.validationErrors
          );
        });
    } else {
      const woID = this.props.caseID;
      this.props
        .dispatch(
          caseActions.updateCase(
            woID,
            this.props.caseID,
            newValues,
            this.props.etag,
            null,
            pi
          )
        )
        .then(
          () => {
            this.pi.clearPageInstructions();
          },
          // error
          (reason) => {
            this.bDirtyFlag = bPriorDirtyFlag;
            // No server field validation is done in this route, so unlikely to get validation errors
            this.formRef.current.updateInputsWithError(
              this.state.validationErrors
            );
          }
        );
    }
  }

  /**
   * Handle cancel for the form. Closes the work object.
   * @param { Object } e - synthetic event
   * @param { Object } data
   */
  handleBack(e, backActionInfo) {
    e.preventDefault();
    //this.props.dispatch(errorActions.clearErrors(this.props.caseID));

    // Note: saveAssignment actions method use ReferenceHelpers.getBodyContent (which is needed to filter out the
    //  the extraneous content...so need not be done here)
    let newValues = Object.assign({}, this.state.values);
    let pi = Object.assign({}, this.pi.getPageInstructions());

    let fnStepPrevious = (etag) => {
      const woID = this.props.caseID;
      this.props
        .dispatch(
          assignmentActions.stepPrevious(
            woID,
            this.props.caseID,
            this.props.assignment.ID,
            etag
          )
        )
        .then((action) => {
          this.formBtnsInfo.bScanButtons = true;
          // This is to handle the case that we are changing actions on the same assignment
          if (
            action?.stepResponse &&
            action.stepResponse.nextAssignmentInfo.ID ===
              this.props.assignment.ID
          ) {
            this.props.updateCurrAssignmentAction(action.nextActionID);
          }
        });
    };

    if (this.bDirtyFlag) {
      // If mods made, make sure to save first
      const woID = this.props.caseID;
      this.props
        .dispatch(
          assignmentActions.saveAssignment(
            woID,
            this.props.caseID,
            this.props.assignment.ID,
            this.props.currAssignmentAction,
            newValues,
            pi
          )
        )
        .then((response) => {
          this.pi.clearPageInstructions();
          this.bDirtyFlag = false;
          fnStepPrevious(response.aCase.etag);
        });
    } else {
      fnStepPrevious(this.props.etag);
    }
  }

  /**
   * Handle case create when using New harness.
   * Dispatch action to perform case creation.
   */
  handleCaseCreate(model, reset, invalidateForm) {
    //let postContent = ReferenceHelper.getPostContent(this.state.values, false);
    let postContent = ReferenceHelper.getPostContent(
      this.state.values,
      this.pi.getPostSettings()
    );
    this.props
      .dispatch(
        caseActions.createCase(
          this.props.caseID,
          this.state.processID,
          postContent
        )
      )
      .then((action) => {})
      .catch((error) => {
        // We could go extract the stuff from the error object and invoke getValidationErrorsByKey to get
        //  the structure to pass to invalidateForm, but we have already dispatched the error and state
        //  should be updated
        invalidateForm(this.state.validationErrors);
      });
  }

  /**
   * Returns an object with validation errors associated to field references.
   * @param { Object } errors - object returned from API with errors
   * @return { Object } object with validation errors associated with reference keys
   */
  getValidationErrorsByKey(errors) {
    let errorsByKey = {};
    let shiftToGlobal = 0;

    if (errors) {
      for (let i = 0; i < errors.ValidationMessages.length; i++) {
        let message = errors.ValidationMessages[i];
        if (message.Path) {
          // Make sure the Path actually exists and is a field by attempting to get the property value
          if (message.Path == this.getPropertyValue(message.Path)) {
            // Field not found...so remove the Path and make it a global error
            if (message.ValidationMessage) {
              ++shiftToGlobal;
              delete message.Path;
            }
          } else {
            errorsByKey[this.expandRelativePath(message.Path)] =
              message.ValidationMessage;
          }
        }
      }
    }

    // If there are messages to shift
    if (shiftToGlobal > 0) {
      // Set state and it should result in us processsing this again
      this.setState({ errors: errors });
    }

    return errorsByKey;
  }

  render() {
    // If we are showing New harness, then do not show caseView, only harness.
    if (this.props.page && this.props.page.name === pageNames.NEW) {
      return this.getPage();
    }

    // In the event that we have a page, show it instead of the form
    // This is used for things like the "Confirm" harness.
    // Also show section on the right side of the WorkObject (if so configured)
    let bShowDetails = this.props.appSettings.bShowRightPanel;
    // To check if we're in /embedded mode
    let bIsEmbeddedMode =
      window.location.pathname === '/embedded' ? true : false;
    // Used for deciding whether to show or hide attachments widget based upon 'Show Attachments' checkbox, toogle button
    let bShowAttachments = this.props.showAttachmentsWidget;
    let index = 0;
    return (
      <div>
        {this.localActionDialog(index++)}
        <Grid columns={2} stackable as={Segment} attached="bottom" key={index}>
          <Grid.Row>
            <Grid.Column
              width={
                bShowDetails
                  ? bShowAttachments
                    ? 7
                    : 10
                  : bShowAttachments
                  ? 13
                  : 16
              }
            >
              <div hidden={true} id="current-caseID">
                {this.props?.caseID}
              </div>
              {this.props.page ? this.getPage() : this.getForm()}
            </Grid.Column>
            {bShowAttachments && (
              <Grid.Column width={3}>
                <AttachmentsWidget
                  caseID={this.props.caseID}
                  deleteDisabled={this.bIsConfirm}
                />
              </Grid.Column>
            )}
            {bShowDetails && (
              <Grid.Column width={6}>{this.getCaseView()}</Grid.Column>
            )}
          </Grid.Row>
        </Grid>

        {this.props.refreshRequestInProgress && (
          <Dimmer active inverted>
            <Loader />
          </Dimmer>
        )}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const caseDetail = {
    ...state.cases.caseDetails[state.assignments.openAssignmentsTabIdx[0]],
  };
  const { openCasesData, refreshRequestInProgress } = { ...state.assignments };
  const assignmentDetails = {
    ...state.assignments.assignmentDetails[ownProps.caseID],
  };
  const dlgInfo = { ...state.assignments.dlgInfo[ownProps.caseID] };
  const { appSettings } = { ...state.user };
  return {
    assignmentDetails,
    openCasesData,
    caseDetail,
    appSettings,
    dlgInfo,
    refreshRequestInProgress,
  };
}

const connectedPegaForm = connect(mapStateToProps)(PegaForm);
export { connectedPegaForm as PegaForm };
