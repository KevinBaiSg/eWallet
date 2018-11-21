import { createHashHistory } from 'history';
// import type { counterStateType } from '../reducers/types';
import makeInspectable from 'mobx-devtools-mst';
import { AppState } from './index';

const history = createHashHistory();

const configureStore = () => {
  /*
    TODO: ADD
    1.mobx-devtools
    2.mobx-react-router
    3.logger
  */
  const store = new AppState();

  // Mobx Devtools
  makeInspectable(store);

  return store;
};

export default { configureStore, history };
