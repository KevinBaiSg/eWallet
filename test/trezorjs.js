const trezor = require('trezor.js');
const bitcoin = require('bitcoinjs-lib-zcash');
const backend = require('../app/utils/backend');

// import { createBackend } from '../app/utils/backend'
// import * as bitcoin from "bitcoinjs-lib-zcash";
// import type { CoinInfo } from 'flowtype';

const debug = true;
const list = new trezor.DeviceList({debug});
const hardeningConstant = 0x80000000;
const bitCoinPath = [
  (44 | hardeningConstant) >>> 0,
  (0 | hardeningConstant) >>> 0,
  (0 | hardeningConstant) >>> 0,
  0,
  0
];
const BITCOIN_COIN_INFO = {
  name: 'Bitcoin',
  network: bitcoin.networks.bitcoin,
  segwitPubMagic: 77429938,
};

list.on('connect', (device) => {
  if (debug) {
    console.log(`Connected a device: ${device}`);
  }
  console.log(`Connected device ${device.features.label}`);

  device.on('disconnect', function() {
    if (debug) {
      console.log('Disconnected an opened device');
    }
  });

  device.waitForSessionAndRun(async (session) => {
    try {
      const backend = await createBackend(BITCOIN_COIN_INFO);
      console.log(backend);
    } catch (e) {
      console.error('Call rejected:', e);
    }
  }).catch(function(error) {
    console.error('Call rejected:', error);
  });
})

list.on('error', function (error) {
  console.error('List error:', error);
});

// you should do this to release devices on exit
process.on('exit', function() {
  list.onbeforeunload();
});
