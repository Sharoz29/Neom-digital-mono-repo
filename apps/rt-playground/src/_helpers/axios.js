/**
 * Custom axios instance
 */

import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { endpoints } from '../_services/endpoints';
import { authRefresh } from './';

const instance = axios.create({
  baseURL: endpoints.BASEV2URL,
  timeout: 30000,
  headers: {
    appName: 'CallADoc',
    // 'X-Custom-Header': 'foobar',
    // // true: need, false: dont need
    // 'Authorization': true,
    // 'X-Requested-With': 'XMLHttpRequest'
  },
});

// Function that will be called to re-authenticate
const reAuthLogic = (failedRequest) => {
  return new Promise((resolve, reject) => {
    return authRefresh()
      .then((token) => {
        if (token) {
          failedRequest.response.config.headers['Authorization'] =
            'Bearer ' + token;
          return resolve();
        }
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
};

if (endpoints.use_OAuth) {
  // Instantiate the interceptor (you can chain it as it returns the axios instance)
  createAuthRefreshInterceptor(instance, reAuthLogic);
}

instance.interceptors.request.use((request) => {
  // Add authorization header if set
  const authHdr = sessionStorage.getItem('pega_react_user');
  if (authHdr) {
    //Add this to Neom digital
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

export default instance;
