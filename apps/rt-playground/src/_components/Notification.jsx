import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

const NotificationDropdown = styled.div`
  position: absolute;
  right: 30px;
  top: 50px;
  background-color: white;
  width: 300px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  border-radius: 5px;
  z-index: 100;
  padding-bottom: 10px;
`;

const NotificationHeader = styled.div`
  padding: 10px;
  background: #2185d0;
  color: white;
  display: flex;
  justify-content: center;
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background-color: #e0f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationContent = styled.div`
  flex-grow: 1;
  padding-left: 10px;
`;

const NotificationTitle = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const NotificationStatus = styled.span`
  font-size: 10px;
  color: white;
  background-color: #ff4d4f;
  border-radius: 5px;
  padding: 2px 4px;
  margin-left: 8px;
`;

const NotificationMessage = styled.div`
  font-size: 12px;
  color: #757575;
`;

const NotificationTime = styled.div`
  font-size: 10px;
  color: #9e9e9e;
  margin-top: 2px;
`;

const ShowAllButton = styled.button`
  background: #2185d0;
  color: white;
  width: 100%;
  text-align: center;
  padding: 10px;
  border: none;
  border-radius: 0 0 5px 5px;
  cursor: pointer;
  &:hover {
    background: #197bb5;
  }
`;

function Notifications({ notifications, onClose }) {
  return (
    <NotificationDropdown>
      <NotificationHeader>
        <h3>Notifications</h3>
      </NotificationHeader>
      <NotificationList>
        {notifications.map((notification, index) => (
          <NotificationItem key={index}>
            <NotificationIcon>
              <Icon name={notification.icon} size="large" />
            </NotificationIcon>
            <NotificationContent>
              <NotificationTitle>
                {notification.title}
                <NotificationStatus>{notification.status}</NotificationStatus>
              </NotificationTitle>
              <NotificationTime>{notification.time}</NotificationTime>
              <NotificationMessage>{notification.message}</NotificationMessage>
            </NotificationContent>
            <Icon name="close" onClick={() => onClose(index)} />
          </NotificationItem>
        ))}
      </NotificationList>
      <ShowAllButton>Show All Activities</ShowAllButton>
    </NotificationDropdown>
  );
}

export default Notifications;
