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

interface IColumnImage {
  key: string,
  column: Column,
  rect: {
    left: number;
    top: number;
    width: number;
  }
}

type IListerState = {
  columns: Array<Column>;
  selectedIDs: Array<string>;
  params: IParams;
  dragging: string | null;
  columnImages: Array<IColumnImage> | null;
}




export class Lister extends React.Component<IListerProps, IListerState> {
  static Column = Column;

  // 鼠标按下时 X 轴坐标
  pageX: number = 0;

  //鼠标点击时的 e.pageX 相对于拖动对象的 X 轴偏移
  mouseoffsetLeft: number = 0;

  columnRefs: {
    [key: string] : HTMLElement
  } = {};

  columnImages: Array<IColumnImage> | null = null;

  constructor(props: IListerProps) {
    super(props);

    const {page = 1, columns} = props;

    this.state = {
      columns,
      selectedIDs: [],
      params: {
        page
      },
      dragging: null,
      columnImages: null,
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

  /* 鼠标按下开始拖动，拖动思路：
    1. 获取 th 的 dom 节点，储存在 this.columnRefs 对象。实现：this.handleRefs()
    2. 按下 th 开始拖动，根据 储存的 columnImages 生成每一列的镜像，取得宽高和位置信息。实现：this.handleMouseDown()
    3. 根据鼠标移动距离，超过下一列宽度的一半，交换两列。实现：this.handleMouseMove()， this.exchangeColumn()
   */
  handleMouseDown(key: string, e: React.MouseEvent<HTMLDivElement>) {
    const {columns} = this.state;

    console.log("this.columnRefs", this.columnRefs);


    const columnImages = columns.map(column => {
      const rect = this.columnRefs[column.key].getBoundingClientRect();

      if (key === column.key) {
        this.mouseoffsetLeft = e.pageX - rect.left;
      }

      return {
        key: column.key,
        column,

        // 根据 dom 节点获取宽高和位置信息
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width
        }
      }
    });

    this.setState({
        dragging: key,
        columnImages: columnImages
    });
    this.columnImages = columnImages;

    this.pageX = e.pageX;

  }

  handleMouseUp(e: MouseEvent) {
    console.log("handleMouseUp", e);

    const {dragging} = this.state;
    const columnImages = this.columnImages;

    if (dragging && columnImages) {
      const left = this.pageX - this.mouseoffsetLeft;
      const currentColumn = columnImages.find(v => v.key === dragging);

      if (currentColumn) {
        currentColumn.rect = {...currentColumn.rect, left}

        console.log("currentColumn", currentColumn);

        const columns = columnImages.map(v => {
          return v.column;
        })

        console.log("columns", columns);
        console.log("state columns", this.state.columns);

        this.setState({
          dragging: null,
          columnImages
        });

        window.setTimeout(() => {
          this.setState({
            columns: columns,
            columnImages: null
          });
        }, 300);
      }
    }
  }

  handleMouseMove(e: MouseEvent) {
    const {dragging} = this.state;
    const columnImages = this.columnImages;
    const keys = this.state.columnImages?.map(column => column.key);

    if (dragging && columnImages && keys) {

      // 移动量, 鼠标在 X 轴上移动的距离
      const distance = e.pageX - this.pageX;

      // 移动方向, 1 表示和右边的列交换，-1 表示和左边的列交换
      const direction: number = distance > 0 ? 1 : -1;

      // 新的 offsetLeft 等于目标对象的原始 offsetLeft 加上鼠标相对于按下时的移动量
      const left = e.pageX - this.mouseoffsetLeft;

      // 当前拖动列
      const currentColumn = columnImages.find(v => v.key === dragging);

      if (currentColumn) {
        // 更新当前拖动列的位置, setState 后更新
        currentColumn.rect = {...currentColumn.rect, left}

        // 当前拖动列的索引
        const index = columnImages.indexOf(currentColumn);

        // 下一列的列索引
        const nextIndex = index + direction;


        if (nextIndex >= 0 && nextIndex <= columnImages.length - 1) {

          // 下一列
          const nextColumn = columnImages[nextIndex];

          // 当拖动距离超过下一列的一半时
          if (Math.abs(distance) > nextColumn.rect.width / 2) {
            const nextColumnLeft = nextColumn.rect.left;
            nextColumn.rect = {...nextColumn.rect, left: this.pageX - this.mouseoffsetLeft}
            this.pageX = nextColumnLeft + this.mouseoffsetLeft;
            columnImages.splice(index, 0, columnImages.splice(nextIndex, 1)[0]);
          }
        }

        console.log("keys", keys);

        const newColumnImages = [...columnImages].sort((a, b) => {
          return keys.indexOf(a.key) - keys.indexOf(b.key);
        })

        console.log("newColumnImages", newColumnImages);

        this.setState({
          columnImages: newColumnImages
        });
      }
    }
  }

  exchangeColumn(direction: boolean, distance: number, dragging: string) {

    // console.log("columns", columns);
    //
    // // 当前拖动的列
    // const draggingColumn = columns.find(v => v.key === dragging.column);
    //
    // // 要交换的目标列
    // let targetColumn: Column;
    //
    // // 要交换的目标列索引
    // let targetColumnIndex: number;
    //
    // if (draggingColumn) {
    //
    //   // 当前拖动的列索引
    //   const index = columns.indexOf(draggingColumn);
    //
    //   // 要交换的目标列索引
    //   const targetColumnIndex = direction ? Math.min(columns.length, index + 1) : Math.max(0, index - 1);
    //
    //   // 要交换的目标列
    //   const targetColumn = columns[targetColumnIndex];
    //
    //
    //   if (targetColumn && Math.abs(distance) > targetColumn.width / 2) {
    //     console.log(draggingColumn, targetColumn);
    //
    //
    //     columns[index] = targetColumn;
    //     columns[targetColumnIndex] = draggingColumn;
    //
    //     this.setState({
    //       columns
    //     });
    //
    //     this.startLeft += targetColumn.width;
    //     this.originX += targetColumn.width;
    //   }
    //
    //
    // }
  }

  // 获取 th 的 dom 节点
  handleRefs(key: string, element: HTMLElement) {
    if (!element) {
      return false;
    }

    Object.defineProperty(this.columnRefs, key, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: element
    });
  }



