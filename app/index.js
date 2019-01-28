// import React from 'react';
// import { render } from 'react-dom';
// import { AppContainer } from 'react-hot-loader';
// import Root from './views/index';
// // import { configureStore, history } from './store/configureStore';
// import './app.global.css';
//
// // const store = configureStore();
//
// render(
//   <AppContainer>
//     <Root />
//   </AppContainer>,
//   document.getElementById('root')
// );
//
// if (module.hot) {
//   module.hot.accept('./views/index', () => {
//     // eslint-disable-next-line global-require
//     const NextRoot = require('./views/index').default;
//     render(
//       <AppContainer>
//         <NextRoot />
//       </AppContainer>,
//       document.getElementById('root')
//     );
//   });
// }
//

/* @flow */
import React from 'react';
import { render } from 'react-dom';
import { Normalize } from 'styled-normalize';
import BaseStyles from 'support/styles';
import App from 'views/index';

const root: ?HTMLElement = document.getElementById('root');
if (root) {
  render(
    <React.Fragment>
      <Normalize />
      <BaseStyles />
      <App />
    </React.Fragment>,
    root,
  );
}

window.onbeforeunload = () => {
  // $FlowIssue: render empty component
  render(null, root);
};
