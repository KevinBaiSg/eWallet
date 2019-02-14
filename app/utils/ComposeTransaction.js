/* @flow */

import * as trezor from 'utils/types/trezor';
import * as hdnodeUtils from 'utils/hdnode';
import { create as createDeferred } from 'utils/deferred';
import Discovery from 'utils/helpers/Discovery';
import { getCoinInfoByCurrency } from 'utils/data/CoinInfo';
import { validateParams } from 'utils/helpers/paramsValidator';
import { formatAmount } from 'utils/formatUtils';
import { NO_COIN_INFO } from 'constants/errors';

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
import { getSegwitNetwork, getBech32Network } from 'utils/data/CoinInfo';

import {
  isMultisigPath,
  isSegwitPath,
  isBech32Path,
  getSerializedPath,
  getScriptType
} from 'utils/pathUtils';

import type { CoinInfo } from 'flowtype';
import type { SignedTx } from 'utils/types/trezor';

import type {
    BuildTxOutputRequest,
    BuildTxResult,
} from 'hd-wallet';

type Params = {
    outputs: Array<BuildTxOutputRequest>,
    coinInfo: CoinInfo,
    push: boolean
};

export default class ComposeTransaction  {
    params: Params;

    backend: BlockBook;

    discovery: ?Discovery;

    composer: TransactionComposer;

    constructor(options) {

        this.session = options.session;
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
            session: options.session
        };
        this._getHDNode = this._getHDNode.bind(this);
        this.typedCall = this.typedCall.bind(this);
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

  async getBitcoinHDNode(
    path: Array<number>,
    coinInfo?: ?CoinInfo
  ): Promise<trezor.HDNodeResponse> {
    const suffix: number = 0;
    const childPath: Array<number> = path.concat([suffix]);


    const resKey: MessageResponse<trezor.PublicKey> =
      await this.getPublicKey(path, 'Bitcoin');
    const childKey: MessageResponse<trezor.PublicKey>=
      await this.getPublicKey(childPath, 'Bitcoin');
    const publicKey: trezor.PublicKey =
      hdnodeUtils.xpubDerive(resKey, childKey, suffix);

    const response: trezor.HDNodeResponse = {
      path,
      serializedPath: getSerializedPath(path),
      childNum: publicKey.node.child_num,
      xpub: coinInfo ? hdnodeUtils.convertBitcoinXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
      chainCode: publicKey.node.chain_code,
      publicKey: publicKey.node.public_key,
      fingerprint: publicKey.node.fingerprint,
      depth: publicKey.node.depth,
    };

    // if requested path is a segwit
    // convert xpub to new format
    if (coinInfo) {
      const segwitNetwork = getSegwitNetwork(coinInfo);
      if (segwitNetwork && isSegwitPath(path)) {
        response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, segwitNetwork);
      }
    }
    return response;
  }

  async getPublicKey(
    address_n: Array<number>,
    coin_name: string,
    script_type?: ?string,
  ): Promise<trezor.PublicKey> {
    const response: MessageResponse<trezor.PublicKey> =
      await this.session.typedCall('GetPublicKey', 'PublicKey', {
        address_n,
        coin_name,
        script_type,
      });
    return response.message;
  }

  async _getHDNode(path: Array<number>, coinInfo: ?CoinInfo): Promise<trezor.HDNodeResponse> {
    // return this._getBitcoinHDNode(path, coinInfo);
    // if (!this.device.atLeast(['1.7.2', '2.0.10']))
    const isOld = true;
    if (isOld) {
      return await this.getBitcoinHDNode(path, coinInfo);
    }
    if (!coinInfo) {
      return await this.getBitcoinHDNode(path);
    }

    const suffix: number = 0;
    const childPath: Array<number> = path.concat([suffix]);
    let network: ?bitcoin.Network;
    if (isMultisigPath(path)) {
      network = coinInfo.network;
    } else if (isSegwitPath(path)) {
      network = getSegwitNetwork(coinInfo);
    } else if (isBech32Path(path)) {
      network = getBech32Network(coinInfo);
    }

    let scriptType: ?string = getScriptType(path);
    if (!network) {
      network = coinInfo.network;
      if (scriptType !== 'SPENDADDRESS') {
        scriptType = undefined;
      }
    }

    const resKey: MessageResponse<trezor.PublicKey> =
      await this.getPublicKey(path, coinInfo.name, scriptType);
    const childKey: MessageResponse<trezor.PublicKey>=
      await this.getPublicKey(childPath, coinInfo.name, scriptType);
    const publicKey: trezor.PublicKey =
      hdnodeUtils.xpubDerive(resKey, childKey, suffix, network, coinInfo.network);

    const response: trezor.HDNodeResponse = {
      path,
      serializedPath: getSerializedPath(path),
      childNum: publicKey.node.child_num,
      // xpub: coinInfo ? hdnodeUtils.convertBitcoinXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
      xpub: publicKey.xpub,
      chainCode: publicKey.node.chain_code,
      publicKey: publicKey.node.public_key,
      fingerprint: publicKey.node.fingerprint,
      depth: publicKey.node.depth,
    };

    // if requested path is a segwit
    // convert xpub to new format
    // if (coinInfo) {
    //   const segwitNetwork = getSegwitNetwork(coinInfo);
    //   if (segwitNetwork && isSegwitPath(path)) {
    //     response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, segwitNetwork);
    //   }
    // }

    if (network !== coinInfo.network) {
      response.xpubSegwit = response.xpub;
      response.xpub = hdnodeUtils.convertXpub(publicKey.xpub, network, coinInfo.network);
    }
    return response;
  }

    async _getAccount(): Promise<Account | { error: string }> {
      // 替换自己的实现
      const discovery: Discovery = this.discovery || new Discovery({
          getHDNode: this._getHDNode,
          coinInfo: this.params.coinInfo,
          backend: this.backend,
      });

      const discoveryPromise: Deferred<void> = createDeferred();

      discovery.on('update', (accounts: Array<Account>) => {
        console.log('discovery.on update')
      });

      discovery.on('complete', (accounts: Array<Account>) => {
        console.log('discovery.on complete');
        discoveryPromise.resolve();
      });

      if (!this.discovery) {
          this.discovery = discovery;
      }
      discovery.start();

      // 增加 permise， 在 utils event complate 中完成
      await discoveryPromise.promise;
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

    async typedCall(type: string, resType: string, msg: Object): Promise<DefaultMessageResponse> {
      return this.session.typedCall(type, resType, msg);
    }

    async _send(feeLevel: string): Promise<SignedTx> {
        const tx: BuildTxResult = this.composer.composed[feeLevel];

        if (tx.type !== 'final') throw new Error('Trying to sign unfinished tx');

        const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(tx.transaction.inputs));
        const refTxs = transformReferencedTransactions(bjsRefTxs);

        const coinInfo: CoinInfo = this.composer.account.coinInfo;

        const response = await helper.signTx(
            this.typedCall,
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
