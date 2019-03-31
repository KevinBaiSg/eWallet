// @flow
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { MemoryRouter } from 'react-router-dom';
import { getPattern } from 'support/routes';
// import { AppState } from '../store';
import Routes from '../Routes';

type Props = {
  store: any,
  actions: any,
  history: {}
};

export default class Root extends Component<Props> {
  render() {
    const { store, actions } = this.props;
    return (
      <Provider {...store} actions={actions}>
        <MemoryRouter initialEntries={[getPattern('landing-home')]}>
          <Routes />
        </MemoryRouter>
      </Provider>
    );
  }
}
