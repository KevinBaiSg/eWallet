import React from 'react';
import { hot } from 'react-hot-loader';
import { Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

// general
import { getPattern } from 'support/routes';

// landing views
import RootView from 'views/Landing/views/Root/Container';

import store, { history } from './store';

const App = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Switch>
                <Route exact path={getPattern('landing-home')} component={RootView} />
            </Switch>
        </ConnectedRouter>
    </Provider>
);

export default hot(module)(App);