  public render() {
    const {rows, total, limit = 10, itemSize = 7, selectable = false} = this.props;
    const {columns, params, selectedIDs, dragging, columnImages} = this.state;
    const {page = 1} = params;

    console.log("columnImages", columnImages);

    // console.log("drag", drag, this.state.originPageX);

    return (
      <div className="lister" style={{
        userSelect: dragging ? 'none' : 'text'
      }}>
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
                <th key={column.title} ref={this.handleRefs.bind(this, column.key)} style={{width: `${column.width}px`}}>
                  <div className={columnImages ? 'head-cell head-hidden' : 'head-cell'}>
                    <div
                      className="head-cell-title"
                      onMouseDown={this.handleMouseDown.bind(this, column.key)}
                    >{column.title}</div>
                    {column.order && <div className="head-sort" onClick={this.handleOrder.bind(this, column.key)}><i className="fa-angle-down" /></div>}
                  </div>
                  {column.resize && <div className="lister-resize" />}
                </th>
              ))}
              <th></th>
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
                    <div className={columnImages ? 'td-cell td-hidden' : 'td-cell'}>{column.rander(row)}</div>
                  </td>
                ))}
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <PageList
            total={total}
            limit={limit}
            itemSize={itemSize}
            page={page}
            gotoPage={this.handleGotoPage.bind(this)}
          />
        </div>

        {columnImages &&
          columnImages.map(columnImage => (
            <table
              key={columnImage.key}
              data-key={columnImage.key}
              className={columnImage.key === dragging ? 'drag-current' : 'drag-column'}
              style={{
                left: `${columnImage.rect.left}px`,
                top: `${columnImage.rect.top}px`,
                width: `${columnImage.rect.width}px`
              }}
            >
              <thead>
                <tr>
                  <th>
                    <div className="head-cell">
                      <div className="head-cell-title">{columnImage.column && columnImage.column.title}</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <div className="td-cell">{columnImage.column && columnImage.column.rander(row)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))
        }
      </div>
    );
  }
}
