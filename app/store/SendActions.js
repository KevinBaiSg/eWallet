import { action } from 'mobx';
import EthereumjsUnits from "ethereumjs-units";
import EthereumjsUtil from "ethereumjs-util";
import BigNumber from "bignumber.js";
import { toHex } from 'web3-utils';
import type { parsedURI } from 'utils/cryptoUriParser';
import {sanitizeHex} from 'utils/ethUtils';
import type { Session } from 'trezor.js';
import EthereumjsTx from 'ethereumjs-tx';
import SendStore from './SendStore';
import AppState from './app-state';
import type { Transaction as EthereumTransaction } from 'utils/types/ethereum';
import { stripHexPrefix } from 'utils/ethereumUtils';
import PushTransaction from 'utils/PushTransaction'
import React from 'react';
import Link from 'components/Link';
const Logger = require('utils/logger').default;

const NUMBER_RE: RegExp = new RegExp('^(0|0\\.([0-9]+)?|[1-9][0-9]*\\.?([0-9]+)?|\\.[0-9]+)$');
const UPPERCASE_RE = new RegExp('^(.*[A-Z].*)$');

export class SendActions {
  appStore: AppState;
  sendStore: SendStore;

  constructor({ appState, sendStore }) {
    this.appStore = appState;
    this.sendStore = sendStore;
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

  @action
  async onSend() {
    this.sendStore.isSending = true;

    const device = this.appStore.eWalletDevice.device;
    if (!!device) {
      device.waitForSessionAndRun(async (session: Session) => {
        session.on('button', type => {
          Logger.info(`session.on button ${type}`);
          switch (type) {
            case 'ButtonRequest_ConfirmOutput':
              this.sendStore.buttonRequest_ConfirmOutput = true;
              break;
            case 'ButtonRequest_SignTx':
              this.sendStore.buttonRequest_SignTx = true;
              break;
          }
        });

        session.on('error', e => {
          Logger.info(`session.on error ${e}`);
          this.sendStore.buttonRequest_ConfirmOutput = false;
          this.sendStore.buttonRequest_SignTx = false;
          this.appStore.addContextNotification({
            type: 'error',
            title: 'Session error',
            message: e.message || e,
            cancelable: true,
            actions: [],
          });
        });

        try {
          const web3Instance = await this.appStore.getWeb3Instance();
          const tx = this.prepareEthereumTxRequest(web3Instance);
          const txData = this.prepareEthereumTx(web3Instance, tx);
          // copy txData and remove hex prefix
          const txStripHexPrefix =  Object.assign({}, txData);

          Object.keys(txStripHexPrefix).map(key => {
            if (typeof txStripHexPrefix[key] === 'string') {
              let value: string = stripHexPrefix(txStripHexPrefix[key]);
              // pad left even
              if (value.length % 2 !== 0) { value = '0' + value; }
              // $FlowIssue
              txStripHexPrefix[key] = value;
            }
          });

          const address_n = [44 | 0x80000000, 60 | 0x80000000, 0 | 0x80000000, 0, 0];
          const signed = await session.signEthTx(
            address_n,
            txStripHexPrefix.nonce,
            txStripHexPrefix.gasPrice,
            txStripHexPrefix.gasLimit,
            txStripHexPrefix.to,
            txStripHexPrefix.value,
            txStripHexPrefix.data,
            txStripHexPrefix.chainId);
          txData.r = EthereumjsUtil.addHexPrefix(signed.r);
          txData.s = EthereumjsUtil.addHexPrefix(signed.s);
          if (typeof signed.v === 'string') {
            txData.v = EthereumjsUtil.addHexPrefix(signed.v);
          } else {
            txData.v = toHex(signed.v);
          }
          Logger.debug('txData: ', txData);

          const serializedTx: string = await SendActions.serializeEthereumTx(txData);
          Logger.debug('serializedTx: ', serializedTx);

          const compose = new PushTransaction({
            tx: serializedTx,
            coin: 'ethereum',
          });
          const txid = await compose.run();
          Logger.debug('txid: ', txid);

          const externalAddress = `https://etherscan.io/tx/${txid}`;
          this.appStore.addContextNotification({
            type: 'success',
            title: 'Transaction success',
            message: <Link openExternal={externalAddress} isGray>See transaction detail</Link>,
            cancelable: true,
            actions: [],
          });

          this.upgradeNonce();
          this.onClear();
          this.sendStore.isSending = false;
          this.sendStore.buttonRequest_ConfirmOutput = false;
          this.sendStore.buttonRequest_SignTx = false;
        } catch (e) {
          this.sendStore.isSending = false;
          this.sendStore.buttonRequest_ConfirmOutput = false;
          this.sendStore.buttonRequest_SignTx = false;
          this.appStore.addContextNotification({
            type: 'error',
            title: 'Transaction error',
            message: e.message || e,
            cancelable: true,
            actions: [],
          });
        }
      }).catch((e) => {
        this.sendStore.isSending = false;
        this.appStore.addContextNotification({
          type: 'error',
          title: 'Transaction error',
          message: e.message || e,
          cancelable: true,
          actions: [],
        });
      })
    }
  }

  upgradeNonce() {
    const { accountEth } = this.appStore.wallet;
    accountEth.nonce ++;
  }

  prepareEthereumTxRequest(web3Instance) {
    const gasLimit = web3Instance.defaultGasLimit.toString();
    const { accountEth } = this.appStore.wallet;
    const fromAddress = accountEth.address;
    const toAddress = this.sendStore.address;
    const amount = this.sendStore.amount;
    const selectedFeeLevel = this.sendStore.selectedFeeLevel;
    const gasPrice = selectedFeeLevel.gasPrice;
    const network = this.sendStore.network;
    const nonce = accountEth.nonce;

    return {
      network: network.shortcut,
      token: null,
      from: fromAddress,
      to: toAddress,
      amount: amount,
      data: '', // TODO: support data
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      nonce,
    };
  }

  prepareEthereumTx(web3Instance, tx: EthereumTxRequest): Promise<EthereumTransaction> {
    const { token } = tx;
    let data: string = tx.data;
    let value: string = toHex(EthereumjsUnits.convert(tx.amount, 'ether', 'wei'));
    let to: string = tx.to; // eslint-disable-line prefer-destructuring
    if (token) {
      // smart contract transaction
      const contract = web3Instance.erc20.clone();
      contract.options.address = token.address;
      const tokenAmount: string = new BigNumber(tx.amount).times(10 ** token.decimals).toString(10);
      data = web3Instance.erc20.methods.transfer(to, tokenAmount).encodeABI();
      value = '0x00';
      to = token.address;
    }
    const gasLimit = toHex(tx.gasLimit);
    const gasPrice = toHex(EthereumjsUnits.convert(tx.gasPrice, 'gwei', 'wei'));
    const nonce = toHex(tx.nonce);
    return {
      to,
      value,
      data,
      chainId: web3Instance.chainId,
      nonce: nonce,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };
  };

  static serializeEthereumTx(tx: EthereumTransaction): Promise<string> {
    const ethTx = new EthereumjsTx(tx);
    return `0x${ethTx.serialize().toString('hex')}`;
  };

  static calculateFee(gasPrice: string, gasLimit: string): string {
    try {
      return EthereumjsUnits.convert(
        new BigNumber(gasPrice).times(gasLimit).toFixed(), 'gwei', 'ether');
    } catch (error) {
      return '0';
    }
  };
}

export default SendActions;
