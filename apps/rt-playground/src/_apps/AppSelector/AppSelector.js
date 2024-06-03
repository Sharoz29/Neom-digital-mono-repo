import React from "react";
import { Switch, Route } from 'react-router-dom';
import Embedded from "../Embedded/Embedded";
import { PegaApp } from "../PegaApp/PegaApp";
import { AuthPage } from "../../AuthPage";
import { getHomeUrl } from "../../_helpers";

// The Main component renders one of the three provided
// Routes (provided that one matches). Both the /roster
// and /schedule routes will match any pathname that starts
// with /roster or /schedule. The / route will only match
// when the pathname is exactly the string "/"

// Route exact
const AppSelector = () => {
  const bHasToken = !!sessionStorage.getItem("pega_react_TI");
  const homeUrl = getHomeUrl();
  const sAuthPath = homeUrl + (homeUrl === "/" ? "auth" : "");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code");

  return (
    <Switch>
      {(!bHasToken && code &&
          <Route path={sAuthPath} component={AuthPage} />
      )}
      <Route path={`${process.env.PUBLIC_URL}/embedded`} component={Embedded} />
      <Route path={`${process.env.PUBLIC_URL}/portal`} component={PegaApp} />
      <Route path={`${process.env.PUBLIC_URL}/auth`} component={AuthPage} />
      <Route exact path={`${homeUrl}`} component={PegaApp} />
      <Route path="*" component={PegaApp} />
    </Switch>
  )

};

export default AppSelector;
