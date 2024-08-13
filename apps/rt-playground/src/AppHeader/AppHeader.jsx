import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Modal, Checkbox, Button, Grid, TextArea, Input, Icon } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import { userActions } from "../_actions";
import { getHomeUrl } from "../_helpers";
import styled from "styled-components";
import Notification from "../_components/Notification";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';


const HeaderContainer = styled.div`
  z-index: 999;
  background: black;
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  align-items: center;
  @media (max-width: 1371px) {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
  }

`;

const HeaderContent = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  width: 98%;
  justify-content: space-between;
  `;
  
  const HeaderTitle = styled.h3`
  color: white;
  margin: 0;
  @media (max-width: 1371px) {
    margin-left: 40px;
  }
  `;

const SearchInput = styled(Input)`
  max-width: 200px;
  margin-right: auto;
  @media (max-width: 1371px) {
    margin-left: 44px;
  }
  @media (max-width: 600px) {
    max-width: 300px;
  }
`;

const IconStyle = styled.div`
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
  position: relative;
`;

const ProfileIcon = styled.div`
background: #E0EEFF;
  color: black;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-left: 10px;
  cursor: pointer;
  position: relative;
`;

const TimeBadge = styled.div`
  background-color: #f57c00;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  position: absolute;
  bottom: -4px;
  right: -4px;
`;

const NotificationCount = styled.div`
  position: absolute;
  top: 3px;
  right: -10px;
  background-color: #e74c3c;
  font-size: 12px;
  border-radius: 50%;
  color: white;
  padding: 0 5px;
`;

function AppHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const sampleNotifications = [
    {
      icon: 'bell',
      title: 'Sensor#5',
      time: 'Just now',
      message: 'Temperature exceeded the value',
      status: 'Emergency',
    },
    {
      icon: 'bell',
      title: 'Sensor#5',
      time: '59 minutes ago',
      message: 'Temperature exceeded the value',
      status: 'Emergency',
    },
    {
      icon: 'bell',
      title: 'Sensor#5',
      time: '12 hours ago',
      message: 'Temperature exceeded the value',
      status: 'Emergency',
    },
    {
      icon: 'bell',
      title: 'Sensor#5',
      time: 'Today, 11:59 AM',
      message: 'Temperature exceeded the value',
      status: 'Emergency',
    },
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const { loggedIn, userData, appSettings } = useSelector(state => ({
    loggedIn: state.user.loggedIn,
    userData: state.user.userData,
    appSettings: state.user.appSettings
  }));

  const dispatch = useDispatch();
  const history = useHistory();
  const rootPage = getHomeUrl();

  const handleLogout = () => {
    dispatch(userActions.logout());
    history.push(rootPage);
  };

  const saveSettings = () => {
    let settings = {
    };
    dispatch(userActions.updateAppSettings(settings));
    setShowSettings(false);
  };

  const settingsModal = () => (
    <Modal open={showSettings}>
      <Modal.Header>Application Settings</Modal.Header>
      <Modal.Content>
        <Grid divided='vertically'>
          <Grid.Row columns={2}>
            <Grid.Column>
              <b>Optimizations for 8.3+</b><br />
              <Checkbox label="Use Page Instructions for Embedded Pages" defaultChecked={appSettings.bUseEmbeddedPageInstructions} /><br />
              <Checkbox label="Use Page Instructions for Page Lists/Page Groups" defaultChecked={appSettings.bUseRepeatPageInstructions} /><br />
              <Checkbox label="Autocomplete/Dropdown use local options for Data Page" defaultChecked={appSettings.bUseLocalOptionsForDataPage} /><br />
              <Checkbox label="Autocomplete/Dropdown use local options for Clipboard Page" defaultChecked={appSettings.bUseLocalOptionsForClipboardPage} /><br />
            </Grid.Column>
            <Grid.Column>
              <b>Capability for 8.5+</b><br />
              Screen Flow: <b>{appSettings.bUseScreenFlow ? 'enabled' : 'disabled'}</b><br />
              <br />
              <b>General UI related</b><br />
              <Checkbox label="Show right panel" defaultChecked={appSettings.bShowRightPanel} />
              <Input style={{marginLeft: "1em"}} defaultValue={appSettings.rightPanelSection} /><br />
              <Checkbox label="Show Save action" defaultChecked={appSettings.bSaveButton} /><br />
              <Checkbox label="Show Workgroup Workbaskets" defaultChecked={appSettings.bshowWorkgroupBaskets} /><br />
              <Checkbox label="Show Attachments" defaultChecked={appSettings.bShowAttachments} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              Create Case Starting Fields (must be JSON-compliant)<br />
              <TextArea defaultValue={appSettings.createCaseContext} style={{width:"100%", minHeight:"100px"}}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setShowSettings(false)}>Cancel</Button>
        <Button onClick={saveSettings} positive>OK</Button>
      </Modal.Actions>
    </Modal>
  );

  return (
    <>
      {loggedIn && userData && (
        <HeaderContainer>
          <HeaderContent>
            <HeaderTitle>EMERGENCY ALARM SYSTEM</HeaderTitle>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IconStyle onClick={handleNotificationClick}>
                <NotificationsNoneIcon style={{ color: 'white', fontSize: '36px' }} />
              </IconStyle>
              <Dropdown
                item
                trigger={
                  <ProfileIcon>
                    {userData?.name?.[0] || 'A'}
                    <TimeBadge>
                      <AccessTimeIcon style={{ color: 'white', fontSize: '12px' }} />
                    </TimeBadge>
                  </ProfileIcon>
                }
                pointing="top left"
                icon={null}
                style={{ color: 'white' }}
              >
                <Dropdown.Menu>
                  <Dropdown.Item text="Logout" onClick={handleLogout} />
                </Dropdown.Menu>
              </Dropdown>
            </div>
            {showNotifications && (
              <Notification notifications={sampleNotifications} onClose={handleNotificationClick} />
            )}
          </HeaderContent>
        </HeaderContainer>
      )}
      {settingsModal()}
    </>
  );
}

export default AppHeader;
