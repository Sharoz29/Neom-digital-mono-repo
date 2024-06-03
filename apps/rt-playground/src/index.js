import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import { store } from "./_helpers";
import AppSelector from "./_apps/AppSelector/AppSelector";

import "./_styles/index.css";
import "semantic-ui-css/semantic.min.css";
import "./_styles/semantic-custom.css"
import "react-datepicker/dist/react-datepicker.css";
import "./_styles/uikit/pega-icons.css";

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <AppSelector />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();
