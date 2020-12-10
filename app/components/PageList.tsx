import * as React from "react";


type IPageListProps = {
  total: number;
  limit: number;
  page: number;
  itemSize: number;
  gotoPage: Function;
}
export default class PageList extends React.Component<IPageListProps> {
  public hoadleGotoPage(page: number): void {
    this.props.gotoPage(page);
  }

  public render(): React.Node {
    const {total, limit, itemSize, page} = this.props;

    // 总页数
    const pageCount: number = Math.ceil(total / limit);

    // 从第几页开始
    const startPage: number = Math.min(Math.max(1, page - Math.floor(itemSize / 2)), Math.max(pageCount - itemSize + 1, 1));

    const pageArray: Array<number> = Array.from(new Array(Math.min(pageCount, itemSize)), (x, i)=> i + startPage);
    const prevPage: number = Math.max(page - 1, 1);
    const nextPage: number = Math.min(page + 1, pageCount);

    return (
      <ul className="lister-pagelist">
        <li className="page-prev" onClick={this.hoadleGotoPage.bind(this, 1)}><i className="fa-angle-double-left" /></li>
        {page !== 1 &&
          <li className="page-prev" onClick={this.hoadleGotoPage.bind(this, prevPage)}><i className="fa-angle-left" /></li>
        }
        {pageArray.map(v => (
          <li className={v === page ? 'active' : ''} onClick={this.hoadleGotoPage.bind(this, v)} key={v}>{v}</li>
        ))}
        {page !== pageCount &&
          <li className="page-next" onClick={this.hoadleGotoPage.bind(this, nextPage)}><i className="fa-angle-right" /></li>
        }
        <li className="page-next" onClick={this.hoadleGotoPage.bind(this, pageCount)}><i className="fa-angle-double-right" /></li>
      </ul>
    );
  }
}
