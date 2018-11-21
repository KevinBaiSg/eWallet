// @flow
import { createHashHistory } from 'history';
// import type { counterStateType } from '../reducers/types';
import { AppState } from './index';

const history = createHashHistory();

function configureStore() {
  return new AppState();
}

export default { configureStore, history };
