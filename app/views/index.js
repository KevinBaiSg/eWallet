// @flow
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
// import { ConnectedRouter } from 'connected-react-router';
import { BrowserRouter } from 'react-router-dom';
// import type { Store } from '../reducers/types';
import { AppState } from '../store';
import Routes from '../Routes';

type Props = {
  appState: AppState,
  history: {}
};

export default class Root extends Component<Props> {
  render() {
    const { appState } = this.props;
    console.log(appState);
    return (
      <Provider appState={appState}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
  }
}
