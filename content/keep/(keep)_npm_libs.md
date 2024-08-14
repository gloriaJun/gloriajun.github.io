### devDependencies

#### [npm-package-arg](https://www.npmjs.com/package/npm-package-arg)

- 패키지를 다루기 위한 유틸리티 라이브러리
- 패키지의 이름, 버전, 레지스트리 등을 파싱하고 조작하기 위해 사용된다.

```javascript
const npa = require('npm-package-arg');

// 패키지 식별자 문자열
const pkgArg = 'express@^4.17.1';

// 패키지 식별자 파싱
const result = npa(pkgArg);

console.log(result);
// 결과: {
//   registry: 'npm',
//   name: 'express',
//   fetchSpec: '^4.17.1',
//   saveSpec: '^4.17.1',
//   raw: 'express@^4.17.1',
//   spec: '^4.17.1',
//   type: 'range'
// }
```
