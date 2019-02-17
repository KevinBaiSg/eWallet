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
  className?: string,
  appState: AppState,
};

class Root extends Component<Props> {

  constructor() {
    super();
  }

  componentDidMount() {
    const { appState } = this.props;
    appState.start();
  }

  render() {
    const { appState } = this.props;

    // if (appState.deviceConnected === true) {
    //   this.props.history.replace('/bridge');
    //   return null
    // }

    return (
      <LandingWrapper loading />
    );
  }
}

Root.propTypes = {
  appState: PropTypes.object.isRequired,
}

export default (inject((stores) => {
  return {
    appState: stores.appState,
  }
})(observer(Root)))




