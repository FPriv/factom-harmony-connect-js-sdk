identities
-----
An **Identity** contains 3 components: a names array, a set of currently active keys, and an auditable history of what other keys were active at a given point in time.

Each **Identity** uses their currently active keys to sign messages, proving that the messages came from the Identity. These messages are typically chains and entries that are written to the blockchain, but can be used off-chain as well for scenarios such as authentication.

The **Keys** for an **Identity** have priorities, where keys with a higher priority take precedence over those below them.

- Key priority is indicated by its index in the key array, i.e [“priority 1”, “priority 2”, “priority 3”].
- Keys can be replaced by those at the same or higher priority.
- The first key is the highest priority key for an Identity. Since it can be used to replace all other keys, it should be kept the most secure and used the least frequently to reduce the risk of it being mishandled or compromised. We recommend storing this key in “cold storage”.
- The lower priority keys are typically kept in “hot storage” and accessible for use by your live application. Still, these keys should be treated with care, for example: not being stored in repositories or not being stored in plaintext, etc. as they could be used by anyone, whom obtains them to indicate ownership of an Identity.


#### create

Creates a new Identity chain. You will need to include a unique names array for your Identity. This method will automatically generate 3 Public/Private keys pairs for you and return them, be sure to save them for future use. Optionally, you can pass in an array of public keys you have generated on your own, at which point no keys will be returned.

**Parameters:**

| **Name**                | **Type** | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **SDK Error Message & Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|-------------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `params.names`          | required | array of strings </br> The names array for your identity must </br> be unique. We recommend generating </br> a unique identifier, such as a UUID.</br> **Do NOT put personally identifiable </br> information (PII) or your database </br> records’ ID's on the blockchain.** </br> **Note:** Since the Connect API requires each </br> array element to be Base64 encoded, </br>  the SDK will do so before making the API request.                                                                                                                                                                                                             | **at least 1 name is required.** </br> `names` parameter was not provided. </br> **names must be an array.** </br> An invalid `names` format was provided.  </br> **calculated bytes of names and keys is <*totalBytes*>.</br> It must be less than 10240, use less/shorter names or less keys.** </br> Too many `names` or `keys` were provided resulting</br> in calculated bytes being larger than 10kb.                                                                                                                                                                                                                                                                                                                      |
| `params.keys`           | optional | array of strings </br> An array of public key strings in </br> base58 idpub format, ordered from the </br> highest to the lowest priority. </br> **Note:** `keys` must be in base58 idpub format.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **at least 1 key is required.** </br> An empty array of strings was provided for `keys` parameter. </br> **"*invalid key*" key is invalid.** </br> An invalid key for `keys` parameter was provided.</br> `keys` must be in base58 idpub format.</br> ***"duplicated key"* key is duplicated; keys must be unique.** </br> A duplicate key for the `keys` parameter was provided. </br> **keys must be an array.** </br> An invalid `keys` format was provided. </br> **calculated bytes of names and keys is <*totalBytes*>.  </br> It must be less than 10240, use less/shorter names or less keys.** </br> Too many `names` or `keys` were provided resulting  </br> in calculated bytes being larger than 10kb.
| `params.callbackUrl`    | optional | string </br> The URL you would like the callbacks  </br> to be sent to. </br> **Note:** If this is not specified, callbacks </br> will not be activated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **callbackUrl is an invalid url format.** </br> An invalid `callbackUrl` format was provided.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `params.callbackStages` | optional | array of strings </br> The immutability stages you would like to be notified about.  </br> This list can include any or all of these three  </br> stages: `replicated`, `factom`, and </br> `anchored`. For example: when you </br> would like to trigger the callback from </br> Connect at `replicated` and `factom` </br> stage, you would send them in the </br> format: [‘replicated’, ‘factom’]. </br> **Note:** For this field to matter, the URL </br> must be provided. </br> If callbacks are activated (URL has </br> been specified) and this field is not </br> sent, it will default to `factom` and </br> `anchored`. | **callbackStages must be an array.** </br> An invalid `callbackStages` format was provided.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

**Returns:**

**Response**: Accepted
-   **chain_id**: string </br> The unique identifier of the chain that has been created for this identity.
-   **entry_hash:** string </br> The unique identifier of the first entry that has been created in this identity chain.
-   **stage:** string </br> The current immutability stage of the identity chain and its first entry.
-   **key_pairs:** an array of objects </br> The 3 key pairs generated automatically by Factom SDK. This value is not returned if the public keys are provided when creating this identity.
    - **key_pairs[].public_key:** string </br>
