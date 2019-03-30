import { createHashHistory } from 'history';
// import type { counterStateType } from '../reducers/types';
import makeInspectable from 'mobx-devtools-mst';
import { CreateStoreMap } from './index';

const history = createHashHistory();

const configureStore = () => {
  /*
    TODO: ADD
    1.mobx-devtools
    2.mobx-react-router
    3.logger
  */
  const store = CreateStoreMap();

  // Mobx Devtools
  makeInspectable(store);

  return store;
};

export default { configureStore, history };
