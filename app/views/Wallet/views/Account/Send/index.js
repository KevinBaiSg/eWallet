/* @flow */
import React from 'react';
import EthereumTypeSendForm from './ethereum';
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
      case 'ethereum':
        return <EthereumTypeSendForm />;
      default:
        return null;
    }
  }
}

AccountSend.propTypes = {
  // appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(AccountSend));
