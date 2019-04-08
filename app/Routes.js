import React from 'react';
import { Switch, Route } from 'react-router';
import RootView from 'views/Landing/views/Root';

import App from './containers/App';
import { getPattern } from 'support/routes';
import WalletContainer from 'views/Wallet';
import ErrorBoundary from 'support/ErrorBoundary';
import ImagesPreloader from 'support/ImagesPreloader';

import WalletDashboard from 'views/Wallet/views/Dashboard';
import AccountSummary from 'views/Wallet/views/Account/Summary';
import AccountReceive from 'views/Wallet/views/Account/Receive';
import AccountSend from 'views/Wallet/views/Account/Send';
import WalletInitialize from 'views/Wallet/views/Initialize';

export default () => (
  <App>
    <Switch>
      <Route exact path={getPattern('landing-home')} component={RootView} />
      <Route>
        <ErrorBoundary>
          <ImagesPreloader />
          <WalletContainer>
            <Route exact path={getPattern('wallet-initialize')} component={WalletInitialize}/>
            <Route exact path={getPattern('wallet-dashboard')} component={WalletDashboard} />
            <Route exact path={getPattern('wallet-account-summary')} component={AccountSummary} />
            <Route path={getPattern('wallet-account-receive')} component={AccountReceive} />
            <Route path={getPattern('wallet-account-send')} component={AccountSend} />
          </WalletContainer>
        </ErrorBoundary>
      </Route>
    </Switch>
  </App>
);
