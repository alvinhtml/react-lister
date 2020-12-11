import * as React from "react";
import {Column} from '~/column';
import PageList from '~/components/PageList';
import Config from '~/components/Config';
import SearchInput from '~/components/SearchInput';

import './scss/index.scss';
import './scss/icon.scss';

interface IListerProps {
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
  limit: number;
  order?: Array<string>;
}

interface IColumnImage {
  key: string,
  column: Column,
  rect: {
    left: number;
    top: number;
    width: number;
  } | null;
}

interface IListerState {
  columns: Array<Column>;
  selectedIDs: Array<string>;
  params: IParams;
  dragging: string | null;
  resizing: string | null;
  columnImages: Array<IColumnImage> | null;
  filter: boolean;
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

  tableContainer: HTMLDivElement;

  columnImages: Array<IColumnImage> | null = null;

  timeout: number;

  constructor(props: IListerProps) {
    super(props);

    const {page = 1, limit = 10, columns} = props;

    this.state = {
      columns,
      selectedIDs: [],
      params: {
        page,
        limit
      },
      dragging: null,
      resizing: null,
      columnImages: null,
      filter: false
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
    2. 按下 th 开始拖动，根据 储存的 columnRefs 生成每一列的镜像，取得宽高和位置信息。实现：this.handleMouseDown()
    3. 根据鼠标移动距离，超过下一列宽度的一半，交换两列。实现：this.handleMouseMove()
   */

  handleMouseDown(key: string, e: React.MouseEvent<HTMLDivElement>) {
    const {columns} = this.state;

    const tableContainerRectLeft = this.tableContainer ? this.tableContainer.getBoundingClientRect().left : 0;
    const tableContainerScrollLeft: number = this.tableContainer ? this.tableContainer.scrollLeft : 0;

    const columnImages = columns.map(column => {
      // 根据 dom 节点获取宽高和位置信息
      const rect = column.visibility ? this.columnRefs[column.key].getBoundingClientRect() : null;

      const newColumn: IColumnImage = {
        key: column.key,
        column,
        rect: null
      };

      if (rect) {
        if (key === column.key) {
          this.mouseoffsetLeft = e.pageX - rect.left;
        }
        newColumn.rect = {
          left: rect.left - tableContainerRectLeft + tableContainerScrollLeft,
          top: 0,
          width: rect.width
        }
      }

      return newColumn;
    });

    this.setState({
        dragging: key,
        columnImages: columnImages
    });
    this.columnImages = columnImages;

    this.pageX = e.pageX;

  }

  handleMouseDownOnResize(key: string, e: React.MouseEvent<HTMLDivElement>) {
    this.pageX = e.pageX;
    this.setState({
      resizing: key
    });
  }

  handleMouseUp(e: MouseEvent) {
    const {dragging, resizing} = this.state;
    const columnImages = this.columnImages;

    if (dragging && columnImages) {
      const left = this.pageX - this.mouseoffsetLeft;
      const currentColumn = columnImages.find(v => v.key === dragging);

      if (currentColumn && currentColumn.rect) {
        currentColumn.rect = {...currentColumn.rect, left}

        const columns = columnImages.map(v => {
          return v.column;
        })

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

    if (resizing) {
      this.setState({
        resizing: null
      })
    }
  }

  handleMouseMove(e: MouseEvent) {
    const {dragging, resizing, columns} = this.state;
    const columnImages = this.columnImages;
    const keys = this.state.columnImages?.map(column => column.key);
    const tableContainerRectLeft: number = this.tableContainer ? this.tableContainer.getBoundingClientRect().left : 0;
    const tableContainerScrollLeft: number = this.tableContainer ? this.tableContainer.scrollLeft : 0;


    if (dragging && columnImages && keys) {

      // 移动量, 鼠标在 X 轴上移动的距离
      const distance = e.pageX - this.pageX;

      // 移动方向, 1 表示和右边的列交换，-1 表示和左边的列交换
      const direction: number = distance > 0 ? 1 : -1;

      // 计算 currentColumn 相对于 tableContainer 的 left
      const left = e.pageX - this.mouseoffsetLeft - tableContainerRectLeft + tableContainerScrollLeft;

      // 当前拖动列
      const currentColumn = columnImages.find(v => v.key === dragging);

      if (currentColumn && currentColumn.rect) {
        console.log("left, currentColumn.rect.left", left, currentColumn.rect.left);
        // 更新当前拖动列的位置, setState 后更新
        currentColumn.rect = {...currentColumn.rect, left: left}

        // 当前拖动列的索引
        const index = columnImages.indexOf(currentColumn);


        // 获取下一列和下一列的索引，和下一列，并且跳过隐藏列
        const {nextColumn, nextIndex} = (() => {

          let nextIndex = index;
          let nextColumn = null;

          // nextColumn.rect !== null
          while(!nextColumn) {
            nextIndex += direction;
            if (nextIndex >= 0 && nextIndex <= columnImages.length - 1) {
              if (columnImages[nextIndex].rect) {
                nextColumn = columnImages[nextIndex];
              }
            } else {
              break;
            }
          }

          return {nextIndex, nextColumn};
        })();

        if (nextColumn && nextColumn.rect) {
          // 当拖动距离超过下一列的一半时
          if (Math.abs(distance) > nextColumn.rect.width / 2) {
            const nextColumnLeft = nextColumn.rect.left;
            nextColumn.rect = {...nextColumn.rect, left: this.pageX - this.mouseoffsetLeft}
            this.pageX = nextColumnLeft + this.mouseoffsetLeft;
            columnImages.splice(index, 0, columnImages.splice(nextIndex, 1)[0]);
          }
        }

        // 为了实现 transition 效果，使用 state.columnImages 的列顺序加上 this.columnImages 的列位置信息生成新的 columnImages。
        const newColumnImages = [...columnImages].sort((a, b) => {
          return keys.indexOf(a.key) - keys.indexOf(b.key);
        })

        this.setState({
          columnImages: newColumnImages
        });
      }
    }

    if (resizing) {
      const currentColumn = columns.find(column => column.key === resizing);

      if (currentColumn) {
        currentColumn.setWidth(Math.max(60, (e.pageX - this.pageX + currentColumn.width)));
        this.setState({
          columns
        });
      }

      this.pageX = e.pageX;
    }
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
  // 获取 table container div 的 dom 节点
  handleTableContainerRef(element: HTMLDivElement) {
    this.tableContainer = element;
  }

  setVisibility(key: string, visibility: boolean) {
    const {columns} = this.state;
    const currentColumn = columns.find(column => column.key === key);
    if (currentColumn) {
      currentColumn.setVisibility(visibility);
      this.setState({
        columns
      });
    }
  }

  setLimit(limit: number) {
    const params = {...this.state.params, limit, page: 1};

    this.setState({
      params
    });

    this.reload(params);
  }

  saveConfigs() {

  }

  toggleSearch() {
    this.setState({
      filter: !this.state.filter
    })
  }

  handleFilter(value: string, key: string) {
    const {columns} = this.state;
    const currentColumn = columns.find(column => column.key === key);

    if (currentColumn) {
      currentColumn.setSearchValue(value);
      this.setState({
        columns
      }, () => {
        clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => {
          const params = {...this.state.params, page: 1, search: [key, value]};

          this.setState({
            params
          });

          this.reload(params);
        }, 500);
      });
    }
  }

  public render() {
    const {total, itemSize = 7, selectable = false} = this.props;
    const {columns, params, selectedIDs, dragging, resizing, columnImages, filter} = this.state;
    const {page = 1, limit} = params;
    const visibleColumns: Array<Column> = columns.filter(column => column.visibility);

    const rows = this.props.rows.filter(row => {
      return visibleColumns.map(column => {
        return column.getter ? (column.getter(row).toLowerCase().indexOf(column.searchVlaue.toLowerCase()) !== -1) : true
      }).every(isChecked => isChecked);
    });


    console.log("rows", rows);

    return (
      <div className="lister" style={{
        userSelect: (dragging || resizing) ? 'none' : 'text'
      }}>
        <div className="lister-caption">
          <div style={{flex: 1, textAlign: 'left'}}>
            {this.props.children}
          </div>
          <div style={{textAlign: 'right'}}>
            <div className="lister-btn" onClick={this.toggleSearch.bind(this)}><i className="fa-search" /> 筛选</div>
            <Config setVisibility={this.setVisibility.bind(this)} setLimit={this.setLimit.bind(this)} limit={limit} columns={columns} />
          </div>
        </div>
        <div className="lister-table-container" ref={this.handleTableContainerRef.bind(this)} >
          <table>
            <thead>
              <tr>
                {selectable && (
                  <th style={{width: '18px'}}>
                    <input onChange={this.handleSelectAll.bind(this)} type="checkbox" />
                  </th>
                )}
                {visibleColumns.map(column => (
                  <th key={column.title} ref={this.handleRefs.bind(this, column.key)} style={{width: `${column.width}px`}}>
                    <div className={columnImages ? 'head-cell head-hidden' : 'head-cell'}>
                      <div
                        className="head-cell-title"
                        onMouseDown={this.handleMouseDown.bind(this, column.key)}
                      >{column.title}</div>
                      {column.order && <div className="head-sort" onClick={this.handleOrder.bind(this, column.key)}><i className="fa-angle-down" /></div>}
                    </div>
                    {column.resize && <div onMouseDown={this.handleMouseDownOnResize.bind(this, column.key)} className="lister-resize" />}
                  </th>
                ))}
                <th style={{width: '12px'}}></th>
              </tr>
            </thead>
            <tbody>
              {filter &&
                <tr className="lister-filter-row">
                  {selectable && (
                    <td style={{width: '18px'}}></td>
                  )}
                  {visibleColumns.map(column => (
                    <td key={column.title}>
                      <div className={columnImages ? 'td-cell td-hidden' : 'td-cell'}>
                        <SearchInput visibility={!!column.getter} columnKey={column.key} onChange={this.handleFilter.bind(this)} />
                      </div>
                    </td>
                  ))}
                </tr>
              }
              {rows.map((row, i) => (
                <tr key={i}>
                  {selectable && (
                    <td>
                      <div className="td-cell">
                        <input checked={selectedIDs.includes(row.id)} onChange={this.handleSelectChange.bind(this, row.id)} type="checkbox" />
                      </div>
                    </td>
                  )}
                  {visibleColumns.map(column => (
                    <td key={column.title}>
                      <div className={columnImages ? 'td-cell td-hidden' : 'td-cell'}>{column.rander(row)}</div>
                    </td>
                  ))}
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
          {columnImages &&
            columnImages.filter(columnImage => columnImage.rect).map(columnImage => columnImage.rect && (
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
                  {filter &&
                    <tr className="lister-filter-row">
                      <td>
                        <div className="td-cell"><input /></div>
                      </td>
                    </tr>
                  }
                  {rows.slice(0, 20).map((row, i) => (
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
        <div>
          <PageList
            total={total}
            limit={limit}
            itemSize={itemSize}
            page={page}
            gotoPage={this.handleGotoPage.bind(this)}
          />
        </div>
      </div>
    );
  }
}
