/* @flow */

import React, { Component } from 'react';
import {
  inject,
  observer,
} from 'mobx-react'
import PropTypes from 'prop-types'
import { AppState } from 'store';
import LandingWrapper from 'views/Landing/components/LandingWrapper'

// import BetaDisclaimer from 'views/Landing/components/BetaDisclaimer';
// import ConnectDevice from 'views/Landing/components/ConnectDevice';

type Props = {
  appState: AppState,
};

class Root extends Component<Props> {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    const { appState } = this.props;

    if (!!appState.eWalletDevice.connected) {
      this.props.history.replace(`/device/${appState.eWalletDevice.features.device_id}`);
      return null
    }

    return (
      <LandingWrapper loading />
    );
  }
}

Root.propTypes = {
  appState: PropTypes.object.isRequired,
};

export default (inject((stores) => {
  return {
    appState: stores.appState,
  }
})(observer(Root)))




