import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu, Icon, Dropdown, Modal, Checkbox, Button, Grid, TextArea, Input} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { userActions } from "../_actions";
import { appConstants } from "../_constants";
import { getHomeUrl } from "../_helpers";

class AppHeader extends Component {
  constructor(props) {
    super(props);

    this.rootPage = getHomeUrl();
    this.checkboxEmbeddedPageInstructions = React.createRef();
    this.checkboxRepeatPageInstructions = React.createRef();
    this.checkboxLocalOptionsDP = React.createRef();
    this.checkboxLocalOptionsCP = React.createRef();
    this.checkboxPostAssignSave = React.createRef();
    this.checkboxShowRightPanel = React.createRef();
    this.rightPanelSection = React.createRef();
    this.checkboxSaveButton = React.createRef();
    this.checkboxShowWorkbaskets = React.createRef()
    this.checkboxShowAttachments = React.createRef();
    this.createCaseContext = React.createRef();
    this.state = {
      showSettings: false,
      createCaseContext: props.appSettings.createCaseContext,
      rightPanelSection: props.appSettings.rightPanelSection
    };
    this.handleCCChange = this.handleCCChange.bind(this);
  }

  render() {
    return (
      <div>
      {(this.settingsModal())}
      <Menu inverted color="blue" stackable={false} fixed="top">
        {this.props.loggedIn && (
          <Menu.Item id="toggle-icon" onClick={this.props.toggleSidebar}>
            <Icon name="content" />
          </Menu.Item>
        )}
        <Menu.Item name="app" as={Link} to={this.rootPage}>
          <Icon name="home" size="large" />
          {appConstants.APPNAME}
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Icon name="setting" size="large" title="Open Settings" onClick={(e) => this.setState({showSettings:true})} />
          </Menu.Item>
          <Menu.Item>{appConstants.VERSION}</Menu.Item>
          {this.props.loggedIn &&
            this.props.userData && (
              <Dropdown item text={this.props.userData.name}>
                <Dropdown.Menu>
                <Dropdown.Item text="Logout" onClick={ (e) => this.handleLogout() } />
                </Dropdown.Menu>
              </Dropdown>
            )}
        </Menu.Menu>
      </Menu>
      </div>
    );
  }

  handleLogout() {
    this.props.dispatch(userActions.logout());
    this.props.history.push(this.rootPage);
  }

  handleCCChange(event) {
    this.setState({createCaseContext: event.target.value});
  }

  settingsModal() {
    // Was oringally disabling only when v2 API was not available, but later opted just have this disabled and always checked if a V2 API was specified. 
    // Might remove in the future.  For now it just "avertises" that this capability is available. 
    const sScreenFlowStatus = this.props.appSettings.bUseScreenFlow ? 'enabled' : 'disabled';
    return(
      <Modal open={this.state.showSettings}>
      <Modal.Header>Application Settings</Modal.Header>
      <Modal.Content>
      <Grid divided='vertically'>
        <Grid.Row columns={2}>
        <Grid.Column>
        <b>Optimizations for 8.3+</b><br />
        <Checkbox ref={this.checkboxEmbeddedPageInstructions} label="Use Page Instructions for Embedded Pages" defaultChecked={this.props.appSettings.bUseEmbeddedPageInstructions} /><br />
        <Checkbox ref={this.checkboxRepeatPageInstructions} label="Use Page Instructions for Page Lists/Page Groups" defaultChecked={this.props.appSettings.bUseRepeatPageInstructions} /><br />
        <Checkbox ref={this.checkboxLocalOptionsDP} label="Autocomplete/Dropdown use local options for Data Page" defaultChecked={this.props.appSettings.bUseLocalOptionsForDataPage} /><br />
        <Checkbox ref={this.checkboxLocalOptionsCP} label="Autocompelte/Dropdown use local options for Clipboard Page" defaultChecked={this.props.appSettings.bUseLocalOptionsForClipboardPage} /><br />
        <br />
        <b>Optimizations for 8.4+</b><br />
        <Checkbox ref={this.checkboxPostAssignSave} label="Save assignment (preferred) (vs. Save case)" defaultChecked={this.props.appSettings.bUsePostAssignmentsSave} /><br />
        </Grid.Column>
        <Grid.Column>
        <b>Capability for 8.5+</b><br />
        Screen Flow: <b>{sScreenFlowStatus}</b><br />
        <br />
        <b>General UI related</b><br />
        <Checkbox ref={this.checkboxShowRightPanel} label="Show right panel" defaultChecked={this.props.appSettings.bShowRightPanel} />
          <Input ref={this.rightPanelSection} style={{paddingLeft:"1em"}} value={this.state.rightPanelSection}/><br />
        <Checkbox ref={this.checkboxSaveButton} label="Show Save action" defaultChecked={this.props.appSettings.bSaveButton} /><br />
        <Checkbox ref={this.checkboxShowWorkbaskets} label="Show Workgroup Workbaskets" defaultChecked={this.props.appSettings.bshowWorkgroupBaskets} /><br />
        <Checkbox ref={this.checkboxShowAttachments} label="Show Attachments" defaultChecked={this.props.appSettings.bShowAttachments} />
        </Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid>
        <Grid.Row>
          <Grid.Column>
            Create Case Starting Fields (must be JSON-compliant)<br />
            <TextArea ref={this.createCaseContext} value={this.state.createCaseContext} onChange={this.handleCCChange} style={{width:"100%",height:"3em"}}/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => this.setState({showSettings:false})}>Cancel</Button>
        <Button onClick={() => this.saveSettings()} positive>OK</Button>
      </Modal.Actions>
    </Modal>
    )
  }

  saveSettings() {
    let appSettings = {
      bUseEmbeddedPageInstructions: this.checkboxEmbeddedPageInstructions.current.state.checked,
      bUseRepeatPageInstructions: this.checkboxRepeatPageInstructions.current.state.checked,
      bUseLocalOptionsForDataPage: this.checkboxLocalOptionsDP.current.state.checked,
      bUseLocalOptionsForClipboardPage: this.checkboxLocalOptionsCP.current.state.checked,
      bUsePostAssignmentsSave: this.checkboxPostAssignSave.current.state.checked,
      bUseScreenFlow: this.props.appSettings.bUseScreenFlow,
      bShowRightPanel: this.checkboxShowRightPanel.current.state.checked,
      rightPanelSection: this.state.rightPanelSection,
      bSaveButton: this.checkboxSaveButton.current.state.checked,
      createCaseContext: this.state.createCaseContext,
      bshowWorkgroupBaskets: this.checkboxShowWorkbaskets.current.state.checked,
      bShowAttachments: this.checkboxShowAttachments.current.state.checked
    };
    this.setState( {
      showSettings:false,
    } );
    this.props.dispatch(userActions.updateAppSettings(appSettings));
  }

}

function mapStateToProps(state) {
  return {
    loggedIn: state.user.loggedIn,
    userData: state.user.userData,
    appSettings: state.user.appSettings
  }
}

const connectedHeader = withRouter(connect(mapStateToProps)(AppHeader));
export { connectedHeader as AppHeader };