The public key in base58 Idpub format. </br>
    - **key_pairs[].private_key:** string </br>
The private key in base58 Idsec format. 

#### get

Gets a summary of the identity chain's current state.

**Parameters:**

| **Name**                 | **Type** | **Description**                                                       | **SDK Error Message & Description**                                                   |
|--------------------------|----------|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `params.identityChainId` | required | string </br> The unique identifier for the identity chain being requested. | **identityChainId is required.**  </br> `identityChainId` parameter was not provided. |

**Returns:**</br> 
**Response**: OK
- **data:** object
- **data.version:** string </br> The identity chain's schema version. This details the format of this digital identity. For more information about the Factom identity schemas, view the documentation [here] (URL).
- **data.stage:** string </br>  The immutability stage that this chain has reached. The identity can be considered active once it (and thus its keys) reaches the `factom` stage.
- **data.created_height:** integer </br> The block height at which this chain was written into the Factom blockchain. This is null if the chain has not reached the `factom` stage.
- **data.chain_id:** string</br> The unique identifier of this identity chain. 
- **data.names:** array of strings </br> A unique array of strings that together constitute the identity's name.</br>  **Note:** Since the Connect API Base64 encodes these values for transport, each array element will be decoded for you by the SDK.
- **data.all_keys_href:** string </br> An API link to retrieve the keys for this identity.
- **data.active_keys:** array of objects </br> An array of currently active public identity keys ordered from the highest to the lowest priority.
	-   **data.active_keys[].key:** string </br> The public key string in base58 idpub format.
	-   **data.active_keys[].activated_height:** integer </br> The height at which this key became active for this identity.
	-   **data.active_keys[].retired_height:** integer </br> The height at which this key was retired for this identity. This will be null if key is still active.
	-   **data.active_keys[].priority:** integer </br> The level of this key within the hierarchy. A lower number indicates a key that allows a holder to replace higher numbered keys. The master key is priority 0.
	-   **data.active_keys[].entry_hash:** string </br> The hash of the entry that was made documenting the key replacement.


#### keys

##### list

Returns all of the keys that were ever active for this Identity. Results
are paginated. 

**Parameters:**

| **Name**                 | **Type** | **Description**                                                                                                                                                                                                                                                                                               | **SDK Error Message & Description**                                                           |
|--------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `params.identityChainId` | required | string </br> The unique identifier of the identity</br> chain whose keys are being requested.                                                                                                                                                                                                                 | **identityChainId is required.** </br> `identityChainId` parameter was not provided.          | |
| `params.limit`           | optional | integer </br> The maximum number of keys you</br>  would like to be returned. The default value</br>  is 15.                                                                                                                                                                                | **limit must be an integer.** </br> An invalid `limit` format was provided.                   |
| `params.offset`          | optional | integer </br> The key index (in number of keys from</br> the first key) to start from in the list of all</br> keys. For example, if you have already</br> received the first 15 keys and you would like</br> the next set, you would send an offset of 15. Default value is 0 which</br> represents the first item. | **offset must be an integer.** </br> An invalid `offset` format was provided.                 |

**Returns:**

**Response**: OK
-   **data:** array of objects </br> An array of public identity keys in the order that they were added to the identity.
	-   **data[].key:** string </br> The public key string in base58 idpub format.
	-   **data[].activated_height:** integer </br> The height at which this key became active for this identity.
	-   **data[].retired_height:** integer </br> The height at which this key was retired for this identity. The value will be null if the key is still active.
	-   **data[].priority**: integer </br>
The level of this key within the hierarchy. A lower number indicates a key that allows a holder </br> 
to replace higher numbered keys. The master key is priority 0. 
    - **data[].entry_hash**: string
 </br> The entry hash of the entry where this key was activated.

-   **offset**: integer </br> The index of the first key returned from the total set, which starts from 0.
-   **limit**: integer </br> The number of keys returned in the "data" object.
-   **count**: integer </br> The total number of keys found (both active and retired) for the identity.

##### get

Gets information about a specific public key for a given Identity,
including the heights at which the key was activated and retired if
applicable.

**Parameters:**

