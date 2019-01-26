import React from 'react';
import { Switch, Route } from 'react-router';

// import LockScreenPage from 'Views/LockScreenPage';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
// import CounterPage from './containers/CounterPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.COUNTER} component={HomePage} />
      {/*<Route path={routes.HOME} component={LockScreenPage} />*/}
    </Switch>
  </App>
);
