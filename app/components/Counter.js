import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
// import PropTypes from 'prop-types'
import withStyles from '@material-ui/core/styles/withStyles';
import styles from './Counter.css';
import routes from '../constants/routes';

// type Props = {
//   increment: () => void,
//   classes: PropTypes.object.isRequired,
//   appState: PropTypes.object.isRequired,
//   counter: number
// };

class Counter extends Component<Props> {
  // props: Props;

  constructor(props) {
    super(props);
    this.increment = this.increment.bind(this);
    this.counter = this.counter.bind(this);
  }

  increment() {
    const { appState } = this.props;
    appState.increment();
  }

  counter() {
    const { appState } = this.props;
    console.log(appState);
    console.log(appState.counter);
    return appState.counter;
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <div className={`counter ${classes.counter}`} data-tid="counter">
          {this.counter()}
        </div>
        <div className={classes.btnGroup}>
          <button
            className={classes.btn}
            onClick={this.increment}
            data-tclass="btn"
            type="button"
          >
            <i className="fa fa-plus" />
          </button>
          <button
            className={styles.btn}
            onClick={this.increment}
            data-tclass="btn"
            type="button"
          >
            <i className="fa fa-minus" />
          </button>
          <button
            className={styles.btn}
            onClick={this.increment}
            data-tclass="btn"
            type="button"
          >
            odd
          </button>
          <button
            className={styles.btn}
            onClick={this.increment}
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

export default withStyles(styles)(
  inject(stores => {
    return {
      appState: stores.appState
    };
  })(observer(Counter))
);
