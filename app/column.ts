interface IColumnProps {
  title: string;
  value: Function;
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;
}

class Column {
  title: string;
  value: Function;
  order?: boolean;
  visibility?: boolean;
  width?: number;
  resize?: boolean;

  constructor(props: IColumnProps) {
    this.title = props.title;
    this.value = props.value;
    this.order = !!props.order;
    this.visibility = !!props.visibility;
    this.width = props.width ? props.width : 200;
    this.resize = !!props.resize;
  }

  static getValue(key: string): any {
    return (row: any) => {
      return row[key];
    }
  }
}

export {
  Column
}
