import { observable, action } from 'mobx';
// import trezorLink from 'trezor-link';
// import { DeviceList } from 'trezor.js';

export default class AppState {
  @observable
  counter = 0;

  @action
  increment() {
    this.counter = this.counter + 1;
  }

  @action
  test() {
    this.counter = this.counter + 1;
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
}
