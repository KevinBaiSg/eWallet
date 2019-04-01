/* @flow */
import {
  inject,
  observer
} from 'mobx-react';
import * as React from 'react';
import PropTypes from 'prop-types';
import StaticNotifications from './components/Static';
import AccountNotifications from './components/Account';
import ActionNotifications from './components/Action';

// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
//
// import type { MapStateToProps, MapDispatchToProps } from 'react-redux';
// import type { State, Dispatch } from 'flowtype';

// import { reconnect } from 'actions/DiscoveryActions';
// import * as NotificationActions from 'actions/NotificationActions';

// export type StateProps = {
//     router: $ElementType<State, 'router'>;
//     notifications: $ElementType<State, 'notifications'>;
//     selectedAccount: $ElementType<State, 'selectedAccount'>;
//     wallet: $ElementType<State, 'wallet'>;
//     blockchain: $ElementType<State, 'blockchain'>;
//     children?: React.Node;
// }

// export type DispatchProps = {
//     close: typeof NotificationActions.close;
//     blockchainReconnect: typeof reconnect;
// }

// export type Props = StateProps & DispatchProps;

export type Props = {};

const Notifications = (props: Props) => {
  const { notification } = props.appState.wallet;
  let notifications;
  if (!!notification) {
    notifications = [notification]
  } else {
    notifications = []
  }
  return (
    <React.Fragment>
      {/*<StaticNotifications {...props} />*/}
      {/*<AccountNotifications {...props} />*/}
      <ActionNotifications notifications={notifications} close={() => {
        props.appState.wallet.notification = null;
      }}/>
    </React.Fragment>
  );
};

// const mapStateToProps: MapStateToProps<State, OwnProps, StateProps> = (state: State): StateProps => ({
//     router: state.router,
//     notifications: state.notifications,
//     selectedAccount: state.selectedAccount,
//     wallet: state.wallet,
//     blockchain: state.blockchain,
// });
//
// const mapDispatchToProps: MapDispatchToProps<Dispatch, OwnProps, DispatchProps> = (dispatch: Dispatch): DispatchProps => ({
//     close: bindActionCreators(NotificationActions.close, dispatch),
//     blockchainReconnect: bindActionCreators(reconnect, dispatch),
// });
//
// export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
Notifications.propTypes = {
  appState: PropTypes.object.isRequired
};

export default inject((stores) => {
  return {
    appState: stores.appState
  };
})(observer(Notifications));
