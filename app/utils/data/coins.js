export const CoinsJson =
  {
    'bitcoin': [
      {
        'address_type': 0,
        'address_type_p2sh': 5,
        'bech32_prefix': 'bc',
        'bip115': false,
        'bitcore': [],
        'blockbook': [
          'https://btc1.trezor.io',
          'https://btc2.trezor.io',
          'https://btc3.trezor.io',
          'https://btc4.trezor.io',
          'https://btc5.trezor.io'
        ],
        'blocktime_seconds': 600,
        'cashaddr_prefix': null,
        'coin_label': 'Bitcoin',
        'coin_name': 'Bitcoin',
        'coin_shortcut': 'BTC',
        'curve_name': 'secp256k1',
        'decred': false,
        'default_fee_b': {
          'Economy': 3,
          'High': 26,
          'Low': 1,
          'Normal': 23
        },
        'dust_limit': 546,
        'force_bip143': false,
        'fork_id': null,
        'hash_genesis_block': '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        'max_address_length': 34,
        'maxfee_kb': 2000000,
        'min_address_length': 27,
        'minfee_kb': 1000,
        'name': 'Bitcoin',
        'segwit': true,
        'shortcut': 'BTC',
        'signed_message_header': 'Bitcoin Signed Message:\n',
        'slip44': 0,
        'support': {
          'connect': true,
          'trezor1': '1.5.2',
          'trezor2': '2.0.5',
          'webwallet': true
        },
        'xprv_magic': 76066276,
        'xpub_magic': 76067358,
        'xpub_magic_segwit_native': 78792518,
        'xpub_magic_segwit_p2sh': 77429938
      },
    ],
    'erc20': [],
    'eth': [
      {
        'blockbook': [
          'https://eth1.trezor.io',
          'https://eth2.trezor.io'
        ],
        'chain': 'eth',
        'chain_id': 1,
        'name': 'Ethereum',
        'rskip60': false,
        'shortcut': 'ETH',
        'slip44': 60,
        'support': {
          'connect': true,
          'trezor1': '1.6.2',
          'trezor2': '2.0.7',
          'webwallet': true
        },
        'url': 'https://www.ethereum.org'
      },
    ]
  };
