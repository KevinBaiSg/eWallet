import { observable, action } from 'mobx';
// import {
//   DeviceList,
//   // MessageSignature,
//   // Transaction,
// } from 'trezor.js';

import { stringToHex } from 'utils/bufferUtils'
import * as bitcoin from "bitcoinjs-lib-zcash";
import {
  getCoinInfoByCurrency,
  parseCoinsJson,
} from 'utils/data/CoinInfo';
import { CoinsJson } from 'utils/data/coins'
import {create as createBackend} from 'utils/backend'

import {
  validateTrezorInputs,
  validateTrezorOutputs,
  inputToHD,
  getReferencedTransactions,
  transformReferencedTransactions,
} from 'utils/tx';
import { validateParams } from 'utils/helpers/paramsValidator';

import type { Transaction } from 'trezor.js/lib/session';
import type { BuildTxInput } from 'hd-wallet';

// const hardeningConstant = 0x80000000;
// const bitCoinPath = [
//   (44 | hardeningConstant) >>> 0,
//   (0 | hardeningConstant) >>> 0,
//   (0 | hardeningConstant) >>> 0,
//   0,
//   0
// ];
// const BITCOIN_COIN_INFO: CoinInfo = {
//   name: 'Bitcoin',
//   network: bitcoin.networks.bitcoin,
//   segwitPubMagic: 77429938,
//   blockbook: [
//     "https://btc1.trezor.io",
//     "https://btc2.trezor.io",
//     "https://btc3.trezor.io",
//     "https://btc4.trezor.io",
//     "https://btc5.trezor.io"
//   ],
//   bitcore: [],
// };

export default class AppState {
  @observable
  counter = 0;

  @action
  increment() {
    this.counter = this.counter + 1;
  }

  // @action
  async test2() {
    parseCoinsJson(CoinsJson);
    const coinInfo: ?CoinInfo = getCoinInfoByCurrency('bitcoin');
    console.log('log coinInfo');
    console.log(coinInfo);
    const backend = await createBackend(coinInfo);
    console.log('log backend');
    console.log(backend);

    const pinputs = [
      {
        address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 0],
        prev_index: 0,
        prev_hash: 'b035d89d4543ce5713c553d69431698116a822c57c03ddacf3f04b763d1999ac'
      }
    ];

    const poutputs = [
      {
        address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 1],
        amount: '3181747',
        script_type: 'PAYTOADDRESS'
      }, {
        address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
        amount: '200000',
        script_type: 'PAYTOADDRESS'
      }
    ];

    pinputs.forEach(utxo => {
      validateParams(utxo, [
        { name: 'amount', type: 'string' },
      ]);
    });

    poutputs.forEach(utxo => {
      validateParams(utxo, [
        { name: 'amount', type: 'string' },
      ]);
    });

    const inputs: Array<TransactionInput> = validateTrezorInputs(pinputs, coinInfo);
    const hdInputs: Array<BuildTxInput> = inputs.map(inputToHD);
    const outputs: Array<TransactionOutput> = validateTrezorOutputs(poutputs, coinInfo);

    const total: number = outputs.reduce((t, r) => t + r.amount, 0);
    if (total <= coinInfo.dustLimit) {
      throw new Error('Total amount is too low.');
    }

    const buildTxInput = getReferencedTransactions(hdInputs);
    console.log('buildTxInput');
    console.log(buildTxInput);
    const bjsRefTxs = await backend.loadTransactions(buildTxInput);
    console.log('bjsRefTxs');
    console.log(bjsRefTxs);
    const refTxs = transformReferencedTransactions(bjsRefTxs);
    console.log('refTxs');
    console.log(refTxs);
  }

  @action
  async test() {
    // this.counter = this.counter + 1;
    // const debug = true;
    // const list = new DeviceList({ debug: true });
    // list.on('connect', (device) => {
    //   if (debug) {
    //     console.log(`Connected a device: ${device}`);
    //   }
    //   console.log(`Connected device ${device.features.label}`);
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
    //
    //   device.waitForSessionAndRun(async (session) => {
    //     try {
    //       // get address
    //       // const result: MessageResponse<{
    //       //                   address: string;
    //       //                   path: Array<number>;
    //       //                 }> =
    //       //   await session.getAddress([
    //       //               (44 | hardeningConstant) >>> 0,
    //       //               (0 | hardeningConstant) >>> 0,
    //       //               (0 | hardeningConstant) >>> 0,
    //       //               0,
    //       //               0
    //       //             ], 'bitcoin', true);
    //       // console.log(`Bitcoin Address: ${result.message.address}`);
    //
    //       // sign message
    //       // const response: MessageSignature =
    //       //   await session.signMessage([
    //       //     (44 | hardeningConstant) >>> 0,
    //       //     (0 | hardeningConstant) >>> 0,
    //       //     (0 | hardeningConstant) >>> 0,
    //       //     0,
    //       //     0
    //       //   ], stringToHex('test'), 'Bitcoin', false)
    //       // console.log(response);
    //       // console.log(`signMessage address: ${response.message.address}; signature: ${response.message.signature}`);
    //
    //       // sign tx
    //       // const backend = await createBackend(BITCOIN_COIN_INFO);
    //       // const inputs = [
    //       //   {
    //       //     address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 0],
    //       //     prev_index: 0,
    //       //     prev_hash: 'b035d89d4543ce5713c553d69431698116a822c57c03ddacf3f04b763d1999ac'
    //       //   }
    //       // ];
    //       // const outputs = [
    //       //   {
    //       //     address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 1],
    //       //     amount: '3181747',
    //       //     script_type: 'PAYTOADDRESS'
    //       //   }, {
    //       //     address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    //       //     amount: '200000',
    //       //     script_type: 'PAYTOADDRESS'
    //       //   }
    //       // ];
    //
    //
    //       // const hdNode: bitcoin.HDNode = await session.getHDNode(path, 'Bitcoin');
    //       // console.log(`hdNode: ${hdNode}`);
    //       // console.log(hdNode);
    //       //
    //       //
    //       // let info: TxInfo = {};
    //       // let refTxs: Array<bitcoin.Transaction> = [{}];
    //       // let nodes: Array<bitcoin.HDNode> = [{}];
    //       // const result: Transaction = await session.signBjsTx(
    //       //   info, refTxs, nodes, 'Bitcoin'
    //       // );
    //     } catch (e) {
    //       console.error('Call rejected:', e);
    //     }
    //   }).catch(function (error) {
    //     console.error('Call rejected:', error);
    //   });

      // device.waitForSessionAndRun( (session) => {
      //   // this.backend = await createBackend(this.params.coinInfo);
      //   // const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(this.params.hdInputs));
      //   // return session.signBjsTx()
      // }).then((response: MessageSignature) => {
      //   console.log(response);
      //   console.log(`signMessage address: ${response.message.address}; signature: ${response.message.signature}`);
      // }).catch(function (error) {
      //   console.error('Call rejected:', error);
      // });
  //   })
  }
}
