import * as React from 'react';
import {Column} from './column';

import './scss/index.scss';

type Props = {
  columns: Array<Column>;
  rows: Array<any>;
  currentPage?: number;
}

type State = {
  currentPage: number;
}

export class Lister extends React.Component<Props, State> {
  state = {
    currentPage: typeof this.props.currentPage !== 'undefined' ? this.props.currentPage : 1
  }

  private handleGotoPage(page: number) {

  }

  render() {
    const {columns, rows} = this.props;

    return (
      <div className="grider">
        <table>
          <caption>全选</caption>
          <thead>
            <tr>
              {columns.map(column => <th key={column.title}>{column.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map(column => <td key={column.title}>{column.randerValue(row)}</td>)}
              </tr>
            ))}
          </tbody>
          <tfoot>

          </tfoot>
        </table>
      </div>
    );
  }
}
