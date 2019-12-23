import * as React from "react";
import {Column} from '~/column';
import {PageList} from '~/components/PageList';

import './scss/index.scss';

type IListerProps = {
  columns: Array<Column>;
  rows: Array<any>;
  total: number;
  limit: number;
  currentPage?: number;
  pageSize?: number;
}

type IListerState = {
  currentPage: number;
}

export class Lister extends React.Component<IListerProps, IListerState> {
  static Column = Column;
  public state = {
    currentPage: typeof this.props.currentPage !== 'undefined' ? this.props.currentPage : 1
  }

  public handleGotoPage(page: number): void {
    this.setState({
      currentPage: page
    });
  }

  public render() {
    const {columns, rows, total, limit = 10, pageSize = 7} = this.props;
    const {currentPage} = this.state;

    return (
      <div className="lister">
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
            <tr>
              <td colSpan={rows.length}>
                <PageList
                  total={total}
                  limit={limit}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  gotoPage={this.handleGotoPage.bind(this)}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }
}
