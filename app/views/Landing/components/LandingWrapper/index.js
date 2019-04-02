/* @flow */
import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Loader from 'components/Loader';
import colors from 'config/colors';
import { withNamespaces } from 'react-i18next';

type Props = {
  loading?: boolean;
  error?: ?string;
  children?: React.Node;
}

const Wrapper = styled.div`
    min-height: 100vh;

    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;
    background: ${colors.LANDING};
`;

const LandingContent = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
`;

const LandingLoader = styled(Loader)`
    margin: auto;
`;

const LandingWrapper = (props: Props) => {
  const { t } = props;
  return (
    <Wrapper>
      {props.loading && <LandingLoader text={ t('Loading') } size={100} />}
    </Wrapper>
  )
};

LandingWrapper.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node,
};

LandingWrapper.defaultProps = {
  loading: false,
  error: null,
};

export default withNamespaces()(LandingWrapper);
