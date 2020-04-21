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
  column?: Column,
  element: HTMLElement,
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  }
}

type IListerState = {
  columns: Array<Column>;
  selectedIDs: Array<string>;
  params: IParams;
  dragKey: string | null;
  columnImages: Array<IColumnImage> | null;
}




export class Lister extends React.Component<IListerProps, IListerState> {
  static Column = Column;

  // 鼠标按下时 X 轴坐标
  originX: number = 0;

  // 鼠标按下时，当前拖动列的 offsetLeft
  startLeft: number = 0;

  // 鼠标松开时，当前拖动列要移动到的位置
  endLeft: number = 0;

  columns: Array<Column>;

  columnImages: {
    [key: string] : IColumnImage
  } = {};

  constructor(props: IListerProps) {
    super(props);

    const {page = 1, columns} = props;

    this.state = {
      columns,
      selectedIDs: [],
      params: {
        page
      },
      dragKey: null,
      columnImages: null,
    }

    this.columns = columns;

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
    1. 获取 th 的 dom 节点，并取得宽高和位置信息，储存在 this.mirrors 对象。实现：this.handleRefs()
    2. 按下 th 开始拖动，根据 储存的 mirror 生成每一列的镜像。实现：this.handleMouseDown()
    3. 根据鼠标移动距离，超过下一列宽度的一半，交换两列。实现：this.handleMouseMove()， this.exchangeColumn()
   */
  handleMouseDown(key: string, e: React.MouseEvent<HTMLDivElement>) {

    this.setState({
        dragKey: key,
        columnImages: Object.keys(this.columnImages).map(v => this.columnImages[v])
    });

    this.startLeft = this.columnImages[key].rect.left;
    this.endLeft = this.columnImages[key].rect.left;
    this.originX = e.pageX;


    // const thElement: HTMLElement | null | undefined = currentTarget.parentElement?.parentElement;
    // console.log("e.pageX", e.pageX);
    //
    // if (thElement) {
    //   const {left, top, width, height} = thElement.getBoundingClientRect();
    //
    //   this.setState({
    //     dragKey: {
    //       column,
    //       left,
    //       top,
    //       width,
    //       height
    //     }
    //   });
    //

    // }
  }

  handleMouseUp(e: MouseEvent) {
    console.log("handleMouseUp", e);

    this.setState({
      dragKey: null
    });

  }

  handleMouseMove(e: MouseEvent) {
    const {dragKey} = this.state;
    const columnImages = this.state.columnImages ? [...this.state.columnImages] : null;


    if (dragKey && columnImages) {

      // 移动量, 鼠标在 X 轴上移动的距离
      const distance = e.pageX - this.originX;

      // 移动方向, 1 表示和右边的列交换，-1 表示和左边的列交换
      const direction: number = distance > 0 ? 1 : -1;

      // 新的 offsetLeft 等于目标对象的原始 offsetLeft 加上鼠标相对于按下时的移动量
      const left = this.startLeft + distance;

      // 当前拖动列
      const currentColumn = columnImages.find(v => v.key === dragKey);

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

          // console.log("columnImages", columnImages.map(v => v.key), index, nextIndex);

          console.log("nextColumn", nextIndex, nextColumn);
          if (Math.abs(distance) > nextColumn.rect.width / 2) {
            this.endLeft = nextColumn.rect.left;
            nextColumn.rect = {...nextColumn.rect, left: this.startLeft}
            // columnImages.splice(index, 0, columnImages.splice(nextIndex, 1)[0]);
            // this.startLeft = nextColumn.rect.left;
          }
        }

        this.setState({
          columnImages
        });
      }
    }
  }

  exchangeColumn(direction: boolean, distance: number, dragKey: string) {
    const columns = this.columns;

    // console.log("columns", columns);
    //
    // // 当前拖动的列
    // const dragKeyColumn = columns.find(v => v.key === dragKey.column);
    //
    // // 要交换的目标列
    // let targetColumn: Column;
    //
    // // 要交换的目标列索引
    // let targetColumnIndex: number;
    //
    // if (dragKeyColumn) {
    //
    //   // 当前拖动的列索引
    //   const index = columns.indexOf(dragKeyColumn);
    //
    //   // 要交换的目标列索引
    //   const targetColumnIndex = direction ? Math.min(columns.length, index + 1) : Math.max(0, index - 1);
    //
    //   // 要交换的目标列
    //   const targetColumn = columns[targetColumnIndex];
    //
    //
    //   if (targetColumn && Math.abs(distance) > targetColumn.width / 2) {
    //     console.log(dragKeyColumn, targetColumn);
    //
    //
    //     columns[index] = targetColumn;
    //     columns[targetColumnIndex] = dragKeyColumn;
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
    const {columns} = this.state;

    // console.log("key, element", key, element);
    // console.log("this.columnImages", this.columnImages);


    Object.defineProperty(this.columnImages, key, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {
        key,
        column: columns.find(v => v.key === key),
        element,

        // 根据 dom 节点获取宽高和位置信息
        rect: element.getBoundingClientRect()
      }
    });
  }



  public render() {
    const {rows, total, limit = 10, itemSize = 7, selectable = false} = this.props;
    const {columns, params, selectedIDs, dragKey, columnImages} = this.state;
    const {page = 1} = params;

    // console.log("columnImages", columnImages);

    // console.log("drag", drag, this.state.originPageX);

    return (
      <div className="lister" style={{
        userSelect: dragKey ? 'none' : 'text'
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
              className={columnImage.key === dragKey ? 'drag-current' : 'drag-column'}
              style={{
                left: `${columnImage.rect.left}px`,
                top: `${columnImage.rect.top}px`,
                width: `${columnImage.rect.width}px`,
                height: `${columnImage.rect.height}px`
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
