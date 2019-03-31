import { action } from 'mobx';
import EthereumjsUnits from "ethereumjs-units";
import EthereumjsUtil from "ethereumjs-util";
import BigNumber from "bignumber.js";
import type { parsedURI } from 'utils/cryptoUriParser';
import { Logger } from 'utils/logger';
import SendStore from './SendStore';
import AppState from './app-state';

const NUMBER_RE: RegExp = new RegExp('^(0|0\\.([0-9]+)?|[1-9][0-9]*\\.?([0-9]+)?|\\.[0-9]+)$');
const UPPERCASE_RE = new RegExp('^(.*[A-Z].*)$');

export class SendActions {
  appStore: AppState;
  sendStore: SendStore;

  constructor({ appState, sendStore }) {
    this.appStore = appState;
    this.sendStore = sendStore;
  }
  @action async fetch() {
    Logger.info('fetch start');
  }

  @action
  onClear() {
    this.sendStore.address = '';

    this.sendStore.addressErrors = null;
    this.sendStore.addressWarnings = null;
    this.sendStore.addressInfos = null;
    // for amount
    this.sendStore.amount = '';
    this.sendStore.amountErrors = null;
    this.sendStore.amountWarnings = null;
    this.sendStore.amountInfos = null;
    this.sendStore.isSetMax = false;
    //
    this.sendStore.isSending = false;
  }

  @action
  onAddressChange(address: string) {
    const {sendStore} = this;

    if (address.length < 1) {
      sendStore.addressErrors = 'Address is not set';
    } else if (!EthereumjsUtil.isValidAddress(address)) {
      sendStore.addressErrors = 'Address is not valid';
    } else if (address.match(UPPERCASE_RE) &&
      !EthereumjsUtil.isValidChecksumAddress(address)) {
      sendStore.addressErrors = 'Address is not a valid checksum';
    } else {
      sendStore.addressErrors = null;
      sendStore.addressWarnings = null;
      sendStore.addressInfos = null;
    }

    sendStore.address = address;
  }

  @action
  onAmountChange(amount: string) {
    const {sendStore} = this;

    if (amount.length < 1) {
      sendStore.amountErrors = 'Amount is not set';
    } else if (amount.length > 0 && !amount.match(NUMBER_RE)) {
      sendStore.amountErrors = 'Amount is not a number';
    } else {
      sendStore.amountErrors = null;
      sendStore.amountWarnings = null;
      sendStore.amountInfos = null;
    }

    sendStore.amount = amount;
  }

  @action
  openQrModal() {
    this.sendStore.isQrScanning = true;
  }

  @action
  onQrScanCancel() {
    this.sendStore.isQrScanning = false;
  }

  @action
  onQrScan(parsedUri: parsedURI) {
    const {sendStore} = this;
    const { address = '', amount } = parsedUri;
    if (amount) {
      sendStore.amount = amount;
    }

    sendStore.address = address;
    this.onAddressChange(address);
  }

  @action
  onFeeLevelChange(selectedFee) {
    this.sendStore.selectedFee = selectedFee;
  }

  @action
  setNetworkby(shortcut: string) {
    const { localStorage } = this.appStore;

    const networks = localStorage.networks
      .filter(n => n.shortcut.toLowerCase() === shortcut.toLowerCase());
    if (networks && networks.length >= 0) {
      this.sendStore.network = networks[0];
    }
  }

  @action
  async updateEthereumFeeLevels() {
    try {
      const web3Instance = await this.appStore.getWeb3Instance();
      const symbol = this.sendStore.network.shortcut;
      const gasLimit = web3Instance.defaultGasLimit;
      const gasPrice = web3Instance.gasPrice === 0 ?
        web3Instance.defaultGasPrice : web3Instance.gasPrice;
      const price: BigNumber = typeof gasPrice === 'string' ?
        new BigNumber(gasPrice) : gasPrice;
      const quarter: BigNumber = price.dividedBy(4);
      const high: string = price.plus(quarter.times(2)).toFixed();
      const low: string = price.minus(quarter.times(2)).toFixed();
      this.sendStore.feeLevels = [
        {
          value: 'High',
          gasPrice: high,
          label: `${SendActions.calculateFee(high, gasLimit)} ${symbol}`,
        },
        {
          value: 'Normal',
          gasPrice: gasPrice.toString(),
          label: `${SendActions.calculateFee(price.toFixed(), gasLimit)} ${symbol}`,
        },
        {
          value: 'Low',
          gasPrice: low,
          label: `${SendActions.calculateFee(low, gasLimit)} ${symbol}`,
        },
      ];
    } catch (e) {
      console.log(e);
    }
  };

  static calculateFee(gasPrice: string, gasLimit: string): string {
    try {
      return EthereumjsUnits.convert(
        new BigNumber(gasPrice).times(gasLimit).toFixed(), 'gwei', 'ether');
    } catch (error) {
      return '0';
    }
  };

  static calculateTotal(amount: string, gasPrice: string, gasLimit: string): string {
    try {
      return new BigNumber(amount).plus(
        SendStore.calculateFee(gasPrice, gasLimit)).toFixed();
    } catch (error) {
      return '0';
    }
  };

  static calculateMaxAmount(balance: BigNumber, gasPrice: string, gasLimit: string): string {
    try {
      // TODO - minus pendings
      const fee = SendStore.calculateFee(gasPrice, gasLimit);
      const max = balance.minus(fee);
      if (max.lessThan(0)) return '0';
      return max.toFixed();
    } catch (error) {
      return '0';
    }
  };

  getFeeLevels(symbol: string,
               gasPrice: BigNumber | string,
               gasLimit: string): Array<FeeLevel> {
    const price: BigNumber = typeof gasPrice === 'string' ? new BigNumber(gasPrice) : gasPrice;
    const quarter: BigNumber = price.dividedBy(4);
    const high: string = price.plus(quarter.times(2)).toFixed();
    const low: string = price.minus(quarter.times(2)).toFixed();

    return [
      {
        value: 'High',
        gasPrice: high,
        label: `${this.calculateFee(high, gasLimit)} ${symbol}`,
      },
      {
        value: 'Normal',
        gasPrice: gasPrice.toString(),
        label: `${this.calculateFee(price.toFixed(), gasLimit)} ${symbol}`,
      },
      {
        value: 'Low',
        gasPrice: low,
        label: `${this.calculateFee(low, gasLimit)} ${symbol}`,
      },
    ];
  };
}

export default SendActions;