| **Name**                 | **Type** | **Description**                                                                                   | **SDK Error Message & Description**                                                                                                                        |
|--------------------------|----------|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `params.identityChainId` | required | string </br> The unique identifier for the Identity </br> that the key belongs to.                                | **identityChainId is required.** </br> `identityChainId` parameter was not provided.                                                                       |
| `params.key`             | required | string </br> The public key string to get information,</br> which must be in base58 idpub format. | **key is required.** </br> `key` parameter was not provided. </br> **key is invalid.** </br> An invalid `key` format was provided. |

**Returns:**

**Response**: OK
-   **data:** object
	-   **data.key:** string </br> The public key string in base58 idpub format.
	-   **data.activated_height:** integer </br> The height at which this key became active for this identity.
	-   **data.retired_height:** integer </br> The height at which this key was retired for this identity. The value can be null if key is still active.
	-   **data.priority:** integer </br> The level of this key within the hierarchy. The master key is priority 0. 
	-   **data.entry_hash:** string </br> The entry hash of the entry where this key was activated.

##### replace

Creates an entry in the Identity Chain for a key replacement, which means the old key will be deactivated (referred to as a “retired” key) and the new key will be activated. 

To do this, a user must send the key to be replaced (`oldPublickey`), a signature authorizing the replacement and the public key that can be used to validate this signature. The signing key must be of an equal or higher level than the key that is being replaced.

This method will automatically generate a new key pair for you and return it. Optionally, you can provide your own new public key for a keypair you have generated yourself, at which time no keys will be returned. The key pair generated automatically by the SDK will be returned for you to save.



**Parameters:**

| **Name**                  | **Type** | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **SDK Error Message & Description**                                                                                                                                                                                                     |
|---------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `params.identityChainId`  | required | string </br> The unique identifier of the identity</br>  chain being requested                                                                                                                                                                                                                                                                                                                                                                                                                                                    | **identityChainId is required.** </br> `identityChainId` parameter was not provided.                                                                                                                                                    |
| `params.oldPublicKey`     | required | base58 string in Idpub format </br>  The public key to be retired and replaced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **oldPublicKey is required.** </br> `oldPublicKey` parameter was not provided. </br> **oldPublicKey is an invalid public key.** </br> An invalid `oldPublicKey` parameter was provided </br> or key’s byte length is not equal to 41.   |
| `params.newPublicKey`     | optional | base58 string in Idpub format </br> The new public key to be activated and take its place.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **newPublicKey is an invalid public key.** </br> An invalid `newPublicKey` parameter was provided </br> or key’s byte length is not equal to 41.                                                                                        |
| `params.signerPrivateKey` | required | base58 string in Idsec format </br> The private key to use to create the </br> signature, which must be the same or </br> higher priority than the public key to be </br> replaced.                                                                                                                                                                                                                                                                                                                                                                                                                                                          | **signerPrivateKey is required.** </br> `signerPrivateKey` parameter was not provided. </br> **signerPrivateKey is invalid.** </br> An invalid `signerPrivateKey` parameter was provided </br> or key’s byte length is not equal to 41. |
| `params.callbackUrl`      | optional | string </br> The URL you would like the callbacks </br> to be sent to. </br> **Note:** If this is not specified, callbacks will not be activated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **callbackUrl is an invalid url format.** </br> An invalid `callbackUrl` format was provided.                                                                                                                                           |
| `params.callbackStages`   | optional | array of strings </br> The immutability stages you'd like to be </br> notified about. This list can include any </br> or all of these three stages: `replicated`,</br> `factom`, and `anchored`. </br>  For example: when you would like to </br> trigger the callback from Connect from </br> `replicated` and `factom` then you should </br> send them in the format: [‘replicated’, </br> ‘factom’].  </br> **Note:** For this field to matter, the URL </br> must be provided. If callbacks are activated (URL has </br> been specified) and this field is not </br> sent, it will default to `factom` and </br> `anchored`. | **callbackStages must be an array.** </br> An invalid `callbackStages` format was provided.                                                                                                                                             |

**Returns**

**Response**: OK
-   **entry_hash:** string </br> The entry hash that will point to the key replacement entry on the blockchain.
-   **stage**: string </br> The current immutability stage of the new entry.
-   **key_pair:** object </br> The key pair generated automatically by the Factom SDK. This value will not be returned if the new public key is provided when calling this method. 
    - **key_pair.public_key:** string</br> 
The public key in base58 Idpub format. 
    - **key_pair.private_key:** string</br> 
    The private key in base58 Idsec format. 