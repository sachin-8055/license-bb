import { ip } from "address";
import axios from "axios";
import moment from "moment-timezone";
import { clientInputData, responseData, rsaKey } from "./DataFormats";
import fs from "fs";
import { rsaDecrypt, rsaGenerateKeys } from "./Security/RSA";
import { aesDecrypt, aesGenerateKeys } from "./Security/AES";
import { machineId } from "node-machine-id";

const licenseBaseFolder: string = "License";
const licenseFile: string = "License.pem";
const baseFolderPath: string = "bbLicenseUtils";
const infoTracerFile: string = "infoTrace.json";
const initFile: string = "init";
const publicFile: string = "public.pem";
const privateFile: string = "private.pem";
const serverFile: string = "server.pem";

const emptyResponse: responseData = {
  code: 0,
  data: {},
  result: "",
};

export class License {
  private static licenseKey: string = "";
  private static baseUrl: string = "";
  private static secretId: string = "";
  private static platform: string = "";
  private static deviceId: string = "";
  private static org_Id: string = "default";
  private static ip: string = ip() || "";
  private static dateTime: Date = new Date();
  private static timeZone: string = moment.tz.guess();

  private static doExchange = async (orgId: string = this.org_Id): Promise<any> => {};

  private static checkPreinit = async (org_Id: String = ""): Promise<any> => {
    let isInitFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${initFile}`) || false;
    let isPublicFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${publicFile}`) || false;
    let isPrivateFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${privateFile}`) || false;

    // if (fs.existsSync(`${baseFolderPath}/${org_Id}/${initFile}`)) {
    //   isInitFile = true;
    // }

    // if (fs.existsSync(`${baseFolderPath}/${org_Id}/${publicFile}`)) {
    //   isPublicFile = true;
    // }

    // if (fs.existsSync(`${baseFolderPath}/${org_Id}/${privateFile}`)) {
    //   isPrivateFile = true;
    // }

    return { isInitFile, isPublicFile, isPrivateFile };
  };

  private static removeInitFiles = async (org_Id: String = "", reason: String = "init()") => {
    console.log(`removeInitFiles : for:${reason} : ORG:${org_Id}`);

    let orgPublicFile = `${baseFolderPath}/${org_Id}/${publicFile}`;
    let orgPrivateFile = `${baseFolderPath}/${org_Id}/${privateFile}`;
    let orgServerFile = `${baseFolderPath}/${org_Id}/${serverFile}`;

    const filesToDelete = [orgPublicFile, orgPrivateFile, orgServerFile];

    try {
      filesToDelete.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.log("Remove Files Exception :", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Remove Files.");
    }

    return true;
  };

  private static readFileAndParse = async (org_Id: String = ""): Promise<any> => {
    let fileData = fs.readFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, "utf-8");
    const parseData = JSON.parse(fileData);
    return parseData || null;
  };

  private static extractLicense = async (org_Id: String = ""): Promise<any> => {
    try {
      const filePath = `${licenseBaseFolder}/${org_Id}/${licenseFile}`;

      /** Read License File */
      let _encryptedLicense: any = await fs.readFileSync(filePath, "utf-8");

      /** Format JSON and decode sign */
      _encryptedLicense = JSON.parse(_encryptedLicense);

      const decodedSign: any = await rsaDecrypt(`${baseFolderPath}/${org_Id}/${privateFile}`, _encryptedLicense?.sign);

      /** after success of sign decode uste decoded sign and do 'enc' decryption using AES */
      let decodedLicense = await aesDecrypt(decodedSign, _encryptedLicense?.enc);

      const fullLicense: any = typeof decodedLicense == "string" ? JSON.parse(decodedLicense) : decodedLicense;

      return fullLicense;
    } catch (error) {
      console.error("Extract License Exception>>", error);
      throw new Error(error instanceof Error ? error.message : "Extract License Exception");
    }
  };

  /** External access functions */

  static async init(
    base_Url: string = "",
    license_Key: string = "",
    clientData: clientInputData
  ): Promise<responseData> {
    try {
      [baseFolderPath, licenseBaseFolder].forEach((folderPath) => {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      });
    } catch (error) {
      console.error("SDK EXCEPTION older Creation Exception:> ", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> init folder create.");
    }
    if (!base_Url) {
      return {
        code: -1,
        data: null,
        result: "Please provide valid base url of license server.",
      };
    }

    if (!license_Key) {
      return {
        code: -1,
        data: null,
        result: "Please provide valid license key.",
      };
    }

    if (
      !clientData.email ||
      !clientData.orgId ||
      !clientData.orgName ||
      !clientData.phone ||
      !clientData.serverNameAlias ||
      !clientData.userName
    ) {
      return {
        code: -1,
        data: null,
        result: "Please provide valid client data.",
      };
    }

    let org_Id = clientData.orgId.toString().trim() || "";

    /** make ORG ID path */
    try {
      [`${baseFolderPath}/${org_Id}`, `${licenseBaseFolder}/${org_Id}`].forEach((folderPath) => {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      });
    } catch (error) {
      console.error("Path creation error for org id. ", error);
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred > Path creation error for org id."
      );
    }

    let preChecks: any = await this.checkPreinit(org_Id);

    if (!preChecks.isInitFile) {
      // If init file not present then need to create with clientData

      await machineId().then((id) => {
        this.deviceId = id;
      });
      this.platform = process?.platform || "";
      this.licenseKey = license_Key;
      this.baseUrl = base_Url;

      this.secretId = await aesGenerateKeys();

      const _configData = {
        baseUrl: this.baseUrl,
        licenseKey: this.licenseKey,
        deviceId: this.deviceId,
        secretId: this.secretId || "",
        platform: this.platform,
        ip: this.ip,
        dateTime: this.dateTime,
        timeZone: this.timeZone,
        ...clientData,
      };

      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, JSON.stringify(_configData));
    } else {
      const existingClientObj = await this.readFileAndParse(org_Id);

      if (existingClientObj.licenseKey != license_Key) {
        existingClientObj.licenseKey = license_Key;
        existingClientObj.dateTime = new Date();

        fs.writeFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, JSON.stringify(existingClientObj));

        try {
          await this.removeInitFiles(org_Id, "init()");
          preChecks = await this.checkPreinit(org_Id);
        } catch (error) {
          console.log("EXCEPTION removeInitFiles :> ", error);
        }
      }
    }

    let keyGen: rsaKey;
    if (!preChecks.isPublicFile || !preChecks.isPrivateFile) {
      keyGen = await rsaGenerateKeys();

      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${publicFile}`, keyGen.publicKey);
      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${privateFile}`, keyGen.privateKey);
    }

    return emptyResponse;
  }

  static async getConfig(org_Id: String = ""): Promise<responseData> {
    const clientData = await this.readFileAndParse(org_Id);

    if (!clientData) {
      return {
        code: -1,
        data: null,
        result: "No client config found. please call init() with org id.",
      };
    }

    return {
      code: 1,
      data: clientData,
      result: "Success",
    };
  }

  static async update(license_Key: string = "", org_Id: string = "", assignType: string = ""): Promise<responseData> {
    if (!license_Key || !org_Id) {
      return {
        code: -1,
        data: null,
        result: "license_Key & org_Id can't be null | blank.",
      };
    }

    let orgInitFile = `${baseFolderPath}/${org_Id}/${initFile}`;

    if (fs.existsSync(orgInitFile)) {
      let fileData = fs.readFileSync(orgInitFile, "utf-8");
      const parseData = JSON.parse(fileData);

      parseData.assignType == license_Key.toString().trim() ? "default" : assignType;

      parseData.licenseKey = license_Key;
      parseData.orgId = org_Id.toString().trim();
      parseData.dateTime = new Date();

      // _res.code = 1;
      // _res.data = parseData;
      // _res.result = "Success";

      const res_init = await this.init(parseData?.baseUrl, license_Key, parseData);
      return res_init;
    } else {
      return {
        code: -1,
        data: null,
        result: "No exiting init file found please do initialize client using init()",
      };
    }
  }

  static async getFeatures(org_Id: string = "", featureName: string = ""): Promise<responseData> {
    let licenseData = await this.extractLicense(org_Id);

    let _lic_package = licenseData?.data?.include?.package;

    if (licenseData?.data?.include?.package && _lic_package?.features) {
      if (featureName?.toLowerCase() == "all") {
        return {
          code: 1,
          data: _lic_package?.features,
          result: "List of all features",
        };
      } else {
        const item =
          _lic_package?.features.length > 0
            ? _lic_package?.features?.find((data: any) => data.name.toLowerCase() === featureName.toLowerCase())
            : null;

        if (item) {
          return {
            code: item ? 1 : -1,
            data: item ? (isNaN(Number(item.data)) ? "" : Number(item.data)) : null,
            result: item ? "Success" : "No Feature Found.",
          };
        } else {
          return {
            code: -1,
            data: null,
            result: `No Feature found with this name ${featureName}`,
          };
        }
      }
    } else {
      return {
        code: -1,
        data: null,
        result: "No Feature Available.",
      };
    }
  }
}
