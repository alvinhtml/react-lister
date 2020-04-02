import * as React from 'react';
import {Column} from '~/column';

type IListerProps = {
  rows: Array<any>;
  reload?: Function;
}


interface Options {
  visibility: boolean;
  width: number;
}


export const withLister = (WrappedComponent: typeof React.Component, name: string, columns: Array<Column>) => class RefsHOC extends React.Component<IListerProps> {

  lister: {current: any} = React.createRef();

  constructor(props: IListerProps) {
    super(props);

    const configsStorage: string | null = localStorage.getItem(`lister-${name}`);

    if (configsStorage) {
      const configs: Array<Options> = JSON.parse(configsStorage);
    } else {

    }
  }

  toggleSelectAll(): void {
    if (this.lister.current) {
      this.lister.current.toggleSelectAll();
    }
  }

  render() {
    const props = Object.assign({}, this.props, {
      createRef: this.lister,
      columns,
      toggleSelectAll: this.toggleSelectAll.bind(this)
    });

    return (
      <WrappedComponent
        {...props}
      />
    );
  }
}
