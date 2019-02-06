/* @flow */

import React from 'react';
import {
  inject,
  observer,
} from 'mobx-react'
import PropTypes from 'prop-types'
import { canUseDOM } from 'exenv'

// import { stringToHex } from 'utils/bufferUtils'
// import * as bitcoin from "bitcoinjs-lib-zcash";
// import {
//   getCoinInfoByCurrency,
//   parseCoinsJson,
// } from 'utils/data/CoinInfo';
// import { CoinsJson } from 'utils/data/coins'
// import {create as createBackend} from 'utils/backend'

// import { DeviceList } from 'trezor.js';
import LandingWrapper from 'views/Landing/components/LandingWrapper'

// import BetaDisclaimer from 'views/Landing/components/BetaDisclaimer';
// import ConnectDevice from 'views/Landing/components/ConnectDevice';

class Root extends React.Component {

  constructor() {
    super();
    // this.test3 = this.test3.bind(this)
  }
  //
  // async test3() {
  //   parseCoinsJson(CoinsJson);
  //   const coinInfo: ?CoinInfo = getCoinInfoByCurrency('bitcoin');
  //   console.log('log coinInfo');
  //   console.log(coinInfo);
  //   const backend = await createBackend(coinInfo);
  //   console.log('log backend');
  //   console.log(backend);
  //
  // }

  componentDidMount() {
    // const { appState } = this.props;
    // appState.test2();
    // window.ipcRenderer.send('synchronous-message', 'ping')
    // const debug = true;
    // const list = new DeviceList({ debug: true });
    // list.on('connect', function (device) {
    //   console.log('Connected a device:', device);
    //   console.log("Connected device " + device.features.label);
    //
    //   device.on('disconnect', function () {
    //     if (debug) {
    //       console.log('Disconnected an opened device');
    //     }
    //   });
    //
    //   // You generally want to filter out devices connected in bootloader mode:
    //   // if (device.isBootloader()) {
    //   //   throw new Error('Device is in bootloader mode, re-connected it');
    //   // }
    //
    //   var hardeningConstant = 0x80000000;
    //   device.waitForSessionAndRun(function (session) {
    //     return session.getAddress([
    //       (44 | hardeningConstant) >>> 0,
    //       (0 | hardeningConstant) >>> 0,
    //       (0 | hardeningConstant) >>> 0,
    //       0,
    //       0
    //     ], 'bitcoin', true)
    //   }).then(function (result) {
    //     console.log('Address:', result.message.address);
    //   }).catch(function (error) {
    //     // Errors can happen easily, i.e. when device is disconnected or request rejected
    //     // Note: if there is general error handler, that listens on device.on('error'),
    //     // both this and the general error handler gets called
    //     console.error('Call rejected:', error);
    //   });
    // })
  }

  // test(device) {
  //   console.log('=================2');
  //
  //   if (debug) {
  //     console.log(`DeviceList connect; Device: ${device}`);
  //   }
  //
  //   console.log("Connected device " + d.features.label);
  //
  //   device.on('disconnect', function () {
  //     if (debug) {
  //       console.log('Disconnected an opened device');
  //     }
  //   });
  //
  //   // You generally want to filter out devices connected in bootloader mode:
  //   if (device.isBootloader()) {
  //     throw new Error('Device is in bootloader mode, re-connected it');
  //   }
  // }

  render() {
    if (!canUseDOM) { return null }
    const { appState } = this.props;
    appState.test2();

    return (
      <LandingWrapper loading />
    );
  }
}

Root.propTypes = {
  appState: PropTypes.object.isRequired,
}

export default (inject((stores) => {
  return {
    appState: stores.appState,
  }
})(observer(Root)))


// list.on('connectUnacquired', u => {
//   console.log(`DeviceList connectUnacquired; UnacquiredDevice: ${u}`);
// });
//
// list.on('transport', t => {
//   console.log(`DeviceList  transport is successfully initialized; Transport: ${t}`);
// });
//
// list.on('disconnect', d => {
//   console.log(`DeviceList device is disconnected; Device: ${d}`);
// });
//
// list.on('disconnectUnacquired', u => {
//   console.log(`DeviceList unacquired device is disconnected; UnacquiredDevice: ${u}`);
// });
//
// list.on('error', e => {
//   console.log(`DeviceList initialization error: ${e}`);
// });



