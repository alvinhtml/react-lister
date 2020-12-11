import * as React from "react";
import {Column} from '~/column';

type IConfigProps = {
  columns: Array<Column>;
  limit: number;
  setVisibility: Function;
  setLimit: Function;
}

export default class Config extends React.Component<IConfigProps, {opened: boolean}> {

  limitItem: Array<number> = [10, 20, 50, 100, 200];

  constructor(props: IConfigProps) {
    super(props);

    this.state = {
      opened: false
    }

    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  //阻止鼠标 onMouseDown 事件冒泡
	stopMouseEvent(e: React.MouseEvent<HTMLElement>): void {
		e.nativeEvent.stopImmediatePropagation();
		e.stopPropagation();
	}

  handleMouseDown(): void {
    this.hide();
  }

  handleToggle(): void {
    this.state.opened ? this.hide() : this.show();
  }

  show(): void {
    document.addEventListener("mousedown", this.handleMouseDown, false);
    this.setState({
      opened: true
    });
  }

  hide(): void {
    document.addEventListener("mousedown", this.handleMouseDown, false);
    this.setState({
      opened: false
    });
  }

  setVisibility(key: string, visibility: boolean): void {
    const {setVisibility} = this.props;
    setVisibility(key, !visibility);
  }

  public render(): React.ReactNode {
    const {columns, limit, setLimit} = this.props;
    const {opened} = this.state;

    return (
      <div className="lister-config" onMouseDown={this.stopMouseEvent}>
        <div className="lister-btn" onClick={this.handleToggle.bind(this)}><i className="fa-cog" /> 设置</div>
        <div className={`lister-config-body ${opened ? 'opened' : ''}`}>
          <h4>每页显示条数</h4>
          <ul className="column-limit">
            {this.limitItem.map(item => <li key={item} className={`lister-btn tiny ${item === limit ? 'active' : ''}`} onClick={(): void => {setLimit(item)}}>{item}</li>)}
          </ul>
          <h4>显示项</h4>
          <ul className="column-visibility">
            {
              columns.map(column => (
                <li key={column.key}>
                  <div onClick={this.setVisibility.bind(this, column.key, column.visibility)} className={`column-visibility-toggle ${column.visibility ? 'visible' : ''}`}>{column.title}</div>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    );
  }
}
