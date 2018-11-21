import AppState from './app-state';

export { AppState };

export default {
  AppState
};

export const createStoreMap = () => {
  return {
    appState: new AppState()
  };
};
