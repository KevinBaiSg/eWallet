import { action } from 'mobx';
import Web3Store from './Web3Store';
import Web3 from "web3";
const Logger = require('utils/logger').default;

export class Web3Actions {
  web3Store: Web3Store;

  constructor({ web3Store }) {
    this.web3Store = web3Store;
  }

  @action
  async getWeb3() {
    return new Promise(async (resolve, reject) => {
      Logger.debug('start getWeb3');

      if (this.web3Store.web3 && this.web3Store.web3.currentProvider.connected) {
        resolve(this.web3Store.web3);
        Logger.debug('resolve from cache');
        return;
      }

      const web3 = new Web3(
        new Web3.providers.WebsocketProvider('wss://eth2.trezor.io/geth'));
      const onConnect = async () => {
        this.web3Store.web3 = web3;
        Logger.debug('resolve create web3');
        resolve(this.web3Store.web3);
      };

      const onEnd = async () => {
        web3.currentProvider.reset();
        this.web3Store.web3 = null;
        Logger.debug('web3 connect onEnd');
        reject();
      };

      web3.currentProvider.on('connect', onConnect);
      web3.currentProvider.on('end', onEnd);
      web3.currentProvider.on('error', onEnd);
    });
  }

  @action
  async getGasPrice() {
    Logger.info('web3 getGasPrice start');
    try {
      const web3 = await this.getWeb3();
      return await web3.eth.getGasPrice();
    } catch (e) {
      Logger.debug(`web3 getGasPrice error: ${e}`);
      return Promise.reject(e);
    }
  }

  @action
  async getLatestBlock() {
    Logger.info('web3 getLatestBlock start');
    try {
      const web3 = await this.getWeb3();
      return await web3.eth.getBlockNumber();
    } catch (e) {
      Logger.debug(`web3 getLatestBlock error: ${e}`);
      return Promise.reject(e);
    }
  }
}

export default Web3Actions;
