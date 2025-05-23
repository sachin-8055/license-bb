# license-bb
 SDK to create license for any project.

## 📦 Changelog

See [CHANGELOG](https://github.com/sachin-8055/license-bb/blob/main/CHANGELOG.md) for details.

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

| Function Name | Parameters | Example |
| :----------|:--------- | :--------- | 
| `License.init()` | `base_Url`: String <br />`license_Key`: String <br />`clientData`: Object | `base_Url`:'<LicenseServerBaseUrl>',<br />`license_Key`: 'XXXX-XXXXX-XXXX-XXX', <br />`clientData`: {<br />&nbsp;&nbsp;`email`:required*,<br />&nbsp;&nbsp;`phone`:required*,<br />&nbsp;&nbsp;`userName`:required*,<br />&nbsp;&nbsp;`orgId`:required*,<br />&nbsp;&nbsp;`orgName`:required*, <br />&nbsp;&nbsp;`assignType`: "default"<br />&nbsp;&nbsp;`serverNameAlias`:required*<br />}|
| `License.getFeatures()` | `org_Id`: String <br />`featureName`: String \| String[] | `org_Id`:'UniqueId',<br />`featureName`: 'users' <br /> OR `featureName`: ['users','teams'] <br /> OR `featureName`: 'all' |
| `License.updateLicense()` | `license_Key`: String <br />`org_Id`: String <br />`assignType`:String | `license_Key`: 'XXXX-XXXXX-XXXX-XXX',<br />`org_Id`: 'UniqueId'<br />`assignType`:'update' | 
| `License.sync()` | `license_Key`: String <br />`org_Id`: String |`license_Key`: 'XXXX-XXXXX-XXXX-XXX',<br />`org_Id`: 'UniqueId' |
| `License.getLicenseDetails()` | `org_Id`: String |`org_Id`: 'UniqueId' | 

| Key | value | description/purpose | 
|----- |------ |------ |
| `code` | 1 | Success response from SDK |
|   | -1 | Fail/Invalid/Error response from SDK |
|   | -2 | Request fail with licensing server (SDK communicating with license server.) |
| `data` | Object | On success you will get data object but incase of features you will get value instead of object. |
| `result` | String | Message based on different response code. |

## Authors

- [@Sachin Londhe](https://github.com/sachin-8055)
