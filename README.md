# license-bb
 SDK to create license for any project.

#### Install using below command.
```
$ npm i license-bb@latest

```

#### Import Package in JavaScript/NodeJs.
```
const {License} = require('license-bb');

```

#### Import Package in TypeScript.
```
import { License } from "license-bb";

```

#### At the time of initialization 'License Key' is required, This product code is auto generated code from BBLicense when you add any new product. [BBLicense](https://licensing.crib4u.com/sign-in)

#### - When it load it will take your system info for security purpose and for License purpose.

#### - Below functions to access the functionality


#List of Functions

| Function Name             | Parameters                            | 
| -------------------       |--------------------                    |
| `License.init()`       | base_Url: String
license_Key: String
clientData: Object                | 
| `License.getFeature()`| org_Id: String
featureName: String     | 
| `License.updateLicense()`  | license_Key: String
org_Id: String
assignType: String     | 

| Key | value | description/purpose | 
|----- |------ |------ |
| `code` | 1 | Success response from SDK |
| ---  | -1 | Fail/Invalid/Error response from SDK |
| ---  | -2 | Request fail with licensing server (SDK communicating with license server.) |
| `data` | Object | On success you will get data object but incase of features you will get value instead od object. |
| `result` | String | Message based on different response code. |

## Authors

- [@Sachin Londhe](https://github.com/sachin-8055)