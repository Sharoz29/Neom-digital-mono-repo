import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Embedded from '../Embedded/Embedded';
import { PegaApp } from '../PegaApp/PegaApp';
import { AuthPage } from '../../AuthPage';
import { getHomeUrl } from '../../_helpers';
import AlarmDetail from '../../_components/Alarm/AlarmDetail';
import Alarms from '../../_components/Alarm/Alarms';

import AppHeader from '../../AppHeader/AppHeader';
import Sidebar from '../../_components/sidebar';
import styled from 'styled-components';
import DeviceDetail from '../../_components/Device/DeviceDetail';
import Device from '../../_components/Device/Device';
import Footer from '../../_components/Footer';
import Cases from '../../_components/Cases/Cases';

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  //  height:auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: none;
  background: white;
`;

const AppSelector = () => {
  const bHasToken = !!sessionStorage.getItem('pega_react_TI');
  const homeUrl = getHomeUrl();
  const sAuthPath = homeUrl + (homeUrl === '/' ? 'auth' : '');
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get('code');

  return (
    <Layout>
      <Sidebar />
      <MainContent>
        <AppHeader />
        <Content>
          <Switch>
            {!bHasToken && code && (
              <Route path={sAuthPath} component={AuthPage} />
            )}
            <Route
              path={`${process.env.PUBLIC_URL}/embedded`}
              component={Embedded}
            />
            <Route
              path={`${process.env.PUBLIC_URL}/portal`}
              component={PegaApp}
            />
            <Route
              path={`${process.env.PUBLIC_URL}/auth`}
              component={AuthPage}
            />
            <Route exact path={`${homeUrl}`} component={PegaApp} />
            <Route path="*" component={PegaApp} />
            <Route
              path={`${process.env.PUBLIC_URL}/alarms`}
              component={Alarms}
            />
            <Route
              path={`${process.env.PUBLIC_URL}/devices`}
              component={Device}
            />
            <Route
              path={`${process.env.PUBLIC_URL}/device/:id`}
              component={DeviceDetail}
            />
            <Route
              path={`${process.env.PUBLIC_URL}/alarm/:id
              `}
              component={AlarmDetail}
            />
            <Route
              path={`${process.env.PUBLIC_URL}/cases
              `}
              component={Cases}
            />
          </Switch>
        </Content>
        <Footer />
      </MainContent>
    </Layout>
  );
};

export default AppSelector;
