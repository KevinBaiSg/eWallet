/* @flow */
'use strict';

import { validateParams } from './helpers/paramsValidator';
import { getEthereumNetwork } from 'utils/data/CoinInfo';
import Discovery from './helpers/Discovery';
import { NO_COIN_INFO } from 'constants/errors';

import BlockBook, { create as createBackend } from 'utils/backend';
import type { CoreMessage, EthereumNetworkInfo } from 'utils/types';
import type { EthereumAccount } from 'utils/types/account';
import type { Session as TrezorSession } from 'trezor.js';
import type { GetAccountInfoOptions } from './GetAccountInfo';
import Account from './account';

type Params = {
  account: EthereumAccount,
  coinInfo: EthereumNetworkInfo,
  // bundledResponse: boolean,
}

export type EthereumGetAccountInfoOptions = {
  coin?: string,
  account: EthereumAccount,
  session: TrezorSession,
};

export default class EthereumGetAccountInfo {
  params: Params;
  confirmed: boolean = false;
  backend: BlockBook;
  discovery: ?Discovery;

  constructor(options: EthereumGetAccountInfoOptions) {
    this.info = 'Export ethereum account info';
    this.useDevice = false;

    // const payload: Object = message.payload;
    // let bundledResponse: boolean = true;
    // // create a bundle with only one batch
    // if (!options.hasOwnProperty('accounts')) {
    //   options.accounts = [...options.account];
    //   bundledResponse = false;
    // }

    // validate incoming parameters
    validateParams(options, [
      { name: 'account', type: 'object', obligatory: true },
      { name: 'coin', type: 'string', obligatory: true }
    ]);

    validateParams(options.account, [
      { name: 'address', type: 'string', obligatory: true },
      { name: 'block', type: 'number', obligatory: true },
      { name: 'transactions', type: 'number', obligatory: true }
    ]);

    const network: ?EthereumNetworkInfo = getEthereumNetwork(options.coin);
    if (!network) {
      throw NO_COIN_INFO;
    }

    this.params = {
      account: options.account,
      coinInfo: network,
      // bundledResponse
    };
  }

  async run(): Promise<EthereumAccount | Array<EthereumAccount>> {
    // initialize backend
    this.backend = await createBackend(this.params.coinInfo);

    const blockchain = this.backend.blockchain;
    const { height } = await blockchain.lookupSyncStatus();

    const account = this.params.account;
    const method = 'getAddressHistory';
    const params = [
      [account.address],
      {
        start: height,
        end: account.block,
        from: 0,
        to: 0,
        queryMempol: false
      }
    ];
    const socket = await blockchain.socket.promise;
    const confirmed = await socket.send({ method, params });

    return {
      address: account.address,
      transactions: confirmed.totalCount,
      block: height,
      balance: '0', // TODO: fetch balance from blockbook
      availableBalance: '0', // TODO: fetch balance from blockbook
      nonce: 0 // TODO: fetch nonce from blockbook
    };

    /*
    // This will be useful for BTC-like accounts (multi addresses)
    const addresses: Array<string> = this.params.accounts.map(a => a.address);

    const socket = await blockchain.socket.promise;
    const method = 'getAddressHistory';
    const params = [
        addresses,
        {
            start: height,
            end: 0,
            from: 0,
            to: 0,
            queryMempol: true
        }
    ];

    const response = await socket.send({method, params});
    return {
        address: addresses[0],
        transactions: response.totalCount,
        block: height
    }
    */
  }
}
