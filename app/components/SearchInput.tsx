import * as React from "react";

type IProps = {
  visibility: boolean;
  columnKey: string;
  onChange: Function;
}

export default class SearchInput extends React.Component<IProps, {value: string}> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      value: ''
    }
  }

  handleChange(event: Event): void {
    const {onChange, columnKey} = this.props;
    const element = event.currentTarget as HTMLInputElement;
    const value = element.value;

    this.setState({
      value
    });

    onChange(value, columnKey);
  }

  handleClear(): void  {
    const {onChange, columnKey} = this.props;

    this.setState({
      value: ''
    });

    onChange('', columnKey);
  }

  public render(): React.ReactNode {
    const {visibility, columnKey} = this.props;

    return (
      visibility
      ? (
        <div className="lister-search-input">
          <input value={this.state.value} name={`lister-search-${columnKey}`} onChange={this.handleChange.bind(this)} />
          <span onClick={this.handleClear.bind(this)}>×</span>
        </div>
      )
      : <div />
    );
  }
}
