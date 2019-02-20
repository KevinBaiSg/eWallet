// @flow
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { MemoryRouter } from 'react-router-dom';
import { getPattern } from 'support/routes';
import { AppState } from '../store';
import Routes from '../Routes';

type Props = {
  appState: AppState,
  history: {}
};

export default class Root extends Component<Props> {
  render() {
    const { appState } = this.props;
    return (
      <Provider appState={appState}>
        <MemoryRouter initialEntries={[getPattern('landing-home')]}>
          <Routes />
        </MemoryRouter>
      </Provider>
    );
  }
}
