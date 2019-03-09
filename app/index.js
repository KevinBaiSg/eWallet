import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Normalize } from 'styled-normalize';
import BaseStyles from 'support/styles';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
// import { configureStore, history } from './store/configureStore';
import './app.global.css';

// const history = createHashHistory();
// const store = configureStore();
const appState = configureStore();
appState.start();

const store = {
  appState
};

render(
  <React.Fragment>
    <Normalize />
    <BaseStyles />
    <AppContainer>
      <Root {...store} history={history} />
    </AppContainer>
  </React.Fragment>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./views').default;
    render(
      <React.Fragment>
        <Normalize />
        <BaseStyles />
        <AppContainer>
          <NextRoot {...store} history={history} />
        </AppContainer>,
      </React.Fragment>,
      document.getElementById('root')
    );
  });
}
