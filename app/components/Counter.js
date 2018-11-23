// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import trezorLink from 'trezor-link';
import { DeviceList } from 'trezor.js';
import styles from './Counter.css';
import routes from '../constants/routes';

type Props = {
  increment: () => void,
  incrementIfOdd: () => void,
  incrementAsync: () => void,
  // decrement: () => void,
  counter: number
};

// type State = {
//   alert: number
// };

export default class Counter extends Component<Props> {
  props: Props;

  _testTrezor: () => void;

  // constructor(props: Props) {
  //   super(props)
  //   this.state = {
  //     alert: 1
  //   }
  // }

  _testTrezor() {
    const { BridgeV2 } = trezorLink;
    const transport = new BridgeV2('http://localhost:32325');
    const list = new DeviceList({ debug: true, transport });
    list.on('connect', device => {
      console.log('connect begin');
      console.log(device);
    });
  }

  render() {
    const {
      increment,
      incrementIfOdd,
      incrementAsync,
      // decrement,
      counter
    } = this.props;
    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <div className={`counter ${styles.counter}`} data-tid="counter">
          {counter}
        </div>
        <div className={styles.btnGroup}>
          <button
            className={styles.btn}
            onClick={increment}
            data-tclass="btn"
            type="button"
          >
            <i className="fa fa-plus" />
          </button>
          <button
            className={styles.btn}
            onClick={this.testTrezor}
            data-tclass="btn"
            type="button"
          >
            <i className="fa fa-minus" />
          </button>
          <button
            className={styles.btn}
            onClick={incrementIfOdd}
            data-tclass="btn"
            type="button"
          >
            odd
          </button>
          <button
            className={styles.btn}
            onClick={() => incrementAsync()}
            data-tclass="btn"
            type="button"
          >
            async
          </button>
        </div>
      </div>
    );
  }
}
