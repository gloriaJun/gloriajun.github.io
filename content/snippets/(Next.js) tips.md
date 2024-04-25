### 개발 모드에서만 라우팅이 동작하도록 하기

#### App Route

```javascript
// pages/api/secret.js

export default function handler(req, res) {
  if (process.env.NODE_ENV === 'development') {
    // 개발 모드에서만 동작하는 코드
    res.status(200).json({ message: 'This is a development-only API route.' });
  } else {
    // 프로덕션 모드에서는 접근 금지
    res.status(404).json({ error: 'Not found' });
  }
}
```

#### Page Route

```javascript
// pages/secret-page.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SecretPage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      // 개발 모드가 아닐 때는 홈페이지로 리디렉션
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      {process.env.NODE_ENV === 'development' ? (
        <p>This page is only available in development mode.</p>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}
```
