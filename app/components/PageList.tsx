import * as React from "react";


type IPageListProps = {
  total: number;
  limit: number;
  page: number;
  pageSize: number;
  gotoPage: Function
}
export class PageList extends React.Component<IPageListProps> {
  public hoadleGotoPage(page: number) {
    this.props.gotoPage(page);
  }

  public render() {
    const {total, limit, pageSize, page} = this.props;

    // 总页数
    const pageCount: number = Math.ceil(total / limit);
    const startPage: number = Math.min(Math.max(1, page - Math.floor(pageSize / 2)), pageCount - pageSize + 1);

    const pageArray: Array<number> = Array.from(new Array(Math.min(pageCount, pageSize)), (x, i)=> i + startPage);

    const prevPage: number = Math.max(page - 1, 1);
    const nextPage: number = Math.min(page + 1, pageCount);

    return (
      <ul className="lister-pagelist">
        <li className="page-prev" onClick={this.hoadleGotoPage.bind(this, prevPage)}>&lt;</li>
        {pageArray.map(v => (
          <li className={v === page ? 'active' : ''} onClick={this.hoadleGotoPage.bind(this, v)} key={v}>{v}</li>
        ))}
        <li className="page-next" onClick={this.hoadleGotoPage.bind(this, nextPage)}>&gt;</li>
      </ul>
    );
  }
}
