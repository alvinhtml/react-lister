import * as React from 'react';

export const withLister = (Component: any) => class WrapComponent extends React.Component<{}, {
  selectIDs: Array<string>
}> {
  render() {
    return (
      <Component {...this.props} />
    );
  }
}
