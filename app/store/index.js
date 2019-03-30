import AppState from './app-state';
import SendStore from './SendStore';

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
