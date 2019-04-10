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

  async _changeLabel(label: string) {
    const device = this.appStore.eWalletDevice.device;
    if (!!device.connected) {
      Logger.debug(`device.connected = ${!!device.connected}`);
      const self = this;
      device.waitForSessionAndRun(async (session) => {
        try {
          session.on('button', type => {
            Logger.info(`session.on button ${type}`);
            switch (type) {
              case 'ButtonRequest_ProtectCall':
                this.deviceSettingStore.buttonRequest_ProtectCall = true;
                break;
            }
          });

          session.on('error', e => {
            Logger.info(`session.on error ${e}`);
            this.deviceSettingStore.buttonRequest_ProtectCall = false;
            this.appStore.addContextNotification({
              type: 'error',
              title: 'Session error',
              message: e.message || e,
              cancelable: true,
              actions: [],
            });
          });

          session.on('pin', (type, callback) => {
            Logger.info(`The session asks for PIN: TYPE = ${type}`);
            this.deviceSettingStore.buttonRequest_ProtectCall = false;
          });

          await session.changeLabel(label);
          const response = await session.getFeatures();
          const features = response.message;
          this.deviceSettingStore.buttonRequest_ProtectCall = false;
          this.appStore.eWalletDevice.features = features;
          this.appStore.eWalletDevice.label = features.label;
          this.deviceSettingStore.label = features.label;
        } catch (error) {
          console.error('Call rejected:', error);
          this.deviceSettingStore.buttonRequest_ProtectCall = false;
          this.appStore.addContextNotification({
            type: 'error',
            title: 'Session error',
            message: error.message || error,
            cancelable: true,
            actions: [],
          });
        }
      }).catch(function(error) {
        console.error('Call rejected:', error);
        self.deviceSettingStore.buttonRequest_ProtectCall = false;
        self.appStore.addContextNotification({
          type: 'error',
          title: 'Session error',
          message: error.message || error,
          cancelable: true,
          actions: [],
        });
      });
    }
  }

  @action
  onInit() {
    //
    this.deviceSettingStore.label = this.appStore.eWalletDevice.label;

    this.deviceSettingStore.isEdited = false;
  }

  @action
  changeLabel() {
    this._changeLabel(this.deviceSettingStore.label).then();
  }

  @action
  onLabelChange(label: string) {
    this.deviceSettingStore.isEdited = true;
    this.deviceSettingStore.label = label;
  }
}

export default DeviceSettingActions;
