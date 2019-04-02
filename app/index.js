import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Normalize } from 'styled-normalize';
import BaseStyles from 'support/styles';
import Root from './containers/Root';
import { configureStore, configureAction, history } from './store/configureStore';
import './app.global.css';

const stores = configureStore();
const actions = configureAction(stores);
const { appState } = stores;
appState.start();

render(
  <React.Fragment>
    <Normalize />
    <BaseStyles />
    <AppContainer>
      <Root stores={stores} actions={actions} history={history} />
    </AppContainer>
  </React.Fragment>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <React.Fragment>
        <Normalize />
        <BaseStyles />
        <AppContainer>
          <NextRoot stores={store} actions={actions} history={history} />
        </AppContainer>,
      </React.Fragment>,
      document.getElementById('root')
    );
  });
}
