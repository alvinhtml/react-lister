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

interface IParams {
  page: number;
  order?: Array<string>;
}

interface IDrag {
  column: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

type IListerState = {
  columns: Array<Column>;
  selectedIDs: Array<string>;
  params: IParams;
  drag: IDrag | null;
}




export class Lister extends React.Component<IListerProps, IListerState> {
  static Column = Column;

  // 鼠标按下时 X 轴坐标
  originX: number = 0;

  // 鼠标按下时，目标对象的 offsetLeft
  originPositionLeft: number = 0;

  constructor(props: IListerProps) {
    super(props);

    const {page = 1, columns} = props;

    this.state = {
      columns,
      selectedIDs: [],
      params: {
        page
      },
      drag: null
    }

    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

  }

  componentDidMount() {
    document.documentElement.addEventListener("mouseup", this.handleMouseUp);
    document.documentElement.addEventListener("mousemove", this.handleMouseMove);
  }

  componentWillUnmount() {
    document.documentElement.removeEventListener("mouseup", this.handleMouseUp);
    document.documentElement.removeEventListener("mousemove", this.handleMouseMove);
  }


  public handleGotoPage(page: number): void {
    const params = {...this.state.params, page};

    this.setState({
      params
    });
    this.reload(params);
  }

  public toggleSelectAll(e: any): void {
    const {rows} = this.props;

    if (this.state.selectedIDs.length === rows.length) {
      this.selectChange([]);
    } else {
      this.selectChange(this.props.rows.map(v => v.id));
    }
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

  handleOrder(key: string) {
    const {params} = this.state;

    let order: Array<string> | boolean;

    if (params.order && params.order[0] === key) {
      order = [key, params.order[1] === 'asc' ? 'desc' : 'asc']
    } else {
      order = [key, 'desc'];
    }

    const newParams = {...params, order};

    this.setState({
      params: newParams
    });

    this.reload(newParams);
  }

  reload(params: IParams): void {
    const {reload} = this.props;

    if (typeof reload === 'function') {
      reload(params);
    }
  }

  // 鼠标按下开始拖动
  handleMouseDown(column: string, e: React.MouseEvent<HTMLDivElement>) {
    const currentTarget: HTMLDivElement = e.currentTarget;
    const thElement: HTMLElement | null | undefined = currentTarget.parentElement?.parentElement;
    console.log("e.pageX", e.pageX);

    if (thElement) {
      const {left, top, width, height} = thElement.getBoundingClientRect();

      this.setState({
        drag: {
          column,
          left,
          top,
          width,
          height
        }
      });

      this.originPositionLeft = left;
      this.originX = e.pageX;
    }
  }

  handleMouseUp(e: MouseEvent) {
    console.log("handleMouseUp", e);

    this.setState({
      drag: null
    });

  }

  handleMouseMove(e: MouseEvent) {
    const {drag} = this.state;

    if (drag) {

      // 移动量, 鼠标在 X 轴上移动的距离
      const moveX = e.pageX - this.originX;

      // 移动方向, moveX > 0 表示向右移动
      const direction: boolean = moveX > 0;

      // 新的 offsetLeft 等于目标对象的原始 offsetLeft 加上鼠标相对于按下时的移动量
      const left = this.originPositionLeft + moveX;
      this.setState({
        drag: {...drag, left}
      });



    }
  }

  exchangeColumn(direction: boolean, distance: number, drag: IDrag) {
    const {columns} = this.state;

    // 当前的拖动列
    const dragColumn = columns.find(v => v.key === drag.column);

    if (dragColumn) {
      // let targetColumn: Column;

      if (dragColumn && direction) {
        
      }
    }
  }



  public render() {
    const {rows, total, limit = 10, itemSize = 7, selectable = false} = this.props;
    const {columns, params, selectedIDs, drag} = this.state;
    const {page = 1} = params;

    const dragColumn = drag && columns.find(v => v.key === drag.column);



    // console.log("drag", drag, this.state.originPageX);

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
                  <div className={(!dragColumn || dragColumn.key !== column.key) ? 'head-cell' : 'head-cell head-hidden'}>
                    <div
                      className="head-cell-title"
                      onMouseDown={this.handleMouseDown.bind(this, column.key)}
                    >{column.title}</div>
                    {column.order && <div className="head-sort" onClick={this.handleOrder.bind(this, column.key)}><i className="fa-angle-down" /></div>}
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
                    <div className={(!dragColumn || dragColumn.key !== column.key) ? 'td-cell' : 'td-cell td-hidden'}>{column.rander(row)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)}>
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

        {drag && dragColumn &&
          <table className="dragging" style={{
            left: `${drag.left}px`,
            top: `${drag.top}px`,
            width: `${drag.width}px`,
            height: `${drag.height}px`
          }}>
            <thead>
              <tr>
                <th>
                  <div className="head-cell">
                    <div className="head-cell-title">{dragColumn.title}</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <div className="td-cell">{dragColumn.rander(row)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }

      </div>
    );
  }
}
