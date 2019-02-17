/* @flow */

import React, { Component } from 'react';
import {
  inject,
  observer,
} from 'mobx-react'
import PropTypes from 'prop-types'
import { canUseDOM } from 'exenv'
import { AppState } from 'store';
import LandingWrapper from 'views/Landing/components/LandingWrapper'

type Props = {
  className?: string,
  appState: AppState,
};

class Root2 extends Component<Props> {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    if (!canUseDOM) { return null }

    const { appState } = this.props;

    if (appState.deviceConnected !== true) {
      this.props.history.replace('');
      return null
    }

    return (
      <LandingWrapper/>
    );
  }
}

Root2.propTypes = {
  appState: PropTypes.object.isRequired,
}

export default (inject((stores) => {
  return {
    appState: stores.appState,
  }
})(observer(Root2)))



