interface IColumnOptions {
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;
}

export class Column {
  title: string;
  key: string;
  rander: Function;
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;

  constructor(title: string, key: string, rander: Function, options: IColumnOptions) {
    this.title = title;
    this.key = key;
    this.rander = rander;
    this.order = !!options.order;
    this.visibility = !!options.visibility;
    this.width = options.width ? options.width : 200;
    this.resize = !!options.resize;
  }

  static getValue(key: string): any {
    return (row: any) => {
      return row[key];
    }
  }
}
