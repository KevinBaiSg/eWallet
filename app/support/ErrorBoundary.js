import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import RedBox from 'redbox-react';

class ErrorBoundary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: false };
  }

  componentDidCatch(error) {
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return <RedBox error={this.state.error}/>;
      } else {
        return <div>unknown error</div>;
      }
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

export default ErrorBoundary;
