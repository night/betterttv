import React from 'react';

export const Components = [];

export function registerComponent(Component, metadata) {
  Components[metadata.settingId] = {
    ...metadata,
    render: (...props) => <Component {...props} key={metadata.settingId} />,
  };
}
