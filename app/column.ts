export class Column {
  title: string;
  randerValue: Function;
  order: boolean;
  visibility: boolean;
  width: number;
  resize: boolean;

  constructor(props: {
    title: string;
    value: Function;
    order?: boolean;
    visibility?: boolean;
    width?: number;
    resize?: boolean;
  }) {
    this.title = props.title;
    this.randerValue = props.value;
    this.order = !!props.order;
    this.visibility = !!props.visibility;
    this.width = props.width ? props.width : 200;
    this.resize = !!props.resize;
  }

  static getValue(key: string) {
    return (row: any) => {
      return row[key];
    }
  }
}
