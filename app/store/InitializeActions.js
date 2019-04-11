import { action } from 'mobx';
import AppState from './app-state';
import InitializeStore from './InitializeStore'
import React from 'react';

const Logger = require('utils/logger').default;

export class InitializeActions {
  appStore: AppState;
  initializeStore: InitializeStore;

  constructor({ appState, initializeStore }) {
    this.appStore = appState;
    this.initializeStore = initializeStore;
  }

  async resetDevice() {
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
                this.initializeStore.buttonRequest_ProtectCall = true;
                break;
              case 'ButtonRequest_ConfirmWord':
                this.initializeStore.buttonRequest_ConfirmWord = true;
                break;
            }
          });

          session.on('error', e => {
            Logger.info(`session.on error ${e}`);
            this.initializeStore.buttonRequest_ProtectCall = false;
            this.initializeStore.buttonRequest_ConfirmWord = false;
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
            this.initializeStore.buttonRequest_ProtectCall = false;
            this.initializeStore.buttonRequest_ConfirmWord = false;
          });

          await session.resetDevice({
            pin_protection: true,
            label: 'eWallet',
            skip_backup: false,
          });

          const response = await session.getFeatures();
          const features = response.message;
          this.appStore.eWalletDevice.features = features;
          this.appStore.eWalletDevice.label = features.label;
          this.initializeStore.buttonRequest_ProtectCall = false;
          this.initializeStore.buttonRequest_ConfirmWord = false;
          this.initializeStore.finished = true;
          this.appStore.eWalletDevice.isInitialized = true;
        } catch (error) {
          console.error('Call rejected:', error);
          this.initializeStore.buttonRequest_ProtectCall = false;
          this.initializeStore.buttonRequest_ConfirmWord = false;
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
        self.initializeStore.buttonRequest_ProtectCall = false;
        self.initializeStore.buttonRequest_ConfirmWord = false;
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

  async recoverDevice() {
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
                this.initializeStore.buttonRequest_ProtectCall = true;
                break;
              case 'ButtonRequest_ConfirmWord':
                this.initializeStore.buttonRequest_ConfirmWord = true;
                break;
            }
          });

          session.on('word', callback => {
            Logger.info(`session.on word`);
            this.initializeStore.pin_request_callback = callback;
            this.initializeStore.buttonRequest_ProtectCall = false;
            this.initializeStore.wordInputIsDisable = false;
          });

          session.on('error', e => {
            Logger.info(`session.on error ${e}`);
            this.initializeStore.buttonRequest_ProtectCall = false;
            this.initializeStore.buttonRequest_ConfirmWord = false;
            this.initializeStore.tryAgain = true;
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
            this.initializeStore.buttonRequest_ProtectCall = false;
            this.initializeStore.buttonRequest_ConfirmWord = false;
          });

          await session.recoverDevice({
            word_count: 12,
            pin_protection: true,
            label: 'eWallet',
            dry_run: false,
          });
          const response = await session.getFeatures();
          const features = response.message;
          this.appStore.eWalletDevice.features = features;
          this.appStore.eWalletDevice.label = features.label;
          
          this.initializeStore.buttonRequest_ProtectCall = false;
          this.initializeStore.buttonRequest_ConfirmWord = false;
          this.initializeStore.finished = true;
          this.appStore.eWalletDevice.isInitialized = true;
        } catch (error) {
          console.error('Call rejected:', error);
          this.initializeStore.buttonRequest_ProtectCall = false;
          this.initializeStore.buttonRequest_ConfirmWord = false;
          this.initializeStore.tryAgain = true;
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
        self.initializeStore.buttonRequest_ProtectCall = false;
        self.initializeStore.buttonRequest_ConfirmWord = false;
        self.initializeStore.tryAgain = true;
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
  onCreateWallet() {
    this.resetDevice()
      .catch(e => {
        Logger.error(e);
      });
  }

  @action
  onRecoverWallet() {
    this.recoverDevice()
      .catch(e => {
        Logger.error(e);
      });
  }

  @action
  reset() {
    this.initializeStore.finished = false;
  }

  @action
  onRecoveryWordChange(word) {
    this.initializeStore._word = word;
  }

  @action
  onClickWordConfirm() {
    const tryAgain = this.initializeStore.tryAgain;

    if (tryAgain) {
      this.initializeStore.tryAgain = false;

      this.appStore.cleanContextNotification();

      this.onRecoverWallet();
    } else {
      const callback = this.initializeStore.pin_request_callback;
      const word = this.initializeStore._word;

      this.initializeStore.pin_request_callback = null;
      this.initializeStore._word = '';
      this.initializeStore.wordInputIsDisable = true;

      callback(null, word);
    }
  }
}

export default InitializeActions;
