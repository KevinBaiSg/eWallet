import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
// import { configureStore, history } from './store/configureStore';
import './app.global.css';

// const history = createHashHistory();
// const store = configureStore();
const appState = configureStore();

const store = {
  appState
};

render(
  <AppContainer>
    <Root {...store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./views', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./views').default;
    render(
      <AppContainer>
        <NextRoot {...store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
