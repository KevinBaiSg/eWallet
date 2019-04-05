import { action } from 'mobx';
import PinStore from './PinStore';
import AppState from './app-state';
import React from 'react';
import { Trans } from 'react-i18next';

const Logger = require('utils/logger').default;

export class PinActions {
  appStore: AppState;
  pinStore: PinStore;

  constructor({ appState, pinStore }) {
    this.appStore = appState;
    this.pinStore = pinStore;
  }

  @action
  verifyPin(pin: string) {
    const callback = this.appStore.eWalletDevice.pin_request_callback;
    this.appStore.eWalletDevice.pin_request_callback = null;
    this.appStore.eWalletDevice.pin_request = false;
    callback(null, pin);
  }
}

export default PinActions;
