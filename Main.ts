import { ip } from "address";
import axios from "axios";
import moment from "moment-timezone";
import { clientInputData, responseData, rsaKey } from "./DataFormats";
import fs from "fs";
import { rsaDecrypt, rsaEncrypt, rsaGenerateKeys } from "./Security/RSA";
import { aesDecrypt, aesEncrypt, aesGenerateKeys } from "./Security/AES";
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

  private static getTrace = async (org_Id: String = "") => {
    if (fs) {
      if (fs.existsSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`)) {
        let traceFileData = fs.readFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, "utf-8");

        if (traceFileData) {
          return JSON.parse(traceFileData);
        }
      }

      return null;
    }
  };

  private static updateTrace = async (org_Id: String = "", JsonData: any) => {
    if (fs) {
      let oldTrace = await this.getTrace(org_Id);

      if (oldTrace && oldTrace != null && JsonData) {
        let newTraceData = { ...oldTrace, ...JsonData };

        fs.writeFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, JSON.stringify(newTraceData, null, 2));
      } else if (!oldTrace && JsonData) {
        fs.writeFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, JSON.stringify(JsonData, null, 2));
      }
    }
  };

  private static doExchange = async (org_Id: string = this.org_Id): Promise<responseData> => {
    try {
      const clientData = await this.readFileAndParse(org_Id);

      if (clientData) {
        let _public_Key = await fs.readFileSync(`${baseFolderPath}/${org_Id}/${publicFile}`, "utf-8");

        if (!clientData?.licenseKey) {
          return {
            code: -1,
            data: null,
            result: "No client license key found, please call init().",
          };
        } else if (!_public_Key) {
          return {
            code: -1,
            data: null,
            result: "No client public key found, please call init().",
          };
        }

        const _doExchangeApi = `${clientData.baseUrl}/sdk/api/doExchange`;

        console.log("doExchange ", { _doExchangeApi });

        const _clientData = { ...clientData };
        delete _clientData.secretId;
        delete _clientData.baseUrl;

        const apiBody = {
          key: _public_Key.toString(),
          ..._clientData,
        };

        return await axios
          .post(`${_doExchangeApi}`, apiBody, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then(async (res) => {
            if (res.data?.resultCode == 1) {
              fs.writeFileSync(`${baseFolderPath}/${org_Id}/${serverFile}`, res.data?.data || "");

              return await this.getLicense(org_Id, clientData).then((getLic) => {
                if (Number(getLic?.code) < 0) {
                  return getLic;
                } else {
                  return {
                    code: 1,
                    data: null,
                    result: "Successfully exchanged and received license.",
                  };
                }
              });
            } else {
              return {
                code: -1,
                data: null,
                result: "Exchange fail with license server.",
              };
            }
          })
          .catch((err) => {
            console.log("API CALL EXCEPTION /doExchange : ", `Status: ${err?.response?.status} : ${err?.message}`);
            console.log("API CALL EXCEPTION /doExchange : ", err?.response?.data);
            return {
              code: -2,
              data: null,
              result: err?.response?.data?.message || "Fail to get license from server.",
            };
          });
      } else {
        return {
          code: -1,
          data: null,
          result: "No client config found. please call init() with org id.",
        };
      }
    } catch (error) {
      console.log("Exchange exception : ", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Exchange Files.");
    }
  };

  private static getLicense = async (org_Id: String = "", clientData: any): Promise<responseData> => {
    try {
      const _clientEncryptedData = await aesEncrypt(clientData?.secretId, clientData);
      const _clientKeyData = await rsaEncrypt(`${baseFolderPath}/${org_Id}/${serverFile}`, clientData?.secretId);

      const licenseServerAPI = `${clientData.baseUrl}/sdk/api/generateLicense`;

      console.log("getLicense ", { licenseServerAPI });

      const apiBody = {
        key: _clientKeyData,
        licenseKey: clientData?.licenseKey,
        client: _clientEncryptedData,
      };

      let licenseUrl = "";
      return await axios
        .post(`${licenseServerAPI}`, apiBody, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data?.resultCode == 1) {
            try {
              fs.writeFileSync(
                `${licenseBaseFolder}/${org_Id}/${licenseFile}`,
                JSON.stringify(JSON.parse(res.data?.data), null, 2)
              );
            } catch (error) {
              console.log("SDK EXCEPTION :> ", error);
            }
            licenseUrl = res.data?.downloadUrl;

            this.updateTrace(org_Id, { isExpired: false, isActive: true, dateTime: new Date() });

            return {
              code: 1,
              data: { licenseUrl },
              result: "License received and saved.",
            };
          } else {
            console.log("Unable to exchange keys...");

            return {
              code: -1,
              data: null,
              result: "Exchange fail with license server.",
            };
          }
        })
        .catch((err) => {
          console.log("API CALL EXCEPTION /generateLicense : ", `Status: ${err?.response?.status} : ${err?.message}`);
          console.log("API CALL EXCEPTION /generateLicense : ", err?.response?.data);
          return {
            code: -2,
            data: null,
            result: err?.response?.data?.message || "Fail to get license from server.",
          };
        });
    } catch (error) {
      console.log("Get License Exception :", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Get License.");
    }
  };

  private static checkPreinit = async (org_Id: String = ""): Promise<any> => {
    let isInitFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${initFile}`) || false;
    let isPublicFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${publicFile}`) || false;
    let isPrivateFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${privateFile}`) || false;
    return { isInitFile, isPublicFile, isPrivateFile };
  };

  private static checkExchangeFiles = async (org_Id: String = ""): Promise<any> => {
    let isServerFile: Boolean = fs.existsSync(`${baseFolderPath}/${org_Id}/${serverFile}`) || false;
    let isLicenseFile: Boolean = fs.existsSync(`${licenseBaseFolder}/${org_Id}/${licenseFile}`) || false;
    return { isServerFile, isLicenseFile };
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

  private static extractLicense = async (org_Id: String = ""): Promise<responseData> => {
    try {
      const filePath = `${licenseBaseFolder}/${org_Id}/${licenseFile}`;

      let oldTrace = await this.getTrace(org_Id);

      if (oldTrace && oldTrace.isActive == false) {
        return { code: -2, result: "License is not active, please contact admin.", data: null };
      } else if (oldTrace && oldTrace.isExpired == true) {
        return { code: -2, result: "License is Expired, please contact admin.", data: null };
      }

      /** Read License File */
      let _encryptedLicense: any = await fs.readFileSync(filePath, "utf-8");

      /** Format JSON and decode sign */
      _encryptedLicense = JSON.parse(_encryptedLicense);

      const decodedSign: any = await rsaDecrypt(`${baseFolderPath}/${org_Id}/${privateFile}`, _encryptedLicense?.sign);

      /** after success of sign decode uste decoded sign and do 'enc' decryption using AES */
      let decodedLicense = await aesDecrypt(decodedSign, _encryptedLicense?.enc);

      const fullLicense: any = typeof decodedLicense == "string" ? JSON.parse(decodedLicense) : decodedLicense;

      return { code: 1, result: "License extracted.", data: fullLicense };
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
      !clientData.userName ||
      !clientData.assignType
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

    let isExchangeNow: Boolean = false;

    let keyGen: rsaKey;
    if (!preChecks.isPublicFile || !preChecks.isPrivateFile) {
      keyGen = await rsaGenerateKeys();

      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${publicFile}`, keyGen.publicKey);
      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${privateFile}`, keyGen.privateKey);

      isExchangeNow = true;
    }

    let exchangeFiles = await this.checkExchangeFiles(org_Id);

    isExchangeNow = !exchangeFiles?.isServerFile || !exchangeFiles?.isLicenseFile ? true : false;

    if (isExchangeNow) {
      return await this.doExchange(org_Id).then((exchRes) => {
        if (Number(exchRes?.code) < 0) {
          return exchRes;
        } else {
          return {
            code: 1,
            data: null,
            result: "Successfully license exchange/received.",
          };
        }
      });
    }

    return {
      code: 1,
      data: null,
      result: "License already exist with provided license key.",
    };
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

  static async getFeatures(org_Id: string = "", featureName: string = "all"): Promise<responseData> {
    let licenseData = await this.extractLicense(org_Id);

    if (Number(licenseData?.code) < 0) return licenseData;

    let _lic_package = licenseData?.data?.include?.package;

    // console.log({f:_lic_package?.features})

    if (licenseData?.data?.include?.package && _lic_package?.features) {
      if (featureName?.toLowerCase() == "all") {
        let _fList: any = [];
        if (_lic_package?.features?.length > 0) {
          _lic_package?.features.forEach((item: any) => {
            _fList.push({
              ...item,
              data:
                item?.type == "number" && item?.data != ""
                  ? Number(item?.data)
                  : item?.type == "boolean" && item?.data != ""
                  ? item.data === "false"
                    ? false
                    : Boolean(item.data)
                  : item?.type == "date" && item?.data != ""
                  ? new Date(item?.data)
                  : item.data,
            });
          });

          return {
            code: 1,
            data: _fList,
            result: "List of all features",
          };
        } else {
          return {
            code: -1,
            data: null,
            result: `No Feature found with this name ${featureName}`,
          };
        }
      } else {
        const item =
          _lic_package?.features.length > 0
            ? _lic_package?.features?.find((data: any) => data.name.toLowerCase() === featureName.toLowerCase())
            : null;

        if (item) {
          return {
            code: item ? 1 : -1,
            data: {
              ...item,
              data:
                item?.type == "number" && item?.data != ""
                  ? Number(item?.data)
                  : item?.type == "boolean" && item?.data != ""
                  ? item.data === "false"
                    ? false
                    : Boolean(item.data)
                  : item?.type == "date" && item?.data != ""
                  ? new Date(item?.data)
                  : item.data,
            },
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
