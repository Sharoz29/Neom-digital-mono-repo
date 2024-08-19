import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Menu as MenuIcon, Home, Devices, Alarm } from '@mui/icons-material';
import AppsIcon from '@mui/icons-material/Apps';
import { Menu, MenuItem } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { history } from '../_helpers';
import { useSelector } from 'react-redux';

const SidebarContainer = styled.div`
  width: 72px;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  transform: ${({ isOpen }) =>
    isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease-in-out;
  z-index: 1000;

  @media (min-width: 1371px) {
    transform: translateX(0);
    position: relative;
    height: auto;
    box-shadow: none;
  }

  @media (max-width: 700px) {
    display: none;
  }
`;

const Title = styled.h2`
  font-size: 18px;
  color: black;
  margin-bottom: 30px;

  @media (min-width: 1370px) {
    font-size: 30px;
  }
`;

const MenuItemStyled = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: black;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const IconContainer = styled.div`
  margin-right: 10px;
  color: ${({ active }) => (active ? 'yellow' : 'white')};
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 12px;
  color: white;
  left: 10px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;

  @media (min-width: 1371px) {
    display: none;
  }

  @media (max-width: 700px) {
    display: none;
  }
`;

const DropdownToggleButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;

  @media (max-width: 700px) {
    display: flex;
  }
`;

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const location = useLocation();
  const { loggedIn, userData } = useSelector((state) => ({
    loggedIn: state.user.loggedIn,
    userData: state.user.userData,
  }));

  console.log(location?.pathname, 'path.name');
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setAnchorEl(null);
    }
  };

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarRef, toggleButtonRef]);

  const handleNavigation = (path) => {
    setIsOpen(false);
    setAnchorEl(null);
    history.push(path);
  };

  const menuItems = (
    <>
      <MenuItemStyled onClick={() => handleNavigation('/')}>
        <IconContainer active={currentPath === '/'}>
          <Home />
        </IconContainer>
      </MenuItemStyled>
      <MenuItemStyled onClick={() => handleNavigation('/devices')}>
        <IconContainer active={currentPath === '/devices'}>
          <Devices />
        </IconContainer>
      </MenuItemStyled>
      <MenuItemStyled onClick={() => handleNavigation('/alarms')}>
        <IconContainer active={currentPath === '/alarms'}>
          <Alarm />
        </IconContainer>
      </MenuItemStyled>
      <MenuItemStyled onClick={() => handleNavigation('/cases')}>
        <IconContainer active={currentPath === '/cases'}>
          <AppsIcon />
        </IconContainer>
      </MenuItemStyled>
    </>
  );

  return (
    <>
      {loggedIn && userData && (
        <>
          <DropdownToggleButton onClick={handleDropdownOpen}>
            <MenuIcon style={{ fontSize: 30, color: 'white' }} />
          </DropdownToggleButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleDropdownClose}
          >
            <MenuItem onClick={() => handleNavigation('/')}>
              <IconContainer active={currentPath === '/'}>
                <Home />
              </IconContainer>
              Home
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/devices')}>
              <IconContainer active={currentPath === '/devices'}>
                <Devices />
              </IconContainer>
              Devices
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/alarms')}>
              <IconContainer active={currentPath === '/alarms'}>
                <Alarm />
              </IconContainer>
              Alarm
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/cases')}>
              <IconContainer active={currentPath === '/cases'}>
                <AppsIcon />
              </IconContainer>
              Cases
            </MenuItem>
          </Menu>
          <ToggleButton ref={toggleButtonRef} onClick={toggleSidebar}>
            <MenuIcon style={{ fontSize: 30 }} />
          </ToggleButton>
          <SidebarContainer ref={sidebarRef} isOpen={isOpen}>
            <div style={{ marginTop: '10px' }}>{menuItems}</div>
          </SidebarContainer>
        </>
      )}
    </>
  );
}

export default Sidebar;
