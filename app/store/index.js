import AppState from './app-state';
import SendStore from './SendStore';
import Web3Store from './Web3Store';
import PinStore from './PinStore';

import SendActions from './SendActions';
import Web3Actions from './Web3Actions';
import PinActions from './PinActions'

export const CreateStoreMap = (history) => {
  return {
    appState: new AppState({history}),
    sendStore: new SendStore(),
    web3Store: new Web3Store(),
    pinStore: new PinStore(),
  };
};

export const CreateActionMap = (stores) => {
  return {
    sendActions: new SendActions(stores),
    web3Actions: new Web3Actions(stores),
    pinActions: new PinActions(stores),
  }
};
