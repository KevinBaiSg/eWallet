'use strict';

// installed from npm
// var trezor = require('trezor.js');
// var trezor = require('trezor.js');
var trezor = require('./trezor.js/src/index-node.js')
// set to true to see messages
var debug = true;

// DeviceList encapsulates transports, sessions, device enumeration and other
// low-level things, and provides easy-to-use event interface.
var list = new trezor.DeviceList({debug: debug});

list.on('connect', function (device) {
  if (debug) {
    console.log('Connected a device:', device);
    console.log('Devices:', list.asArray());
  }
  console.log("Connected device " + device.features.label);

  // For convenience, device emits 'disconnect' event on disconnection.
  device.on('disconnect', function () {
    if (debug) {
      console.log('Disconnected an opened device');
    }
  });

  // You generally want to filter out devices connected in bootloader mode:
  if (device.isBootloader()) {
    throw new Error('Device is in bootloader mode, re-connected it');
  }

  var hardeningConstant = 0x80000000;

  device.waitForSessionAndRun(function (session) {
    return session.getAddress([
      (44 | hardeningConstant) >>> 0,
      (0 | hardeningConstant) >>> 0,
      (0 | hardeningConstant) >>> 0,
      0,
      0
    ], 'bitcoin', true)
  })
    .then(function (result) {
      console.log('Address:', result.message.address);
    })

  .catch(function (error) {
    // Errors can happen easily, i.e. when device is disconnected or request rejected
    // Note: if there is general error handler, that listens on device.on('error'),
    // both this and the general error handler gets called
    console.error('Call rejected:', error);
  });
});

// Note that this is a bit duplicate to device.on('disconnect')
list.on('disconnect', function (device) {
  if (debug) {
    console.log('Disconnected a device:', device);
    console.log('Devices:', list.asArray());
  }
  console.log("Disconnected device " + device.features.label);
});

// This gets called on general error of the devicelist (no transport, etc)
list.on('error', function (error) {
  console.error('List error:', error);
});

// you should do this to release devices on exit
process.on('exit', function() {
  list.onbeforeunload();
});

