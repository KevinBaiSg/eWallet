// @flow

import { createHashHistory } from 'history';
// import type { counterStateType } from '../reducers/types';
import { CreateStoreMap, CreateActionMap } from './index';

const history = createHashHistory();

function configureStore() {
  return CreateStoreMap(history);
}

function configureAction(stores) {
  return CreateActionMap(stores);
}

export default { configureStore, configureAction, history };
