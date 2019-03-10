/* @flow */
import React from 'react';
import PropTypes from 'prop-types'
// import EthereumTypeSendForm from './ethereum';
import BitcoinTypeSendForm from './bitcoin';

import {
  inject,
  observer,
} from 'mobx-react';

type Props = {
};

class AccountSend extends React.Component<Props> {
  render() {
    const { wallet } = this.props.appState;
    switch (wallet.network.type) {
      // case 'ethereum':
      //   return <EthereumTypeSendForm/>;
      case 'bitcoin':
        return <BitcoinTypeSendForm/>;
      default:
        return null;
    }
  }
}

AccountSend.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountSend));
