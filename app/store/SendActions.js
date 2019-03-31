import { observable, action } from 'mobx';
import { Logger } from 'utils/logger';
import SendStore from './SendStore';
import AppState from './app-state';

class SendActions {
  appStore: AppState;
  sendStore: SendStore;

  constructor({ appStore, sendStore }) {
    this.appStore = appStore;
    this.sendStore = sendStore;
  }
  @action async fetch() {
    Logger.info('fetch start');
  }
}

export default SendActions;
