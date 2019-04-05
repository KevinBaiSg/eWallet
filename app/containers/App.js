// @flow
import * as React from 'react';
import styled from 'styled-components';
import { FADE_IN } from 'config/animations';
import Pin from 'components/modals/pin/Pin';
const Logger = require('utils/logger').default;
import colors from 'config/colors';
import { inject, observer } from 'mobx-react';

const ModalContainer = styled.div`
    position: fixed;
    z-index: 10000;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    padding: 20px;
    animation: ${FADE_IN} 0.3s;
`;

const ModalWindow = styled.div`
    margin: auto;
    position: relative;
    border-radius: 4px;
    background-color: ${colors.WHITE};
    text-align: center;
`;

type Props = {
  children: React.Node
};

class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    const { appState, pinActions } = this.props;
    return (
      <React.Fragment>
        {!!appState.eWalletDevice.pin_request && (
          <ModalContainer>
            <ModalWindow>
              <Pin
                onPinSubmit={(pin)=>{
                  Logger.debug(`submit pin: ${pin}`);
                  pinActions.verifyPin(pin);
                }}
              />;
            </ModalWindow>
          </ModalContainer>
        )}
        {children}
      </React.Fragment>
    );
  }
}

export default inject((stores) => {
  return {
    appState: stores.appState,
    pinActions: stores.pinActions
  };
})(observer(App));
