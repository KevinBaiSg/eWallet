import React from 'react';
import { Switch, Route } from 'react-router';
import RootView from 'views/Landing/views/Root';

import App from './containers/App';
import { getPattern } from 'support/routes';
import WalletContainer from 'views/Wallet';
import ErrorBoundary from 'support/ErrorBoundary';
import ImagesPreloader from 'support/ImagesPreloader';

import WalletDashboard from 'views/Wallet/views/Dashboard';

export default () => (
  <App>
    <Switch>
      <Route exact path={getPattern('landing-home')} component={RootView} />
      <Route>
        <ErrorBoundary>
          <ImagesPreloader />
          <WalletContainer>
            <Route path={getPattern('wallet-dashboard')} component={WalletDashboard} />
          </WalletContainer>
        </ErrorBoundary>
      </Route>
    </Switch>
  </App>
);
