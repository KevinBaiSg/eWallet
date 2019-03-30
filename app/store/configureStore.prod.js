// @flow

import { createHashHistory } from 'history';
// import type { counterStateType } from '../reducers/types';
import { CreateStoreMap } from './index';

const history = createHashHistory();

function configureStore() {
  return CreateStoreMap();
}

export default { configureStore, history };
