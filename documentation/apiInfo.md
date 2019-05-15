apiInfo <a name="apiInfo"></a>
-------
### get <a name="getInfo"></a>

Gets general information about the Connect API.

**Sample** 
```JS
await factomConnectSDK.apiInfo.get();
```
**Parameters**
| **Name**                  | **Type**                               | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                      | **SDK Error Message & Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `params.clientOverrides`  | optional                               | object </br>  This is the override parameter that allows user to specify which instantiation of the SDK to be overridden simply by adding `params.clientOverrides.[property]`.</br> In which, properties are allowed to be overridden are: </br>   - accessToken</br>   - accessToken.appId</br>   - accessToken.appKey</br>   - baseUrl</br>                                                                                                        |                                                                                                                                                                         
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
