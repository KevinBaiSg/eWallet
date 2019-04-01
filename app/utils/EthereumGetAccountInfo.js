/* @flow */
'use strict';

import { validateParams } from './helpers/paramsValidator';
import { getEthereumNetwork } from 'utils/data/CoinInfo';
import Discovery from './helpers/Discovery';
import { NO_COIN_INFO } from 'constants/errors';
import BlockBook, { create as createBackend } from 'utils/backend';
import type { CoreMessage, EthereumNetworkInfo } from 'utils/types';
import type { EthereumAccount } from 'utils/types/account';
import type { Session } from 'trezor.js';
import type { Web3Instance } from 'store/app-state';
import EthereumjsUnits from 'ethereumjs-units';

type Params = {
  account: EthereumAccount,
  coinInfo: EthereumNetworkInfo,
  session: Session,
  web3Instance: Web3Instance
}

export type EthereumGetAccountInfoOptions = {
  coin?: string,
  account: EthereumAccount,
  session: Session,
  web3Instance: Web3Instance
};

export default class EthereumGetAccountInfo {
  params: Params;
  confirmed: boolean = false;
  backend: BlockBook;
  discovery: ?Discovery;
  web3Instance: any = null;

  constructor(options: EthereumGetAccountInfoOptions) {
    this.info = 'Export ethereum account info';

    validateParams(options, [
      { name: 'account', type: 'object', obligatory: true },
      { name: 'coin', type: 'string', obligatory: true },
      // { name: 'session', type: 'Session', obligatory: true },
      // { name: 'web3Instance', type: 'Web3Instance', obligatory: true },
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
      session: options.session,
      web3Instance: options.web3Instance,
    };
  }

  async run(): Promise<EthereumAccount | Array<EthereumAccount>> {
    try {
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
      // get balance by web3
      const balance = await this.params.web3Instance.web3.eth.getBalance(account.address);
      const nonce = await this.params.web3Instance.web3.eth.getTransactionCount(account.address);

      return {
        success: true,
        address: account.address,
        transactions: confirmed.totalCount,
        block: height,
        balance: EthereumjsUnits.convert(balance, 'wei', 'ether'),
        availableBalance: EthereumjsUnits.convert(balance, 'wei', 'ether'),
        nonce: nonce,
      };
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }
}
