/* @flow */
'use strict';

// import AbstractMethod from './AbstractMethod';
import Discovery from 'utils/helpers/Discovery';
// import * as UI from '../../constants/ui';
import { getCoinInfoByCurrency } from 'utils/data/CoinInfo';
import { validateParams } from 'utils/helpers/paramsValidator';
import { resolveAfter } from 'utils/promiseUtils';
import { formatAmount } from 'utils/formatUtils';
import { NO_COIN_INFO } from 'utils/constants/errors';

import BlockBook, { create as createBackend } from 'utils/backend';
import Account from 'utils/account';
import TransactionComposer from 'utils/tx/TransactionComposer';
import {
    validateHDOutput,
    inputToTrezor,
    outputToTrezor,
    getReferencedTransactions,
    transformReferencedTransactions,
} from 'utils/tx';
import * as helper from 'utils/helpers/signtx';

// import { UiMessage } from '../../message/builder';

import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from 'utils/types';
import type { SignedTx } from 'utils/types/trezor';

import type {
    BuildTxOutputRequest,
    BuildTxResult,
} from 'hd-wallet';
import type { Options } from './backend/BlockBook';

type Params = {
    outputs: Array<BuildTxOutputRequest>,
    coinInfo: CoinInfo,
    push: boolean,
}

export default class ComposeTransaction  {
    params: Params;
    backend: BlockBook;
    discovery: ?Discovery;
    composer: TransactionComposer;

    constructor(options: Options) {
        // super(message);
        // this.requiredPermissions = ['read', 'write'];

        // validate incoming parameters
        validateParams(options, [
            { name: 'outputs', type: 'array', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'push', type: 'boolean' },
        ]);

        const coinInfo: ?CoinInfo = getCoinInfoByCurrency(options.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        // set required firmware from coinInfo support
        // this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];

        // validate each output and transform into hd-wallet format
        const outputs: Array<BuildTxOutputRequest> = [];
        let total: number = 0;
        options.outputs.forEach(out => {
            const output = validateHDOutput(out, coinInfo);
            if (typeof output.amount === 'number') {
                total += output.amount;
            }
            outputs.push(output);
        });

        const sendMax: boolean = outputs.find(o => o.type === 'send-max') !== undefined;

        // there should be only one output when using send-max option
        if (sendMax && outputs.length > 1) {
            throw new Error('Only one output allowed when using "send-max" option.');
        }

        // if outputs contains regular items
        // check if total amount is not lower than dust limit
        if (outputs.find(o => o.type === 'complete') !== undefined && total <= coinInfo.dustLimit) {
            throw new Error('Total amount is too low.');
        }

        if (sendMax) {
            this.info = 'Send maximum amount';
        } else {
            this.info = `Send ${ formatAmount(total, coinInfo) }`;
        }

        this.params = {
            outputs,
            coinInfo,
            push: options.hasOwnProperty('push') ? options.push : false,
        };
    }

    async run(): Promise<SignedTx> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);

        // discover accounts and run
        const account = await this._getAccount();
        if (account instanceof Account) {
            // wait for fee selection
            const response: string | SignedTx = await this._getFee(account);
            if (typeof response === 'string') {
                // back to account selection
                return await this.run();
            } else {
                return response;
            }
        } else {
            throw new Error(account.error);
        }
    }

    async _getAccount(): Promise<Account | { error: string }> {
        // 替换自己的实现
        const discovery: Discovery = this.discovery || new Discovery({
            getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
            coinInfo: this.params.coinInfo,
            backend: this.backend,
        });

      const initPromise: Deferred<void> = createDeferred();

        discovery.on('update', (accounts: Array<Account>) => {
          console.log('discovery.on update')
        });

        discovery.on('complete', (accounts: Array<Account>) => {
          console.log('discovery.on complete');
          initPromise.resolve();
        });

        if (!this.discovery) {
            this.discovery = discovery;
        }
        discovery.start();

        // 增加 permise， 在 utils event complate 中完成
        await initPromise.promise;
        discovery.removeAllListeners();
        discovery.stop();

        if (discovery.accounts.length === 0) {
          return 'not found account'
        }

        return discovery.accounts[0];
    }

    async _getFee(account: Account): Promise<string | SignedTx> {
        if (this.composer) { this.composer.dispose(); }

        const composer: TransactionComposer = new TransactionComposer(account, this.params.outputs);
        await composer.init(this.backend);
        this.composer = composer;

        const hasFunds: boolean = await composer.composeAllFeeLevels();
        if (!hasFunds) {
            return 'Not has Funds';
        }

        // 外部传入
        const feeLevel = this.composer.feeLevels[0];
        return await this._send(feeLevel.name);
    }

    async _send(feeLevel: string): Promise<SignedTx> {
        const tx: BuildTxResult = this.composer.composed[feeLevel];

        if (tx.type !== 'final') throw new Error('Trying to sign unfinished tx');

        const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(tx.transaction.inputs));
        const refTxs = transformReferencedTransactions(bjsRefTxs);

        const coinInfo: CoinInfo = this.composer.account.coinInfo;

        const response = await helper.signTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            tx.transaction.inputs.map(inp => inputToTrezor(inp, 0)),
            tx.transaction.outputs.sorted.map(out => outputToTrezor(out, coinInfo)),
            refTxs,
            coinInfo,
        );

        if (this.params.push) {
            const txid: string = await this.backend.sendTransactionHex(response.serializedTx);
            return {
                ...response,
                txid,
            };
        }

        return response;
    }

    dispose() {
        if (this.discovery) {
            const d = this.discovery;
            d.stop();
            d.removeAllListeners();
        }

        if (this.composer) {
            this.composer.dispose();
        }
    }
}
