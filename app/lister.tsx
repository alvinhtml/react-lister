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
  itemSize?: number;
  selectable?: boolean;
  onSelect?: Function;
  reload?: Function;
}

type IListerState = {
  page: number;
  columns: Array<Column>;
  search: string;
  order: Array<string>;
  selectedIDs: Array<string>;
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
      selectedIDs: []
    }

  }


  public handleGotoPage(page: number): void {
    this.setState({
      page: page
    });
    this.reload(page);
  }

  public toggleSelectAll(e: any): void {
    const selectedIDs = this.state.selectedIDs.length === 0 ? this.props.rows.map(v => v.id) : [];
    this.selectChange(selectedIDs);
  }

  handleSelectAll(event: any): void {
    const isChecked: boolean = event.currentTarget.checked;

    let selectedIDs;

    if (isChecked) {
      selectedIDs = this.props.rows.map(v => v.id);
    } else {
      selectedIDs = [];
    }

    this.selectChange(selectedIDs);
  }

  handleSelectChange(id: string, event: any): void {
    const isChecked: boolean = event.currentTarget.checked;
    let {selectedIDs} = this.state;

    if (isChecked) {
      selectedIDs.push(id);
    } else {
      selectedIDs = selectedIDs.filter(v => v !== id);
    }

    this.selectChange(selectedIDs);
  }

  selectChange(selectedIDs: Array<string>): void {
    const {onSelect} = this.props;

    if (typeof onSelect === 'function') {
      onSelect(selectedIDs);
    } else {
      throw new TypeError('onSelect is not a function.');
    }

    this.setState({
      selectedIDs
    })
  }

  reload(page: number): void {
    const {reload} = this.props;

    if (typeof reload === 'function') {
      reload({
        page
      });
    }
  }

  public render() {
    const {columns, rows, total, limit = 10, itemSize = 7, selectable = false} = this.props;
    const {page, selectedIDs} = this.state;

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
              {selectable && (
                <th style={{width: '18px'}}>
                  <input onChange={this.handleSelectAll.bind(this)} type="checkbox" />
                </th>
              )}
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
                      <input checked={selectedIDs.includes(row.id)} onChange={this.handleSelectChange.bind(this, row.id)} type="checkbox" />
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
                  itemSize={itemSize}
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
