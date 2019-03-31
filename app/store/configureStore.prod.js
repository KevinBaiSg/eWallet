// @flow

import { createHashHistory } from 'history';
// import type { counterStateType } from '../reducers/types';
import { CreateStoreMap, CreateActionMap } from './index';

const history = createHashHistory();

function configureStore() {
  return CreateStoreMap();
}

function configureAction() {
  return CreateActionMap();
}

export default { configureStore, configureAction, history };
