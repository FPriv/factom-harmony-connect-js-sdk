apiInfo <a name="apiInfo"></a>
-------
### get <a name="getInfo"></a>

Gets general information about the Connect API.

**Sample** 
```JS
await factomConnectSDK.apiInfo.get();
```

**Returns** 

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
