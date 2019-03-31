import AppState from './app-state';
import SendStore from './SendStore';

import SendActions from './SendActions'

export {
  AppState,
  SendStore
};

export default {
  AppState,
  SendStore
};

export const CreateStoreMap = () => {
  return {
    appState: new AppState(),
    sendStore: new SendStore(),
  };
};

export const CreateActionMap = (stores) => {
  return {
    sendActions: new SendActions(stores),
  }
};
