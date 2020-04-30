# react-lister

react data list

## Install

```bash
npm install react-lister --save
```

## Usage

### Example

`List.jsx`

```js
import * as React from 'react';
import {ButtonGroup, Button} from 'react-miniui';
import Lister, {Column, withLister} from 'react-lister';
import'~/node_modules/react-lister/dist/lister.css';


const options = {
  order: true, // 是否需要排序
  visibility: true, // 是否可见
  width: 200, // 列表的初始宽度，默认 200
  resize: true // 是否允许拖动改变列宽度
}

const userColumns = [
  new Column('用户', 'name', row => <React.Fragment>{row.name}</React.Fragment>, options),
  new Column('邮箱', 'email', row => <span>{row.email}</span>, options),
  new Column('角色', 'type', row => <span>{row.type}</span>, options),
  new Column('操作', 'option', row => <Button size="small" color="red">delete</Button>)
]

class UserList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIDs: []
    };
  }

  handleSelect = (selectedIDs: Array<string>) => {
    this.setState({
      selectedIDs
    });
  };

  handleDeleteAll() {
    const {selectedIDs} = this.state;
  }

  render() {
    const {toggleSelectAll, rows, reload, createRef, columns} = this.props;

    return (
      <div>
        <Lister
          ref={createRef}
          rows={rows}
          total={103}
          columns={columns}
          page={1}
          selectable={true}
          onSelect={this.handleSelect}
          reload={reload}
        >
          <ButtonGroup>
            <Button color="blue" onClick={toggleSelectAll}>select all</Button>
            <Button color="red" onClick={this.handleDeleteAll.bind(this)}>del all</Button>
          </ButtonGroup>
        </Lister>
      </div>
    );
  }
}

export default withLister(UserList, 'user', userColumns);
```

`UserActions.jsx`

```js
import React, {Component} from 'react';
import superagent from 'superagent';
import List from '~/List';

const rowKey = 'id';

class User extends Component {

  constructor(props) {
    super(props);

    this.state = {
      users: []
    }
  }

  componentDidMount() {
    this.loadUser(1);
  }

  async loadUser(page = 1, order = ['name', 'asc']) {
    try {
      const users = await superagent.get('/api/user')
        .query({
          page,
          order: `${order[0]},${order[1]}`
        });

      this.setState({
        users: users.body
      })

    } catch(err) {
      throw err;
    }
  }

  render() {
    const {users} = this.state;

    return (
      <div>
        <List
          rows={users}
          rowKey={rowKey}
          reload={({page, order}) => {
            this.loadUser(page, order);
          }}
        />
      </div>
    );
  }
}

export default User;
```
