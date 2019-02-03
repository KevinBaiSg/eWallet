/* @flow */

import React from 'react';
import {
  inject,
  observer,
} from 'mobx-react'
import PropTypes from 'prop-types'


import LandingWrapper from 'views/Landing/components/LandingWrapper';
// import trezorLink from 'trezor-link';
import { DeviceList } from 'trezor.js';
// import BetaDisclaimer from 'views/Landing/components/BetaDisclaimer';
// import ConnectDevice from 'views/Landing/components/ConnectDevice';

// var trezor = require('trezor.js');
// // const { BridgeV2 } = trezorLink;
// // const transport = new BridgeV2('http://localhost:21325');
// const debug = true;
// const deviceList = new trezor.DeviceList({ debug: debug });
//

class Root extends React.Component {

  constructor() {
    super();
    // const debug = true;
    // const list = new DeviceList({ debug: debug, transport });
    // this.list = new DeviceList({ debug: debug });
    // this.test = this.test.bind(this);
  }

  componentDidMount() {
    const { appState } = this.props;
    // appState.test();
    // window.ipcRenderer.send('synchronous-message', 'ping')
    const debug = true;
    const list = new DeviceList({ debug: true });
    list.on('connect', function (device) {
      console.log('Connected a device:', device);
      console.log("Connected device " + device.features.label);

      device.on('disconnect', function () {
        if (debug) {
          console.log('Disconnected an opened device');
        }
      });

      // You generally want to filter out devices connected in bootloader mode:
      // if (device.isBootloader()) {
      //   throw new Error('Device is in bootloader mode, re-connected it');
      // }

      var hardeningConstant = 0x80000000;
      device.waitForSessionAndRun(function (session) {
        return session.getAddress([
          (44 | hardeningConstant) >>> 0,
          (0 | hardeningConstant) >>> 0,
          (0 | hardeningConstant) >>> 0,
          0,
          0
        ], 'bitcoin', true)
      }).then(function (result) {
        console.log('Address:', result.message.address);
      }).catch(function (error) {
        // Errors can happen easily, i.e. when device is disconnected or request rejected
        // Note: if there is general error handler, that listens on device.on('error'),
        // both this and the general error handler gets called
        console.error('Call rejected:', error);
      });
    })
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



