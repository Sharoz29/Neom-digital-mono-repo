import { createStore, compose, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { rootReducer } from '../_reducers';

const loggerMiddleware = createLogger();

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  rootReducer,
  composeEnhancer(
    applyMiddleware(thunkMiddleware,
      loggerMiddleware))
);
