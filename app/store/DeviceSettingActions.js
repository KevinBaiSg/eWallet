import { action } from 'mobx';
import AppState from './app-state';
import DeviceSettingStore from './DeviceSettingStore'
import React from 'react';

const Logger = require('utils/logger').default;

export class DeviceSettingActions {
  appStore: AppState;
  deviceSettingStore: DeviceSettingStore;

  constructor({ appState, deviceSettingStore }) {
    this.appStore = appState;
    this.deviceSettingStore = deviceSettingStore;
  }

  @action
  onCreateWallet() {
  }
}

export default DeviceSettingActions;
