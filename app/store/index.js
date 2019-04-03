import AppState from './app-state';
import SendStore from './SendStore';
import Web3Store from './Web3Store';

import SendActions from './SendActions';
import Web3Actions from './Web3Actions';

// export {
//   AppState,
//   SendStore
// };
//
// export default {
//   AppState,
//   SendStore
// };

export const CreateStoreMap = () => {
  return {
    appState: new AppState(),
    sendStore: new SendStore(),
    web3Store: new Web3Store(),
  };
};

export const CreateActionMap = (stores) => {
  return {
    sendActions: new SendActions(stores),
    web3Actions: new Web3Actions(stores),
  }
};
