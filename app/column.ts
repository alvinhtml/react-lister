interface Row {
  [key: string]: string
}

interface IColumnOptions {
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;
  getter?: Function;
}

const defaultOptions = {
  order: false,
  visibility: true,
  width: 200,
  resize: false
}

export class Column {
  title: string;
  key: string;
  rander: Function;
  order: boolean;
  visibility: boolean;
  width: number;
  resize: boolean;
  getter?: Function;
  searchVlaue: string

  constructor(title: string, key: string, rander: Function, options: IColumnOptions = defaultOptions) {
    this.title = title;
    this.key = key;
    this.rander = rander;
    this.order = !!options.order;
    this.visibility = !!options.visibility;
    this.width = options.width || 200;
    this.resize = !!options.resize;
    this.getter = options.getter;
    this.searchVlaue = '';
  }

  static Getter(key: string): Function {
    return (row: Row): string => {
      return row[key];
    }
  }

  static getValue(key: string): any {
    return (row: any): string => {
      return row[key];
    }
  }

  public setSearchValue(value: string): void {
    this.searchVlaue = value;
  }

  public setVisibility(visibility: boolean) {
    this.visibility = !!visibility;
  }

  public setWidth(width: number) {
    this.width = width;
  }

}
