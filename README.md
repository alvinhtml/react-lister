# react-lister

react data list

## Development

- Install npm packages

    ```
  npm install
    ```

- Launch dev server

    ```
  npm run start
    ```

- Lint

    ```
  npm run lint
    ```

- Build

    ```
  npm run build
    ```

## Install react-miniui

```bash
npm install react-lister --save
```

## Usage

```js
import * as React from 'react';
import Lister, {column} from 'react-lister';
import UserActions from '~/components/user/UserActions'

// 可以单独对每列进行配置，这里使用统一配置
const options = {
  order: true, // 是否需要排序
  visibility: true, // 是否可见
  width: 200, // 列表的初始宽度，默认 200
  resize: true // 是否允许拖动改变列宽度
}

//创建一个三列的表格
const columns = [
  new Column('用户', Column.getValue('name'), row => <span>{row.name}</span>, options),
  new Column('邮箱', Column.getValue('email'), row => <span>{row.name}</span>, options),
  new Column('操作', null, row => <UserActions row={row} />, options)
]

// user 的数据可以通过 AJAX 或 fetch 获取
const users = [{
  name: '张三',
  email: 'zhangsan@gmail.com'
}, {
  name: '李四',
  email: 'lsi@gmail.com'
}, {
  name: '王二',
  email: 'wanger@gmail.com'
}]

function User() {
  return (
    <div>
      <Lister
        rows={users}
        columns={columns}
        currentPage={1}
      >
      </Lister>
    </div>
  );
}

export default User;

```

`UserActions.jsx`

```js
import * as React from 'react';
import {Button} from 'react-miniui';

export default class UserActions extends React.Component {
  render() {
    return(
      <>
        <Button color="green" size="small">编辑</Button>
        <Button color="red" size="small">删除</Button>
      </>
    )
  }
}
```
