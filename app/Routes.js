import React from 'react';
import { Switch, Route } from 'react-router';
import RootView from 'views/Landing/views/Root';
import RootView2 from 'views/Landing/views/Root2';

import App from './containers/App';
import { getPattern } from 'support/routes';

export default () => (
  <App>
    <Switch>
      <Route exact path="/device" component={RootView2} />
      <Route exact path={getPattern('landing-home')} component={RootView} />
    </Switch>
  </App>
);
