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
  }

  componentDidMount() {
  }

  render() {
    if (!canUseDOM) { return null }
    const { appState } = this.props;
    // appState.test();
    appState.test4();

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



