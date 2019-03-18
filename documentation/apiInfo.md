# Table of Contents

1. apiInfo
- [get](#get)

apiInfo
-------
### get <a name="get"></a>

Gets general information about the Connect API.

**Sample**  <a name="sample"></a>
```JS
await factomConnectSDK.apiInfo.get();
```

**Returns** <a name="returns"></a></br> 

**Response:** OK
-   **version:** string </br> Current version of the Connect API.
-   **links**: object </br> Links to internal paths of the application.
	-   **links.chains:** string </br> The link to chain API.

```JS
{  
   'version':'1.0.17',
   'links':{  
      'chains':'/v1/chains'
   }
}
```
