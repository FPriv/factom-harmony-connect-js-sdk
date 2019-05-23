anchors <a name="anchors"></a>
-------
### get <a name="getAnchors"></a>

Gets a receipt that describes the series of hashes going from the raw entry data to the directory block key Merkle root.

**Sample**
```JS
await factomConnectSDK.anchors.get({
  entryHash: 'ee20a02ea6c30ef5b8bc3449cb97008f1b56f064362994ec5e012ee955dbeb4a'
});
```
or
```JS
await factomConnectSDK.anchors.get({
  height: '22'
});
```

**Returns**

**Response:** OK
-   **data:** object </br> Contains information about the desired Directory Block Anchor.
	-   **data.dblock:** object </br> The directory block that contains this entry block.
	    -   **data.dblock.keymr:** string </br> The Key Merkle Root for this directory block.
	    -   **data.dblock.height:** integer </br> The Factom block height of this block.
	    -   **data.dblock.href:** string </br> An API link to retrieve all available information about this directory block.
  -   **data.anchors:** [object] </br> Contains detailed information about the returned Anchors.
      -   **data.anchors.network** string </br> The network being anchored to.
      -   **data.anchors.status** string </br> Describes the current state of the anchoring process
      -   **data.anchors.created_at** string </br> The timestamp for this entry. Sent in ISO 8601 Format. For example: YYYY-MM-DDThh:mm:ssZ
      -   **data.anchors.entry_serialized** string </br> The raw data that makes up the entry.
      -   **data.anchors.entry_hash** string </br> The unique identitfier of the entry.
      -   **data.anchors.merkle_branch** [object] </br> The branch of the merkle tree that represents this entry. Presented as an array of Merkle nodes.
          -   **data.anchors.merkle_branch[].right** string </br> The right branch of this node of the Merkle tree.
          -   **data.anchors.merkle_branch[].top** string </br> The top of this node of the Merkle tree.
          -   **data.anchors.merkle_branch[].left** string </br> The left branch of this node of the Merkle tree.
      -   **data.anchors.dblock** string </br> The directory block that contains this entry block.
          -   **data.anchors.dblock.keymr** string </br> The Key Merkle Root for this directory block.
          -   **data.anchors.dblock.height** string </br> The Factom block height of this block.
          -   **data.anchors.dblock.href** string </br> An API link to retrieve all available information about this directory block.

```JS
{
  "data": {
    "dblock": {
      "keymr": "9423f275c4bfe567ff74cefdee646cb2ac639af0a32fb7ba43265d30a86b412e",
      "height": 14396,
      "href": "/v1/dblocks/9423f275c4bfe567ff74cefdee646cb2ac639af0a32fb7ba43265d30a86b412e",
    },
    "anchors": [
      {
        "network": "factom",
        "status: "confirmed",
        "created_at": "2019-04-15T15:46:04Z",
        "entry_serialized": "008774e15f162f4e3a8f03bc7d4c5845bf9bee9bc9c4155802366f90ae92b47c900012000474657374000474657374000474657374746573740a",
        "entry_hash": "36993363235ba2204877e78e9e1b4d5055edfa838df58ebb077098697adbeee5",
        "merkle_branch": [
        {
          "right": "0000000000000000000000000000000000000000000000000000000000000006",
          "top": "5ae8146c21527901cff56c8b5004a3675a4268229f2a7e3802ecd07d0910a107",
          "left": "36993363235ba2204877e78e9e1b4d5055edfa838df58ebb077098697adbeee5"
        },
        {
          "right": "5ae8146c21527901cff56c8b5004a3675a4268229f2a7e3802ecd07d0910a107",
          "top": "43e55fc368f8243958d25e16a67ec16074276fb379f36d368593422cf3df21a5",
          "left": "798e2cf5d132ff8634cdf846f2facafc66d1d3b53573098ffcfc43bc97448e3c"
        },
        {
          "right": "43e55fc368f8243958d25e16a67ec16074276fb379f36d368593422cf3df21a5",
          "top": "fcd21fedfe23ea79df5c79c9aab77640a76c7f40ae2a97354cd4f9958d7e661a",
          "left": "8774e15f162f4e3a8f03bc7d4c5845bf9bee9bc9c4155802366f90ae92b47c90"
        },
        {
          "right": "fcd21fedfe23ea79df5c79c9aab77640a76c7f40ae2a97354cd4f9958d7e661a",
          "top": "3afbee04fc2eecfe8af8b1e30f828bee9792b15d05c888afac8db5b835f3bad2",
          "left": "78c87c440e771e2f8aaa27012acd5021211fb2c8b6d8437c4bad8dd9e9bcb294"
        },
        {
          "right": "3afbee04fc2eecfe8af8b1e30f828bee9792b15d05c888afac8db5b835f3bad2",
          "top": "46556e7b4a788510c3ab383564e95539ccb2a24fec294c4d42ee6c93b66b1231",
          "left": "114d36308dda1d749b529d8ed21f0471777390fab69fb1ca69d71438bb286234"
        },
        {
          "right": "46556e7b4a788510c3ab383564e95539ccb2a24fec294c4d42ee6c93b66b1231",
          "top": "7818914aff2c1f1c224c1542a2c33ba639dce2ccac14c346cd6f82fa60dea84c",
          "left": "643df17024a3a3cfcc7bff522ade7e0ed46637961a65b66b912fcdff4e5b3a72"
        }
        ],
        "dblock": {
          "keymr": "7818914aff2c1f1c224c1542a2c33ba639dce2ccac14c346cd6f82fa60dea84c",
          "height": 180678,
          "href": "/v1/dblocks/7818914aff2c1f1c224c1542a2c33ba639dce2ccac14c346cd6f82fa60dea84c",
        }
      }
    ],
  }
}
```
