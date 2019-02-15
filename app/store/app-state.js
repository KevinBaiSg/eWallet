import { observable, action } from 'mobx';

import {
  DeviceList,
} from 'trezor.js';

export default class AppState {
  @observable
  connected = false;

  // @observable
  // deviceSession =

  @action
  async connectDevice() {
    const debug = true;
    const list = new DeviceList({ debug: true });
    list.on('connect', (device) => {
      if (debug) {
        console.log(`Connected a device: ${device}`);
      }
      console.log(`Connected device ${device.features.label}`);

      device.on('disconnect', function () {
        if (debug) {
          console.log('Disconnected an opened device');
        }
      });

      device.waitForSessionAndRun(async (session) => {
        try {
          const result: MessageResponse<{
            address: string;
            path: Array<number>;
          }> =
            await session.getAddress([
              (44 | hardeningConstant) >>> 0,
              (0 | hardeningConstant) >>> 0,
              (0 | hardeningConstant) >>> 0,
              0,
              0
            ], 'bitcoin', true);
          console.log(`Bitcoin Address: ${result.message.address}`);
        } catch (e) {
          console.error('Call rejected:', e);
        }
      }).catch(function (error) {
        console.error('Call rejected:', error);
      });
    })
  }
}
