import * as React from "react";


type IPageListProps = {
  total: number;
  limit: number;
  page: number;
  itemSize: number;
  gotoPage: Function
}
export class PageList extends React.Component<IPageListProps> {
  public hoadleGotoPage(page: number) {
    this.props.gotoPage(page);
  }

  public render() {
    const {total, limit, itemSize, page} = this.props;

    // 总页数
    const pageCount: number = Math.ceil(total / limit);

    // 从第几页开始
    const startPage: number = Math.min(Math.max(1, page - Math.floor(itemSize / 2)), pageCount - itemSize + 1);

    const pageArray: Array<number> = Array.from(new Array(Math.min(pageCount, itemSize)), (x, i)=> i + startPage);

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
