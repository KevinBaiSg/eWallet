import { action } from 'mobx';
import AppState from './app-state';
import React from 'react';

const Logger = require('utils/logger').default;

export class InitializeActions {
  appStore: AppState;
  initializeStore: InitializeStore;

  constructor({ appState, initializeStore }) {
    this.appStore = appState;
    this.initializeStore = initializeStore;
  }

  @action
  onCreateWallet() {
    console.log('onCreateWallet');
  }

  @action
  onRecoverWallet() {
    console.log('onRecoverWallet');
  }
}

export default InitializeActions;
