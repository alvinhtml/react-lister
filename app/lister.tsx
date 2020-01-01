import * as React from "react";
import {Column} from '~/column';
import {PageList} from '~/components/PageList';

import './scss/index.scss';
import './scss/icon.scss';

type IListerProps = {
  columns: Array<Column>;
  rows: Array<any>;
  total: number;
  limit: number;
  page?: number;
  pageSize?: number;
  selectable?: boolean;
}

type IListerState = {
  page: number;
  columns: Array<Column>;
  search: string;
  order: Array<string>;
  selectIDs: Array<string>;
}

export class Lister extends React.Component<IListerProps, IListerState> {
  static Column = Column;

  // public state = {
  //   page: typeof this.props.page !== 'undefined' ? this.props.page : 1
  // }

  constructor(props: IListerProps) {
    super(props);

    const {page = 1, columns} = props;

    this.state = {
      page,
      columns,
      search: '',
      order: [],
      selectIDs: []
    }

  }


  public handleGotoPage(page: number): void {
    this.setState({
      page: page
    });
  }

  public selectAll(e: any): void {
    const selectIDs = this.props.rows.map(v => v.id);
    this.setState({
      selectIDs
    })
  }

  public render() {
    const {columns, rows, total, limit = 10, pageSize = 7, selectable = false} = this.props;
    const {page, selectIDs} = this.state;



    return (
      <div className="lister">
        <table>
          <caption>
            <div className="lister-caption">
              <div style={{flex: 1, textAlign: 'left'}}>
                {this.props.children}
              </div>
              <div style={{textAlign: 'right'}}>
                <div className="lister-button"><i className="fa-cog" /></div>
              </div>
            </div>
          </caption>
          <thead>
            <tr>
              {selectable && <th />}
              {columns.map(column => (
                <th key={column.title}>
                  <div className="head-cell">
                    <div className="head-cell-title">{column.title}</div>
                    {column.order && <div className="head-sort"><i className="fa-angle-down" /></div>}
                  </div>
                  {column.resize && <div className="lister-resize" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {selectable && (
                  <td>
                    <div className="td-cell">
                      <input checked={selectIDs.find(v => row.id === v)} type="checkbox" />
                    </div>
                  </td>
                )}
                {columns.map(column => (
                  <td key={column.title}>
                    <div className="td-cell">{column.randerValue(row)}</div>
                  </td>
                ))}
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
                  page={page}
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
