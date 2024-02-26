
#mock-api #javascript 

```typescript
import { RestRequest, DefaultBodyType, PathParams, ResponseComposition, RestContext, rest } from 'msw';  
  
import { MockedResponseResolver } from '@tests/msw/types';  
   
type ResponseDelayTimeOption = { min?: number; max?: number };  
type ApiResponseContentData = Record<string, unknown> | Array<unknown> | string | null | undefined;  
type MswArguments = {  
  request: RestRequest<DefaultBodyType, PathParams<string>>;  
  response: ResponseComposition;  
  context: RestContext;  
};  
type ApiMockResponseArgument = MswArguments & {  
  interceptData?: {  
    content?: ApiResponseContentData;  
    mapObject?: {  
      mapData: Record<string, unknown>;  
      mapKey: string;  
      defaultData?: ApiResponseContentData;  
    };  
    options?: {  
      statusCode?: number;  
      message?: string;  
      errorContent?: Record<string, unknown>;  
      delayTimeOption?: ResponseDelayTimeOption;  
    } & Record<string, unknown>;  
    code?: number | string;  
    errorCode?: number | string;  
    isErrorResponse?: boolean;  
  };  
};  
  
export const apiMockRequest = (method: keyof typeof rest, url: string, resolver: MockedResponseResolver) => {  
  const apiUrl = new URL(url, 'api-domain');  
  // return rest[method](apiUrl.toString(), resolver);  
  return rest[method](apiUrl.toString(), resolver);  
};  
  
export const apiMockResponse = ({ request, response, context, interceptData }: ApiMockResponseArgument) => {  
  const {  
    content,  
    mapObject,  
    code = 0,  
    errorCode,  
    isErrorResponse,  
    options: {  
      statusCode = undefined,  
      message = undefined,  
      errorContent = undefined,  
      delayTimeOption = undefined,  
      ...contentOptions  
    } = {},  
  } = interceptData ?? {};  
  const isError = !!(isErrorResponse && errorCode);  
  
  let responseData: {  
    code?: number | string;  
    content: ApiResponseContentData;  
    message: string;  
  };  
  
  if (isError) {  
    responseData = {  
      code: errorCode,  
      content: errorContent,  
      message: message ?? 'error message',  
    };  
  } else {  
    let data = content;  
  
    if (mapObject) {  
      const { mapData, mapKey, defaultData } = mapObject;  
      data = mapData[mapKey] as ApiResponseContentData;  
  
      if (data === undefined) {  
        if (defaultData === undefined) {  
          return request.passthrough();  
        }  
  
        data = defaultData;  
      }  
    }  
  
    responseData = {  
      code,  
      content: data ?? null,  
      message: message ?? 'ok',  
    };  
  }  
  
  const getResponseDelayTime = ({ min = 200, max = 500 } = {} as ResponseDelayTimeOption) => {  
    return Math.floor(Math.random() * (max - min)) + min;  
  };  
  
  return response(  
    context.delay(getResponseDelayTime(delayTimeOption)),  
    context.status(statusCode ? statusCode : isError ? 500 : 200),  
    context.json({  
      ...contentOptions,  
      ...responseData,  
      traceId: 'traceId-1234',
    })  
  );  
};
```


```typescript
import { apiMockRequest } from '@tests/msw/helpers';  
  
import { mockGetApi, mockPostApi } from './mocks';  
  
export default [  
  apiMockRequest('post', `api-url`, mockPostApi),  
  apiMockRequest('get', `api-url`, mockGetApi),  
];
```


```typescript
import { apiMockResponse } from '@tests/msw/helpers';  
import { MockedResponseResolver } from '@tests/msw/types';

export const mockFetchOneTimeToken: MockedResponseResolver = (req, res, ctx) => {  
  return apiMockResponse({  
    request: req,  
    response: res,  
    context: ctx,  
    interceptData: {  
      content: { ... },  
      errorCode: 21300,  
      isErrorResponse: false,  
    },  
  });  
};
```