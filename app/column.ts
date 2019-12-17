interface IColumnOptions {
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;
}

export class Column {
  title: string;
  value: Function;
  randerValue: Function;
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;

  constructor(title: string, getValue: Function, randerValue: Function, options: IColumnOptions) {
    this.title = title;
    this.value = getValue;
    this.randerValue = randerValue;
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
