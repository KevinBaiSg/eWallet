import { observable, action } from 'mobx';
import Logger from 'js-logger';
// import type { Session as TrezorSession } from 'trezor.js';
import { BridgeV2 as Transport } from 'trezor-link';

import configLocal from '../static/config_signed.bin';
import { DeviceList } from 'trezor.js';
import { httpRequest } from 'utils/networkUtils';
import type {Features} from 'trezor.js';
import { parseCoinsJson } from 'utils/data/CoinInfo';
import { CoinsJson } from 'utils/data/coins'

const EWALLETD_URL = `http://127.0.0.1:58567`;
const EWALLETD_NEWVERSION = '2.0.25';

Logger.useDefaults();

let deviceDebug: boolean = false;

if (process.env.NODE_ENV === 'development') {
  Logger.setLevel(Logger.DEBUG);
  deviceDebug = true;
} else if (process.env.DEBUG_PROD === 'true') {
  Logger.setLevel(Logger.INFO);
} else {
  Logger.setLevel(Logger.WARN);
}

export type EWalletDevice = {
  label: string,
  // features
  // pin_protection: boolean,
  // passphrase_protection: boolean,
  // device_id: string,
  firmware: string,
  features: Features,
  connected: boolean; // device is connected
};

export type Wallet = {
  dropdownOpened: boolean;
};

export default class AppState {

  @observable
  eWalletDevice: EWalletDevice = {
    firmware: '',
    features: null,
    connected: false,
  };

  @observable
  wallet: Wallet = {
    dropdownOpened: false,
  };

  cleanDevice() {
    this.eWalletDevice.firmware = '';
    this.eWalletDevice.features = null;
    this.eWalletDevice.connected = false;
  }

  cleanWallet() {
    this.wallet.dropdownOpened = false;
  }

  @action
  async start() {
    // load coin information
    parseCoinsJson(CoinsJson);
    Logger.info('Loaded coin information');
    // load configuration from local
    const config = await httpRequest(configLocal);
    Logger.info('Loaded device configuration');
    Logger.debug('configuration: ', config);

    // Logger.debug(`set transport; url: ${EWALLETD_URL}; newVersion: ${EWALLETD_NEWVERSION}`);
    // const transport = new Transport(EWALLETD_URL, null, EWALLETD_NEWVERSION);
    const transport = new Transport(EWALLETD_URL);

    const list = new DeviceList({
      debug: deviceDebug,
      debugInfo: deviceDebug,
      transport,
      config });

    list.on('connect', (device) => {
      const self: AppState = this;
      self.eWalletDevice.features = device.features;
      self.eWalletDevice.connected = true;
      self.eWalletDevice.firmware = device.getVersion();
      Logger.info(`Connected device: ${self.eWalletDevice.label}; 
                    firmware Version: ${self.eWalletDevice.firmware}`);

      device.on('disconnect', function() {
        self.cleanDevice();
        self.cleanWallet();
        Logger.info('Disconnected an opened device');
      });
    });

    list.on('connectUnacquired', u => {
      Logger.info(`DeviceList connectUnacquired; UnacquiredDevice: ${u}`);
    });

    list.on('transport', t => {
      Logger.info(`DeviceList  transport is successfully initialized; Transport: ${t}`);
    });

    list.on('disconnect', d => {
      Logger.info(`DeviceList device is disconnected; Device: ${d}`);
    });

    list.on('disconnectUnacquired', u => {
      Logger.info(`DeviceList unacquired device is disconnected; UnacquiredDevice: ${u}`);
    });

    list.on('error', e => {
      Logger.info(`DeviceList initialization error: ${e}`);
    });
  }
}
