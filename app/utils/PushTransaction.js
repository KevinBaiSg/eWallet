/* @flow */

import { validateParams } from './helpers/paramsValidator';
import { getCoinInfo } from 'utils/data/CoinInfo';
import { NO_COIN_INFO } from 'constants/errors';
import { create as createBlockbookBackend } from 'utils/backend';
import type { CoinInfo } from 'utils/types';

type Params = {
    tx: string,
    coinInfo: CoinInfo,
}

export type ComposeTransactionOptions = {
  tx: string,
  coin: string,
};

export default class PushTransaction {
    params: Params;

    constructor(options: ComposeTransactionOptions) {
        // validate incoming parameters
        validateParams(options, [
            { name: 'tx', type: 'string', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const coinInfo: ?CoinInfo = getCoinInfo(options.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        if (coinInfo.type === 'bitcoin' && !/^[0-9A-Fa-f]*$/.test(options.tx)) {
            throw new Error('Invalid params: Transaction must be hexadecimal');
        }

        this.params = {
            tx: options.tx,
            coinInfo,
        };
    }

    async run(): Promise<{ txid: string }> {
      return await this.pushBlockbook();
    }

    async pushBlockbook(): Promise<{ txid: string }> {
        const { coinInfo } = this.params;
        const backend = await createBlockbookBackend(coinInfo);
        const txid: string = await backend.sendTransactionHex(this.params.tx);
        return {
            txid,
        };
    }
}
