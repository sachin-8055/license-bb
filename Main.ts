import ip from "ip";
import os from "os";
import axios from "axios";
import moment from "moment-timezone";
import { clientInputData, DeviceDetails, responseData, rsaKey } from "./DataFormats";
import fs from "fs";
import { rsaDecrypt, rsaEncrypt, rsaGenerateKeys } from "./Security/RSA";
import { aesDecrypt, aesEncrypt, aesGenerateKeys } from "./Security/AES";
import cron from "node-cron";
import path from "path";
import { sha256 } from "hash.js";

const licenseBaseFolder: string = "License";
const licenseFile: string = "License.pem";
const baseFolderPath: string = "bbLicenseUtils";
const infoTracerFile: string = "infoTrace.json";
const initFile: string = "init";
const deviceFile: string = "device.json";
const publicFile: string = "public.pem";
const privateFile: string = "private.pem";
const serverFile: string = "server.pem";
const logFile: string = "log";

const OSLIST: Array<string> = ["win32", "win64", "linux", "darwin"];

const logging = async (org_Id: String = "", reason: String = "", result: String = "") => {
  if (fs) {
    if (fs.existsSync(`${baseFolderPath}/${logFile}`)) {
      try {
        // Read existing content of the file
        const existingData = fs.readFileSync(`${baseFolderPath}/${logFile}`, "utf8");

        const newData = `${new Date().toISOString()} > ${org_Id}: ${reason}: ${result}`;
        // Append new data with a newline character
        const updatedData = `${existingData.trim()}\n${newData}`;

        // Write the updated content back to the file
        fs.writeFileSync(`${baseFolderPath}/${logFile}`, updatedData);
      } catch (err) {
        console.error(`Error updating file log file`);
      }
    } else {
      try {
        const newData = `${new Date().toISOString()} > ${org_Id}: ${reason}: ${result}`;
        // Append new data with a newline character
        const updatedData = `${newData}`;

        // Write the updated content back to the file
        fs.writeFileSync(`${baseFolderPath}/${logFile}`, updatedData);
      } catch (err) {
        console.error(`Error updating file log file`);
      }
    }
  }
  // return true;
};

