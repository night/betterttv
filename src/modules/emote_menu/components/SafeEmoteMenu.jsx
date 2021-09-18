import React from 'react';
import EmoteMenuButton from './LegacyButton.jsx';

export default class SafeEmoteMenuButton extends React.Component {
  componentDidMount() {
    const {onMount} = this.props;
    onMount();
  }

  componentDidCatch(error, info) {
    const {onError} = this.props;
    onError(error, info);
  }

  static getDerivedStateFromError() {
    return null;
  }

  render() {
    return <EmoteMenuButton {...this.props} />;
  }
}
