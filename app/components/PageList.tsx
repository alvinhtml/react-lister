import * as React from "react";


type IPageListProps = {
  total: number;
  limit: number;
  currentPage: number;
  pageSize: number;
  gotoPage: Function
}
export class PageList extends React.Component<IPageListProps> {
  public hoadleGotoPage(page: number) {
    this.props.gotoPage(page);
  }

  public render() {
    const {total, limit, pageSize, currentPage} = this.props;

    const pageCount: number = Math.ceil(total / limit);
    const leftPageNumber: number = Math.max(1, currentPage - Math.floor(pageSize / 2));
    const pageArray: Array<number> = Array.from(new Array(Math.min(pageCount, 9)), (x, i)=> i + leftPageNumber);

    return (
      <ul className="lister-pagelist">
        {pageArray.map(v => (
          <li className={v === currentPage ? 'active' : ''} onClick={this.hoadleGotoPage.bind(this, v)} key={v}>{v}</li>
        ))}
      </ul>
    );
  }
}