const getTrace = async (org_Id: String = "") => {
  if (fs) {
    if (fs.existsSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`)) {
      let traceFileData = fs.readFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, "utf8");

      if (traceFileData) {
        return JSON.parse(traceFileData);
      }
    }

    return null;
  }
};

const updateTrace = async (org_Id: String = "", JsonData: any) => {
  if (fs) {
    let oldTrace = await getTrace(org_Id);

    if (oldTrace && oldTrace !== null && JsonData) {
      let newTraceData = { ...oldTrace, ...JsonData };

      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, JSON.stringify(newTraceData, null, 2));
    } else if (!oldTrace && JsonData) {
      fs.writeFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, JSON.stringify(JsonData, null, 2));
    }
  }
};

const hashString = async (input: string) => {
  const data = new TextEncoder().encode(input);

  const hash = sha256().update(data).digest("hex");

  return hash;
};

const getDeviceDetails = async (): Promise<DeviceDetails> => {
  let _deviceDetails: DeviceDetails = {
    deviceId: "",
    osType: "",
    deviceType: "",
    browser: "",
  };

  let filePath = `${baseFolderPath}/${deviceFile}`;
  if (fs.existsSync(filePath)) {
    let fileData = fs.readFileSync(`${baseFolderPath}/${deviceFile}`, "utf8");
    const parseData = fileData ? JSON.parse(fileData) : null;
    if (parseData) {
      return parseData || null;
    }
  }

  const platform = process?.platform || os.platform();
  const _host = process?.env?.HOSTNAME || os.hostname();
  /** Type of Device ID Start */

  const systemInfo = `${_host || ""}${process?.arch || ""}${platform}${process?.version || ""}`;

  const hashedData = await hashString(systemInfo);
  _deviceDetails.deviceId = hashedData;

  /** Type of Device ID End */

  /** Type of OS Start */
  if (platform?.toLowerCase() === "linux") {
    _deviceDetails.osType = "Linux";
  } else if (platform?.toLowerCase() === "darwin") {
    _deviceDetails.osType = "Mac";
  } else if (platform?.toLowerCase() === "win32") {
    _deviceDetails.osType = "Windows";
  } else {
    _deviceDetails.osType = "Unknown";
  }

  /** Type of OS END */

  /** Type of Device Start */
  if (fs.existsSync("/proc/1/cgroup")) {
    fs.readFile("/proc/1/cgroup", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading /proc/1/cgroup to identify MACHINE :", err);
      } else {
        if (data.includes("/docker/")) {
          _deviceDetails.deviceType = "Docker";
        } else if (data.includes("/machine.slice/machine-qemu") || data.includes("/machine.slice/machine-vmware")) {
          _deviceDetails.deviceType = "Virtual Machine";
        } else {
          _deviceDetails.deviceType = "Server";
        }
      }
    });
  } else {
    _deviceDetails.deviceType = "Server";
  }
  /** Type of Device END */

  try {
    fs.writeFileSync(`${baseFolderPath}/${deviceFile}`, JSON.stringify(_deviceDetails, null, 2));
  } catch (error) {
    console.error("SDK EXCEPTION :> on device details save ", error);
    // throw new Error(error instanceof Error ? error.message : "License Device File Save Exception.");
  }

  return _deviceDetails;
};
export class License {
  private static task: any;

  private static licenseKey: string = "";
  private static baseUrl: string = "";
  private static secretId: string = "";
  // private static platform: string = "";
  // private static deviceId: string = "";
  private static device: object = {};
  private static org_Id: string = "default";
  // private static _ip: string = ip.address() || "";
  private static dateTime: Date = new Date();
  private static timeZone: string = moment.tz.guess();

  private static doExchange = async (org_Id: string = this.org_Id, clientData: any): Promise<responseData> => {
    try {
      // const clientData = await this.readFileAndParse(org_Id);

      if (!org_Id) {
        console.error(`Org id should't be blank '${org_Id}'.`);
        throw new Error(`Org id should't be blank '${org_Id}'.`);
      }

      if (clientData) {
        let publicFilePath = `${baseFolderPath}/${org_Id.toString().trim()}/${publicFile}`;
        let tempPublicFilePath = `${baseFolderPath}/${org_Id.toString().trim()}/temp_${publicFile}`;

        let _public_Key = fs.existsSync(tempPublicFilePath)
          ? await fs.readFileSync(tempPublicFilePath, "utf8")
          : await fs.readFileSync(publicFilePath, "utf8");

        if (!clientData?.licenseKey) {
          console.error(`No client license key found, please call init() again with required data.`);
          throw new Error(`No client license key found, please call init() again with required data.`);
        } else if (!_public_Key) {
          console.error(`No client public key found, please call init() again with required data.`);
          throw new Error(`No client public key found, please call init() again with required data.`);
        }

        const _doExchangeApi = `${clientData.baseUrl}/sdk/api/doExchange`;

        const _clientData = { ...clientData };
        if (_clientData.secretId) delete _clientData.secretId;
        if (_clientData.baseUrl) delete _clientData.baseUrl;

        const apiBody = {
          key: _public_Key.toString(),
          licenseKey: _clientData?.licenseKey,
          email: _clientData?.email,
          orgId: _clientData?.orgId,
          assignType: _clientData?.assignType,
        };

        return await axios
          .post(`${_doExchangeApi}`, apiBody, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then(async (res) => {
            if (res.data?.resultCode == 1) {
              fs.writeFileSync(`${baseFolderPath}/${org_Id.toString().trim()}/${serverFile}`, res.data?.data || "");

              return await this.getLicense(org_Id.toString().trim(), clientData).then((getLic) => {
                if (Number(getLic?.code) < 0) {
                  // file deepcode ignore PromiseNotCaughtGeneral: not blocking next execution if we add catch everywhere.
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
              console.error(`Exchange fail with license server for org '${org_Id}'.`);
              throw new Error(`Exchange fail with license server for org '${org_Id}'.`);
            }
          })
          .catch((err: any) => {
            if (err?.code == "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED")) {
              console.error("Unable to connect License server :", err?.message);
              throw new Error(
                err instanceof Error
                  ? `Unable to connect License server : ${err?.message}`
                  : "Something went wrong at licensing server end."
              );
            }
            console.debug(
              "License Server Response : ",
              `Status: ${err?.response?.status} : ${err?.message} : `,
              err?.response?.data
            );

            let _errorMsg = err?.response?.data?.message || "Fail to get license from server.";

            console.error({ _errorMsg });
            throw new Error(_errorMsg);
          });
      } else {
        console.error(`Invalid client details for org id '${org_Id}'.`, { clientData });
        throw new Error(`Invalid client details for org id '${org_Id}'.`);
      }
    } catch (error) {
      console.error("Exchange exception : ", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Exchange Files.");
    }
  };

  private static getLicense = async (org_Id: String = "", clientData: any): Promise<responseData> => {
    try {
      const _clientEncryptedData = await aesEncrypt(clientData?.secretId, clientData);
      const _clientKeyData = await rsaEncrypt(`${baseFolderPath}/${org_Id}/${serverFile}`, clientData?.secretId);

      const licenseServerAPI = `${clientData?.baseUrl}/sdk/api/generateLicense`;

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
              console.error("SDK EXCEPTION :> ", error);
              throw new Error(error instanceof Error ? error.message : "License File Save Exception.");
            }
            licenseUrl = res.data?.downloadUrl;

            updateTrace(org_Id, { isExpired: false, isActive: true, dateTime: new Date() });

            return {
              code: 1,
              data: { licenseUrl },
              result: "License received and saved.",
            };
          } else {
            console.error(`Get License fail with license server. '${org_Id}'.`);
            throw new Error(`Get License fail with license server. '${org_Id}'.`);
          }
        })
        .catch((err: any) => {
          if (err?.code == "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED")) {
            console.error("Unable to connect License server :", err?.message);
            throw new Error(
              err instanceof Error
                ? `Unable to connect License server : ${err?.message}`
                : "Something went wrong at licensing server end."
            );
          }

          console.debug(
            "License Server Response : ",
            `Status: ${err?.response?.status} : ${err?.message} : `,
            err?.response?.data
          );

          let _errorMsg = err?.response?.data?.message || "Fail to get license from server.";

          console.error({ _errorMsg });
          throw new Error(_errorMsg);
        });
    } catch (error) {
      console.error("Get License Exception :", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Get License.");
    }
  };

  private static checkValidKey = async (license_Key: String = "", baseUrl: String = ""): Promise<responseData> => {
    try {
      const licenseServerAPI = `${baseUrl}/sdk/api/keyCheck/${license_Key}`;

      return await axios
        .get(`${licenseServerAPI}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data?.resultCode == 1) {
            return {
              code: 1,
              data: null,
              result: res.data?.message || "Key is valid",
            };
          } else {
            console.error(`Key is invalid.`);
            throw new Error(`Key is invalid.`);
          }
        })
        .catch((err: any) => {
          if (err?.code == "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED")) {
            console.error("Unable to connect License server :", err?.message);
            throw new Error(
              err instanceof Error
                ? `Unable to connect License server : ${err?.message}`
                : "Something went wrong at licensing server end."
            );
          }
          console.debug(
            "License Server Response : ",
            `Status: ${err?.response?.status} : ${err?.message} :`,
            err?.response?.data || err?.response || err
          );

          let _errorMsg =
            err?.response?.status == 400
              ? `Invalid license key '${license_Key}', please check the license key`
              : `Fail to check license key '${license_Key}'`;

          console.error({ _errorMsg });
          throw new Error(_errorMsg);
        });
    } catch (error) {
      console.error("Key Check Exception :", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Key Check.");
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

  private static removeKeyFiles = async (org_Id: String = "", reason: String = "init()") => {
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
      console.error("Remove Files Exception :", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Remove Files.");
    }

    return true;
  };

  private static readFileAndParse = async (org_Id: String = ""): Promise<any> => {
    let fileData = fs.readFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, "utf8");
    const parseData = JSON.parse(fileData);
    return parseData || null;
  };

  private static extractLicense = async (org_Id: String = ""): Promise<responseData> => {
    try {
      const filePath = `${licenseBaseFolder}/${org_Id}/${licenseFile}`;

      let oldTrace = await getTrace(org_Id);

      if (oldTrace && oldTrace.isActive == false) {
        return { code: -2, result: "License is not active, please contact admin.", data: null };
      } else if (oldTrace && oldTrace.isExpired == true) {
        return { code: -2, result: "License is Expired, please contact admin.", data: null };
      }
      if (fs.existsSync(filePath)) {
        /** Read License File */
        let _encryptedLicense: any = await fs.readFileSync(filePath, "utf8");

        /** Format JSON and decode sign */
        _encryptedLicense = JSON.parse(_encryptedLicense);

        const decodedSign: any = rsaDecrypt(`${baseFolderPath}/${org_Id}/${privateFile}`, _encryptedLicense?.sign);

        if (decodedSign?.toString()?.includes("Invalid")) {
          console.error(decodedSign || `Invalid encrypted data received for decrypt signature for org ${org_Id}`);
          throw new Error(decodedSign || "Invalid encrypted data received for decrypt signature.");
        }
        /** after success of sign decode use decoded sign and do 'enc' decryption using AES */
        let decodedLicense: any = aesDecrypt(decodedSign, _encryptedLicense?.enc);

        if (decodedLicense?.toString()?.includes("Invalid")) {
          console.error(decodedSign || `Invalid encrypted data received for decrypt license for org ${org_Id}`);
          throw new Error(decodedSign || "Invalid encrypted data received for decrypt license.");
        }

        const fullLicense: any = typeof decodedLicense == "string" ? JSON.parse(decodedLicense) : decodedLicense;

        return { code: 1, result: "License extracted.", data: fullLicense };
      } else {
        console.log(`No License found at '${filePath}' for org id ${org_Id}`);
        console.error(`No license found for organization ${org_Id || "blank org id"}, please initialize again.`);
        throw new Error(`No license found for organization ${org_Id || "blank org id"}, please initialize again.`);
      }
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
        console.error(`Please provide valid base url of license server.`);
        throw new Error(`Please provide valid base url of license server.`);
      }

      if (!license_Key) {
        console.error(`Please provide valid license key.`);
        throw new Error(`Please provide valid license key.`);
      }

      const keyCheckRes = await this.checkValidKey(license_Key, base_Url);

      if (Number(keyCheckRes?.code) < 0) {
        return keyCheckRes;
      }

      if (!clientData.assignType) {
        clientData.assignType = "default";
      }

      if (!clientData.email || !clientData.orgId || !clientData.userName) {
        console.error(
          `Please provide required client data {email,orgId,userName}. Data received ${JSON.stringify(clientData)}`
        );
        throw new Error(`Please provide required client data {email,orgId,userName}.`);
      }

      let org_Id = clientData?.orgId?.toString()?.trim() || "";

      if (!org_Id) {
        console.error(`Org id should't be blank '${org_Id}'.`);
        throw new Error(`Org id should't be blank '${org_Id}'.`);
      }

      // /** make ORG ID path */
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
      let clientConfig: any = null;
      if (!preChecks.isInitFile) {
        // If init file not present then need to create with clientData

        // await machineId().then((id) => {
        //   this.deviceId = id;
        // });
        // this.platform = process?.platform || "";
        this.licenseKey = license_Key;
        this.baseUrl = base_Url;

        this.device = await getDeviceDetails();
        this.secretId = await aesGenerateKeys();

        clientConfig = {
          baseUrl: this.baseUrl,
          licenseKey: this.licenseKey,
          device: this.device,
          secretId: this.secretId || "",
          dateTime: this.dateTime,
          timeZone: this.timeZone,
          ...clientData,
          orgId: org_Id,
        };

        // fs.writeFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, JSON.stringify(_configData));
      } else {
        const existingClientObj = await this.readFileAndParse(org_Id);

        if (existingClientObj.licenseKey !== license_Key) {
          existingClientObj.licenseKey = license_Key;
          existingClientObj.dateTime = new Date();

          if (existingClientObj) {
            clientConfig = { ...existingClientObj };
          } else {
            console.warn(`Empty existing client details found:${org_Id}`, { existingClientObj });
          }

          // fs.writeFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, JSON.stringify(existingClientObj));

          try {
            // await this.removeKeyFiles(org_Id, "init()");
            // preChecks = await this.checkPreinit(org_Id);
            preChecks = { isPublicFile: false, isPrivateFile: false };
          } catch (error) {
            console.error("EXCEPTION removeKeyFiles/configFiles :> ", error);
            throw new Error(
              error instanceof Error ? error.message : "Unknown error occurred > While updating user config files."
            );
          }
        } else {
          clientConfig = { ...existingClientObj };
        }
      }

      let isExchangeNow: Boolean = false;

      let keyGen: rsaKey;
      if (!preChecks.isPublicFile || !preChecks.isPrivateFile) {
        keyGen = await rsaGenerateKeys();

        // fs.writeFileSync(`${baseFolderPath}/${org_Id}/${publicFile}`, keyGen.publicKey);
        // fs.writeFileSync(`${baseFolderPath}/${org_Id}/${privateFile}`, keyGen.privateKey);

        /** store temprary till exchange success */
        fs.writeFileSync(`${baseFolderPath}/${org_Id}/temp_${publicFile}`, keyGen.publicKey);
        fs.writeFileSync(`${baseFolderPath}/${org_Id}/temp_${privateFile}`, keyGen.privateKey);

        isExchangeNow = true;
      }

      if (!isExchangeNow) {
        let exchangeFiles = await this.checkExchangeFiles(org_Id);
        // console.debug("Exchange Files : ", { exchangeFiles });
        isExchangeNow = !exchangeFiles?.isServerFile || !exchangeFiles?.isLicenseFile ? true : false;
      }

      if (isExchangeNow) {
        return await this.doExchange(org_Id, clientConfig).then((exchRes) => {
          if (Number(exchRes?.code) < 0) {
            return exchRes;
          } else {
            try {
              /** remove existing files and check temp file is available then rename it */
              if (fs.existsSync(`${baseFolderPath}/${org_Id}/temp_${publicFile}`)) {
                fs.renameSync(
                  `${baseFolderPath}/${org_Id}/temp_${publicFile}`,
                  `${baseFolderPath}/${org_Id}/${publicFile}`
                );
              }
              if (fs.existsSync(`${baseFolderPath}/${org_Id}/temp_${privateFile}`)) {
                fs.renameSync(
                  `${baseFolderPath}/${org_Id}/temp_${privateFile}`,
                  `${baseFolderPath}/${org_Id}/${privateFile}`
                );
              }
              fs.writeFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, JSON.stringify(clientConfig));
            } catch (error) {
              console.error("EXCEPTION writing client config File :> ", error);
              throw new Error(
                error instanceof Error ? error.message : "Unknown error occurred > While writing client config File."
              );
            }
            return {
              code: 1,
              data: null,
              result: "Successfully license exchange/received.",
            };
          }
        });
      } else {
        /** If already init file present then sync only */
        return await License.sync(license_Key, org_Id).then((syncRes) => {
          if (Number(syncRes?.code) < 0) {
            return syncRes;
          } else {
            return {
              code: 1,
              data: null,
              result: "Successfully license sync.",
            };
          }
        });
      }
    } catch (error) {
      console.error("Initialization fail: ", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred > Initialization failed.");
    }
  }

  static async getConfig(org_Id: String = ""): Promise<responseData> {
    if (!org_Id) {
      console.error(`Org id should't be blank '${org_Id}'.`);
      throw new Error(`Org id should't be blank '${org_Id}'.`);
    }

    const clientData = await this.readFileAndParse(org_Id.toString().trim());

    if (!clientData) {
      console.error(`No client config found. please call init() with org id ${org_Id}.`);
      throw new Error(`No client config found. please call init() with org id ${org_Id}.`);
    }

    return {
      code: 1,
      data: clientData,
      result: "Success",
    };
  }

  static async update(
    license_Key: string = "",
    org_Id: string = "",
    assignType: string = "update"
  ): Promise<responseData> {
    if (!license_Key || !org_Id) {
      console.error(`license_Key & org_Id should't be blank '${org_Id}'.`);
      throw new Error(`license_Key & org_Id should't be blank '${org_Id}'.`);
    }

    let orgInitFile = `${baseFolderPath}/${org_Id.toString().trim()}/${initFile}`;

    if (fs.existsSync(orgInitFile)) {
      let fileData = fs.readFileSync(orgInitFile, "utf8");
      const parseData = JSON.parse(fileData);

      // parseData.assignType == license_Key.toString().trim() ? "default" : assignType;
      parseData.assignType = assignType;
      parseData.device = await getDeviceDetails();
      parseData.licenseKey = license_Key;
      parseData.orgId = org_Id.toString().trim();
      parseData.dateTime = new Date();

      const res_init = await License.init(parseData?.baseUrl, license_Key, parseData);
      return res_init;
    } else {
      console.error(`No exiting init file found please do initialize client using init() org id ${org_Id}.`);
      throw new Error(`No exiting init file found please do initialize client using init()`);
    }
  }

  static async sync(license_Key: string = "", org_Id: string = ""): Promise<responseData> {
    if (!license_Key || !org_Id) {
      console.error(`license_Key & org_Id should't be blank '${org_Id}'.`);
      throw new Error(`license_Key & org_Id should't be blank '${org_Id}'.`);
    }

    let orgInitFile = `${baseFolderPath}/${org_Id.toString().trim()}/${initFile}`;

    if (fs.existsSync(orgInitFile)) {
      let fileData = fs.readFileSync(orgInitFile, "utf8");
      const parseData = JSON.parse(fileData);

      if (parseData.licenseKey !== license_Key) {
        console.error(`License key '${license_Key}' doesn't match with existing license to sync.`);
        throw new Error(`License key '${license_Key}' doesn't match with existing license to sync.`);
      } else {
        return await this.getLicense(org_Id.toString().trim(), parseData).then((exchRes) => {
          if (Number(exchRes?.code) < 0) {
            return exchRes;
          } else {
            return {
              code: 1,
              data: null,
              result: "License synced successfully.",
            };
          }
        });
      }
    } else {
      console.error(`No exiting init file found for org id ${org_Id}, please do initialize client again.`);
      throw new Error(`No exiting init file found for org id ${org_Id}, please do initialize client again.`);
    }
  }

  private static calculateDays(startDate: string = ""): number {
    if (startDate !== "") {
      const date = new Date(startDate);

      // Get today's date
      const today = new Date();

      date.setUTCHours(0, 0, 0, 0);
      today.setUTCHours(0, 0, 0, 0);
      // Calculate the difference in milliseconds between the two dates
      const differenceInMilliseconds = today.getTime() - date.getTime();

      // Convert milliseconds to days
      const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24)) + 1;

      return differenceInDays;
    }
    return -1;
  }

  static async getFeatures(org_Id: string = "", featureName: string | string[] | any = "all"): Promise<responseData> {
    try {
      if (!org_Id) {
        console.error(`Org id should't be blank '${org_Id}'.`);
        throw new Error(`Org id should't be blank '${org_Id}'.`);
      }
      if (!featureName) {
        console.debug(`Feature name should't be blank '${featureName}', Now auto set to "all".`);
        // throw new Error(`Feature name should't be blank '${featureName}'.`);
        featureName = "all";
      }

      let licenseData = await this.extractLicense(org_Id.toString().trim());

      if (Number(licenseData?.code) < 0) return licenseData;

      let fullLicense = { ...licenseData?.data };

      let _lic_package = fullLicense?.include?.package;
      let _features = _lic_package?.featuresList || _lic_package?.features || [];
      let _lic_meta = {
        issueDate: fullLicense?.meta?.issued || "",
        expiryDate: fullLicense?.meta?.expiry || "",
        package_id: _lic_package?._id || "",
        isExpired: false,
      };

      if (fullLicense?.include?.package && _features && _features?.length > 0) {
        /** Expiry logic checking */

        let expiryDateDays: number = License.calculateDays(_lic_meta?.expiryDate);
        if (expiryDateDays >= 2) {
          _lic_meta.isExpired = true;
        }

        /** If not Expired extract the features */

        if (typeof featureName === "string" && featureName?.toLowerCase() === "all") {
          let _fList: any = [];
          _features.forEach((item: any) => {
            _fList.push({
              ...item,
              data:
                item?.type == "number" && item?.data !== ""
                  ? Number(item?.data)
                  : item?.type == "boolean" && item?.data !== ""
                  ? item.data === "false"
                    ? false
                    : Boolean(item.data)
                  : item?.type == "date" && item?.data !== ""
                  ? new Date(item?.data)
                  : item.data,
            });
          });

          return {
            code: 1,
            data: _fList,
            result: "List of all features",
            meta: _lic_meta || null,
          };
        } else if (typeof featureName === "object" && Array.isArray(featureName)) {
          const filteredList =
            _features.length > 0 ? _features?.filter((obj: any) => featureName?.includes(obj.name)) : [];
          let _fList: any = [];
          if (filteredList && filteredList?.length > 0) {
            filteredList?.forEach((item: any) => {
              _fList.push({
                ...item,
                data:
                  item?.type == "number" && item?.data !== ""
                    ? Number(item?.data)
                    : item?.type == "boolean" && item?.data !== ""
                    ? item.data === "false"
                      ? false
                      : Boolean(item.data)
                    : item?.type == "date" && item?.data !== ""
                    ? new Date(item?.data)
                    : item.data,
              });
            });

            return {
              code: 1,
              data: _fList,
              result: "List of features",
              meta: _lic_meta || null,
            };
          }
        } else {
          const item =
            _features.length > 0
              ? _features?.find((data: any) => data?.name?.toLowerCase() === featureName?.toLowerCase())
              : null;

          if (item) {
            return {
              code: 1,
              data: {
                ...item,
                data:
                  item?.type == "number" && item?.data !== ""
                    ? Number(item?.data)
                    : item?.type == "boolean" && item?.data !== ""
                    ? item.data === "false"
                      ? false
                      : Boolean(item.data)
                    : item?.type == "date" && item?.data !== ""
                    ? new Date(item?.data)
                    : item.data,
              },
              meta: _lic_meta || null,
              result: item ? "Success" : "No Feature Found.",
            };
          }
        }

        let _errorMsg = `No Feature found with this name '${
          typeof featureName === "string" ? featureName : featureName?.join(",")
        }'`;

        console.error({ _errorMsg });
        throw new Error(_errorMsg);
      } else {
        console.error("No feature available in current license.");
        throw new Error("No feature available in current license.");
      }
    } catch (error) {
      console.error("Get License Features fail: ", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred > GetFeatures().");
    }
  }

  static async getLicenseDetails(org_Id: string = ""): Promise<responseData> {
    try {
      if (!org_Id) {
        console.error(`Org id should't be blank '${org_Id}'.`);
        throw new Error(`Org id should't be blank '${org_Id}'.`);
      }

      let licenseData = await this.extractLicense(org_Id.toString().trim());

      if (Number(licenseData?.code) < 0) return licenseData;

      let fullLicense = { ...licenseData?.data };
      let _lic_package = fullLicense?.include?.package;
      let _lic_meta = {
        issueDate: fullLicense?.meta?.issued || "",
        expiryDate: fullLicense?.meta?.expiry || "",
        package_id: _lic_package?._id || "",
        isExpired: false,
      };

      let expiryDateDays: number = License.calculateDays(_lic_meta?.expiryDate);
      if (expiryDateDays >= 2) {
        _lic_meta.isExpired = true;
      }

      let featuresList = _lic_package?.featuresList || _lic_package?.features || [];

      fullLicense.meta = _lic_meta;

      /*if (fullLicense?.include?.package && featuresList) {*/

      let _fList: any = [];
      if (featuresList?.length > 0) {
        featuresList.forEach((item: any) => {
          _fList.push({
            ...item,
            data:
              item?.type == "number" && item?.data !== ""
                ? Number(item?.data)
                : item?.type == "boolean" && item?.data !== ""
                ? item.data === "false"
                  ? false
                  : Boolean(item.data)
                : item?.type == "date" && item?.data !== ""
                ? new Date(item?.data)
                : item.data,
          });
        });
      }
      /*else {
        console.error(`No License found for org Id '${org_Id}' to get details.`);
        throw new Error(`No License found for org Id '${org_Id}' to get details.`);
        
      }*/
      fullLicense.include.package.features = _fList;

      return {
        code: 1,
        data: fullLicense,
        result: "License Details",
        meta: _lic_meta || null,
      };
      /*} else {
      console.error(`No Feature Available.`);
      throw new Error(`No Feature Available.`);      
    }*/
    } catch (error) {
      console.error("Get License Details fail: ", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred > GetLicenseDetail().");
    }
  }

  static delete = async (org_Id: String = ""): Promise<responseData> => {
    if (!org_Id) {
      console.error(`Org id should't be blank '${org_Id}'.`);
      throw new Error(`Org id should't be blank '${org_Id}'.`);
    }
    try {
      let orgInitFile = `${baseFolderPath}/${org_Id.toString().trim()}/${initFile}`;

      if (fs.existsSync(orgInitFile)) {
        let fileData = fs.readFileSync(orgInitFile, "utf8");
        const parseData = JSON.parse(fileData);

        return await axios
          .delete(`${parseData?.baseUrl}/sdk/api/delete/${org_Id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            if (res.data?.resultCode == 1) {
              try {
                this.removeKeyFiles(org_Id, "deleteLicense()");
                if (fs.existsSync(`${licenseBaseFolder}/${org_Id}/${licenseFile}`)) {
                  fs.unlink(`${licenseBaseFolder}/${org_Id}/${licenseFile}`, () => {});
                }
              } catch (error) {
                console.error("Fail to delete files after delete license. ", error);
                throw new Error(error instanceof Error ? error.message : "License File Delete Exception.");
              }

              return {
                code: 1,
                data: {},
                result: "License deleted.",
              };
            } else {
              console.error(`Fail to delete license on server. '${org_Id}'.`);
              throw new Error(`Fail to delete license on server. '${org_Id}'.`);
            }
          })
          .catch((err: any) => {
            if (err?.code == "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED")) {
              console.error("Unable to connect License server :", err?.message);
              throw new Error(
                err instanceof Error
                  ? `Unable to connect License server : ${err?.message}`
                  : "Something went wrong at licensing server end."
              );
            }

            console.debug(
              "License Server Response : ",
              `Status: ${err?.response?.status} : ${err?.message} : `,
              err?.response?.data
            );

            let _errorMsg = err?.response?.data?.message || "Fail to delete license from server.";

            console.error({ _errorMsg });
            throw new Error(_errorMsg);
          });
      } else {
        console.error(`No License issued to org id ${org_Id}.`);
        throw new Error(`No License issued to org id ${org_Id}. Unable to delete.`);
      }
    } catch (error) {
      console.error("Delete License Exception :", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error occurred > Delete License.");
    }
  };
}
(async function () {
  function readDirectories(directoryPath: string): string[] {
    const subFolders: string[] = [];

    // Read the contents of the directory
    const contents = fs.readdirSync(directoryPath);

    // Iterate through the contents
    for (const item of contents) {
      const itemPath = path.join(directoryPath, item);
      // Check if the item is a directory
      if (fs.statSync(itemPath).isDirectory()) {
        subFolders.push(item);
      }
    }

    return subFolders;
  }

  // cron.schedule("*/10 * * * * *", async () => { // this is 10 sec
  // Define your scheduler initialization logic
  const midnight = "0 30 0 * * *";
  cron.schedule(midnight, async () => {
    /** this is 30 min */
    try {
      const subFolders = (await readDirectories(baseFolderPath)) || [];

      for (const orgId of subFolders) {
        let orgInitFile = `${baseFolderPath}/${orgId}/${initFile}`;

        if (fs.existsSync(orgInitFile)) {
          let fileData = fs.readFileSync(orgInitFile, "utf8");
          const parseData = JSON.parse(fileData);

          parseData.device = await getDeviceDetails();

          if (
            parseData &&
            parseData?.licenseKey &&
            parseData?.licenseKey !== "" &&
            fs.existsSync(`${baseFolderPath}/${orgId}/${serverFile}`)
          ) {
            try {
              const _clientEncryptedData = await aesEncrypt(parseData?.secretId, parseData);

              const _clientKeyData = await rsaEncrypt(`${baseFolderPath}/${orgId}/${serverFile}`, parseData?.secretId);

              const licenseServerAPI = `${parseData.baseUrl}/sdk/api/generateLicense`;

              const apiBody = {
                key: _clientKeyData,
                licenseKey: parseData?.licenseKey,
                client: _clientEncryptedData,
              };

              await axios
                .post(`${licenseServerAPI}`, apiBody, {
                  headers: {
                    "Content-Type": "application/json",
                  },
                })
                .then(async (res) => {
                  if (res.data?.resultCode == 1) {
                    try {
                      fs.writeFileSync(
                        `${licenseBaseFolder}/${orgId}/${licenseFile}`,
                        JSON.stringify(JSON.parse(res.data?.data), null, 2)
                      );
                    } catch (error: any) {
                      logging(
                        orgId,
                        "Auto sync license",
                        `License File Save Exception: ${
                          error instanceof Error ? error.message : "License File Save Exception."
                        }`
                      );
                    }
                    updateTrace(orgId, { isExpired: false, isActive: true, dateTime: new Date() });
                  } else {
                    logging(orgId, "Auto sync license", `Fail: ${JSON.stringify(res.data)}`);
                  }
                })
                .catch(async (err) => {
                  // if(err?.code == "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED")){
                  //   console.error("License server exception  :", err?.message);
                  //   throw new Error(err instanceof Error ? `License server exception : ${err?.message}` : "Something went wrong at licensing server end.");
                  // }

                  logging(
                    orgId,
                    "Auto sync license",
                    `Fail: Status: ${err?.response?.status} : ${err?.message} : ${JSON.stringify(err?.response?.data)}`
                  );
                });
            } catch (error) {
              // console.error("Get License Exception :", error);
              // throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Get License.");
              logging(
                orgId,
                "Auto sync license",
                `Exception: ${error instanceof Error ? error.message : "Unknown error occurred> Sync License."}`
              );
            }
          }
        }
      }
    } catch (error) {
      logging(
        "N.A",
        "Auto sync license",
        `Schedular Exception: ${error instanceof Error ? error.message : "Schedular exception auto sync License."}`
      );
    }
  });

  return true;
})();
