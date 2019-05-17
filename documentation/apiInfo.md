apiInfo <a name="apiInfo"></a>
-------
### get <a name="getInfo"></a>

Gets general information about the Connect API.

**Sample**
```JS
await factomConnectSDK.apiInfo.get();
```
**Parameters**

| **Name**                 | **Type** | **Description**                                                                                                                                                                                                                                                                                                                               | **SDK Error Message & Description** |
|--------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `params.accessToken` | optional | object </br>  This is the override parameter that allows user to specify the following two authentication parameters which will override the same parameters which have already been set on the instantiation of the SDK class </br>  * `appId` (string) </br> * `appKey`  (string)|
| `params.baseUrl` | optional | string </br>  This is the override parameter that allows user to specify a different API Base URL for your application (which you can see by clicking on any of the applications in the application list the you see upon logging into https://account.factom.com)   |

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
