---
title: (Trouble Shooting) webpack path alias - Module not found Error
tags:
  - '#webpack'
  - '#trouble-shooting'
createdAt: 2024-04-25 12:38
updatedAt: 2024-04-25 14:00
---

## Module not found: Error: Can't resolve '@/common/constants'

### What

```bash
ERROR in ./src/public/js/index.ts 2:0-52
Module not found: Error: Can't resolve '@/common/constants' in '/Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/src/public/js'
resolve '@/common/constants' in '/Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/src/public/js'
  Parsed request is a module
  using description file: /Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/package.json (relative path: ./src/public/js)
    resolve as module
      /Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/src/public/js/node_modules doesn't exist or is not a directory
      /Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/src/public/node_modules doesn't exist or is not a directory
      /Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/src/node_modules doesn't exist or is not a directory
      looking for modules in /Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/node_modules
        /Users/gloria/Documents/mio/nomad-lecture/apps/zoom-clone/node_modules/@/common doesn't exist
      /Users/gloria/Documents/mio/nomad-lecture/apps/node_modules doesn't exist or is not a directory
      looking for modules in /Users/gloria/Documents/mio/nomad-lecture/node_modules
        /Users/gloria/Documents/mio/nomad-lecture/node_modules/@/common doesn't exist
      /Users/gloria/Documents/mio/node_modules doesn't exist or is not a directory
      /Users/gloria/Documents/node_modules doesn't exist or is not a directory
      /Users/gloria/node_modules doesn't exist or is not a directory
      /Users/node_modules doesn't exist or is not a directory
      /node_modules doesn't exist or is not a directory
```

### Why

`tsconfig.json`에 **path alias**를 사용하기 위해 다음과 같이 설정을 하고..

```json
// tsconfig.json
  "compilerOptions": {
    //...SKIP
    "baseUrl": "./",
    "paths": {
      "~/*": ["src/*"]
    }
  },
```

`webpack.config.ts`에도 동일하게 설정을 해주었다.

```typescript
const resolve = (file: string) => path.join(process.cwd(), file);

const config: webpack.Configuration = {
  //...SKIP
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
	    '~/*': resolve('src/'),
    }
  },
//...SKIP
```

위와 같이 설정을 해도...webpack에서 번들링하는 과정에서 정의된 `path alias`를 제대로 인식하지 못하는 것으로 보여졌다.
아무리 구글링을 해보아도 관련 오류들은 모두 tsconfig와 webpack의 alias 설정 부분들을 맟추어 주면 된다고 하는데....
생성된 webpack config를 console log로 출력해도 의도한 데로 잡혀있으나,
에러가 발생하면서 생성된 번들링된 파일을 열어서 보아도 alias 부분이 실제의 경로로 치환이 되지 않고 생성이 되고 있었다.

### How

위의 이슈로 한참을...구글링하다가 stackoverflow에서 [Webpack is not working with Typescript aliases](https://stackoverflow.com/questions/71884238/webpack-is-not-working-with-typescript-aliases)과 같은 질문의 글을 발견했고, 누군가 답변으로 [tsconfig-paths-webpack-plugin](https://www.npmjs.com/package/tsconfig-paths-webpack-plugin)을 이용한 설정을 제안했다.
해당 플러그인을 사용하면, `tsconfig.json`을 통해서만 alias를 정의하고, webpack에서는 해당 설정 파일을 읽어들여 alias 부분을 webpack에 설정해주는 방식이었고, 오히려 이 방법으로 이슈를 해결할 수 있다면...
하나의 파일에서만 alias에 대한 관리를 하면 되므로 관리적인 측면으로도 효율적이라는 생각이 들었다.

그래서 해당 플러그인을 적용하여 다음과 같이 webpack config 파일을 수정하였고, 정상적으로 빌드가 수행되는 것을 확인할 수 있었다.

```typescript
//...SKIP
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

//...SKIP
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve('tsconfig.json'),
        extensions: ['.ts', '.tsx'],
      }),
    ],
  },
//...SKIP
```
