"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
var license_bb_exports = {};
__export(license_bb_exports, {
  License: () => License,
  aesDecrypt: () => aesDecrypt,
  aesEncrypt: () => aesEncrypt,
  aesGenerateKeys: () => aesGenerateKeys,
  rsaDecrypt: () => rsaDecrypt,
  rsaEncrypt: () => rsaEncrypt,
  rsaGenerateKeys: () => rsaGenerateKeys
});
module.exports = __toCommonJS(license_bb_exports);

// Security/AES.ts
var import_crypto = __toESM(require("crypto"));
var defaultKeyLength = 32;
var algorithum = "aes-256-ecb";
function aesGenerateKeys() {
  try {
    const newAesKey = import_crypto.default.randomBytes(defaultKeyLength).toString("base64");
    return newAesKey || "";
  } catch (error) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}
function aesEncrypt(secretKey = "", plainText = "") {
  try {
    let encmsg = "";
    if (typeof plainText == "object") {
      plainText = JSON.stringify(plainText);
    }
    let aesKey = Buffer.from(secretKey, "base64");
    const cipher = import_crypto.default.createCipheriv(algorithum, aesKey, null);
    encmsg = cipher.update(plainText, "utf8", "base64");
    encmsg += cipher.final("base64");
    return encmsg;
  } catch (error) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}
function aesDecrypt(secretKey = "", encryptedText = "") {
  try {
    if (!secretKey || secretKey === "") {
      return "Invalid / blank secret key received for decryption";
    }
    if (!encryptedText || encryptedText === "") {
      return "Invalid / blank encrypted data received for decryption";
    }
    let decryptedData = null;
    let aesKey = Buffer.from(secretKey, "base64");
    const decipher = import_crypto.default.createDecipheriv(algorithum, aesKey, null);
    decryptedData = decipher.update(encryptedText, "base64", "utf8");
    decryptedData += decipher.final("utf8");
    let plainText = decryptedData || "";
    if (plainText.trim() !== "" && plainText.includes("{") && typeof plainText === "string") {
      plainText = JSON.parse(plainText);
    }
    return plainText;
  } catch (error) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}

// Security/RSA.ts
var import_node_forge = __toESM(require("node-forge"));
var import_fs = __toESM(require("fs"));
var forgeKeyCreationOptions = {
  bits: 2048
  // e: 0x10001,
};
function rsaGenerateKeys() {
  try {
    const keys = import_node_forge.default.pki.rsa.generateKeyPair(forgeKeyCreationOptions);
    const privateKey = import_node_forge.default.pki.privateKeyToPem(keys.privateKey);
    const publicKey = import_node_forge.default.pki.publicKeyToPem(keys.publicKey);
    return { privateKey, publicKey };
  } catch (error) {
    console.error("RSA Keygen exception: ", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
  }
}
function rsaEncrypt(keyFilePath = "", plainText = "") {
  try {
    let PUBKEY = import_fs.default.readFileSync(keyFilePath, "utf8");
    let _input = plainText;
    if (typeof plainText == "object") {
      _input = JSON.stringify(plainText);
    }
    const forgePublicKey = import_node_forge.default.pki.publicKeyFromPem(PUBKEY);
    const _encryptedData = forgePublicKey.encrypt(_input);
    const encmsg = import_node_forge.default.util.encode64(_encryptedData);
    return encmsg;
  } catch (error) {
    console.error("RSA Keygen exception: ", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
  }
}
function rsaDecrypt(keyFilePath = "", encryptedText = "") {
  try {
    if (!keyFilePath || keyFilePath === "") {
      return "Invalid / blank Private key file path received for decryption";
    }
    if (!encryptedText || encryptedText === "") {
      return "Invalid / blank encrypted data received for decryption";
    }
    let PRIVKEY = import_fs.default.readFileSync(keyFilePath, "utf8");
    let plainText = "";
    const forgePrivateKey = import_node_forge.default.pki.privateKeyFromPem(PRIVKEY);
    const base64Decode_to_byte = import_node_forge.default.util.decode64(encryptedText);
    plainText = forgePrivateKey.decrypt(base64Decode_to_byte);
    if (plainText.trim() !== "" && plainText.includes("{") && typeof plainText === "string") {
      plainText = JSON.parse(plainText);
    }
    return plainText;
  } catch (error) {
    console.error("RSA Keygen exception: ", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
  }
}

// Main.ts
var import_os = __toESM(require("os"));
var import_axios = __toESM(require("axios"));
var import_moment_timezone = __toESM(require("moment-timezone"));
var import_fs2 = __toESM(require("fs"));
var import_node_cron = __toESM(require("node-cron"));
var import_path = __toESM(require("path"));
var import_hash = require("hash.js");
var licenseBaseFolder = "License";
var licenseFile = "License.pem";
var baseFolderPath = "bbLicenseUtils";
var infoTracerFile = "infoTrace.json";
var initFile = "init";
var deviceFile = "device.json";
var publicFile = "public.pem";
var privateFile = "private.pem";
var serverFile = "server.pem";
var logFile = "log";
var logging = (org_Id = "", reason = "", result = "") => __async(void 0, null, function* () {
  if (import_fs2.default) {
    if (import_fs2.default.existsSync(`${baseFolderPath}/${logFile}`)) {
      try {
        const existingData = import_fs2.default.readFileSync(`${baseFolderPath}/${logFile}`, "utf8");
        const newData = `${(/* @__PURE__ */ new Date()).toISOString()} > ${org_Id}: ${reason}: ${result}`;
        const updatedData = `${existingData.trim()}
${newData}`;
        import_fs2.default.writeFileSync(`${baseFolderPath}/${logFile}`, updatedData);
      } catch (err) {
        console.error(`Error updating file log file`);
      }
    } else {
      try {
        const newData = `${(/* @__PURE__ */ new Date()).toISOString()} > ${org_Id}: ${reason}: ${result}`;
        const updatedData = `${newData}`;
        import_fs2.default.writeFileSync(`${baseFolderPath}/${logFile}`, updatedData);
      } catch (err) {
        console.error(`Error updating file log file`);
      }
    }
  }
});
var getTrace = (org_Id = "") => __async(void 0, null, function* () {
  if (import_fs2.default) {
    if (import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`)) {
      let traceFileData = import_fs2.default.readFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, "utf8");
      if (traceFileData) {
        return JSON.parse(traceFileData);
      }
    }
    return null;
  }
});
var updateTrace = (org_Id = "", JsonData) => __async(void 0, null, function* () {
  if (import_fs2.default) {
    let oldTrace = yield getTrace(org_Id);
    if (oldTrace && oldTrace !== null && JsonData) {
      let newTraceData = __spreadValues(__spreadValues({}, oldTrace), JsonData);
      import_fs2.default.writeFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, JSON.stringify(newTraceData, null, 2));
    } else if (!oldTrace && JsonData) {
      import_fs2.default.writeFileSync(`${baseFolderPath}/${org_Id}/${infoTracerFile}`, JSON.stringify(JsonData, null, 2));
    }
  }
});
var hashString = (input) => __async(void 0, null, function* () {
  const data = new TextEncoder().encode(input);
  const hash = (0, import_hash.sha256)().update(data).digest("hex");
  return hash;
});
var getDeviceDetails = () => __async(void 0, null, function* () {
  var _a;
  let _deviceDetails = {
    deviceId: "",
    osType: "",
    deviceType: "",
    browser: ""
  };
  let filePath = `${baseFolderPath}/${deviceFile}`;
  if (import_fs2.default.existsSync(filePath)) {
    let fileData = import_fs2.default.readFileSync(`${baseFolderPath}/${deviceFile}`, "utf8");
    const parseData = fileData ? JSON.parse(fileData) : null;
    if (parseData) {
      return parseData || null;
    }
  }
  const platform = (process == null ? void 0 : process.platform) || import_os.default.platform();
  const _host = ((_a = process == null ? void 0 : process.env) == null ? void 0 : _a.HOSTNAME) || import_os.default.hostname();
  const systemInfo = `${_host || ""}${(process == null ? void 0 : process.arch) || ""}${platform}${(process == null ? void 0 : process.version) || ""}`;
  const hashedData = yield hashString(systemInfo);
  _deviceDetails.deviceId = hashedData;
  if ((platform == null ? void 0 : platform.toLowerCase()) === "linux") {
    _deviceDetails.osType = "Linux";
  } else if ((platform == null ? void 0 : platform.toLowerCase()) === "darwin") {
    _deviceDetails.osType = "Mac";
  } else if ((platform == null ? void 0 : platform.toLowerCase()) === "win32") {
    _deviceDetails.osType = "Windows";
  } else {
    _deviceDetails.osType = "Unknown";
  }
  if (import_fs2.default.existsSync("/proc/1/cgroup")) {
    import_fs2.default.readFile("/proc/1/cgroup", "utf8", (err, data) => {
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
  try {
    import_fs2.default.writeFileSync(`${baseFolderPath}/${deviceFile}`, JSON.stringify(_deviceDetails, null, 2));
  } catch (error) {
    console.error("SDK EXCEPTION :> on device details save ", error);
  }
  return _deviceDetails;
});
var _License = class {
  /** External access functions */
  static init(base_Url = "", license_Key = "", clientData) {
    return __async(this, null, function* () {
      var _a, _b;
      try {
        try {
          [baseFolderPath, licenseBaseFolder].forEach((folderPath) => {
            if (!import_fs2.default.existsSync(folderPath)) {
              import_fs2.default.mkdirSync(folderPath, { recursive: true });
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
        const keyCheckRes = yield this.checkValidKey(license_Key, base_Url);
        if (Number(keyCheckRes == null ? void 0 : keyCheckRes.code) < 0) {
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
        let org_Id = ((_b = (_a = clientData == null ? void 0 : clientData.orgId) == null ? void 0 : _a.toString()) == null ? void 0 : _b.trim()) || "";
        if (!org_Id) {
          console.error(`Org id should't be blank '${org_Id}'.`);
          throw new Error(`Org id should't be blank '${org_Id}'.`);
        }
        try {
          [`${baseFolderPath}/${org_Id}`, `${licenseBaseFolder}/${org_Id}`].forEach((folderPath) => {
            if (!import_fs2.default.existsSync(folderPath)) {
              import_fs2.default.mkdirSync(folderPath, { recursive: true });
            }
          });
        } catch (error) {
          console.error("Path creation error for org id. ", error);
          throw new Error(
            error instanceof Error ? error.message : "Unknown error occurred > Path creation error for org id."
          );
        }
        let preChecks = yield this.checkPreinit(org_Id);
        let clientConfig = null;
        if (!preChecks.isInitFile) {
          this.licenseKey = license_Key;
          this.baseUrl = base_Url;
          this.device = yield getDeviceDetails();
          this.secretId = yield aesGenerateKeys();
          clientConfig = __spreadProps(__spreadValues({
            baseUrl: this.baseUrl,
            licenseKey: this.licenseKey,
            device: this.device,
            secretId: this.secretId || "",
            dateTime: this.dateTime,
            timeZone: this.timeZone
          }, clientData), {
            orgId: org_Id
          });
        } else {
          const existingClientObj = yield this.readFileAndParse(org_Id);
          if (existingClientObj.licenseKey !== license_Key) {
            existingClientObj.licenseKey = license_Key;
            existingClientObj.dateTime = /* @__PURE__ */ new Date();
            if (existingClientObj) {
              clientConfig = __spreadValues({}, existingClientObj);
            } else {
              console.warn(`Empty existing client details found:${org_Id}`, { existingClientObj });
            }
            try {
              preChecks = { isPublicFile: false, isPrivateFile: false };
            } catch (error) {
              console.error("EXCEPTION removeKeyFiles/configFiles :> ", error);
              throw new Error(
                error instanceof Error ? error.message : "Unknown error occurred > While updating user config files."
              );
            }
          } else {
            clientConfig = __spreadValues({}, existingClientObj);
          }
        }
        let isExchangeNow = false;
        let keyGen;
        if (!preChecks.isPublicFile || !preChecks.isPrivateFile) {
          keyGen = yield rsaGenerateKeys();
          import_fs2.default.writeFileSync(`${baseFolderPath}/${org_Id}/temp_${publicFile}`, keyGen.publicKey);
          import_fs2.default.writeFileSync(`${baseFolderPath}/${org_Id}/temp_${privateFile}`, keyGen.privateKey);
          isExchangeNow = true;
        }
        if (!isExchangeNow) {
          let exchangeFiles = yield this.checkExchangeFiles(org_Id);
          isExchangeNow = !(exchangeFiles == null ? void 0 : exchangeFiles.isServerFile) || !(exchangeFiles == null ? void 0 : exchangeFiles.isLicenseFile) ? true : false;
        }
        if (isExchangeNow) {
          return yield this.doExchange(org_Id, clientConfig).then((exchRes) => {
            if (Number(exchRes == null ? void 0 : exchRes.code) < 0) {
              return exchRes;
            } else {
              try {
                if (import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/temp_${publicFile}`)) {
                  import_fs2.default.renameSync(
                    `${baseFolderPath}/${org_Id}/temp_${publicFile}`,
                    `${baseFolderPath}/${org_Id}/${publicFile}`
                  );
                }
                if (import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/temp_${privateFile}`)) {
                  import_fs2.default.renameSync(
                    `${baseFolderPath}/${org_Id}/temp_${privateFile}`,
                    `${baseFolderPath}/${org_Id}/${privateFile}`
                  );
                }
                import_fs2.default.writeFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, JSON.stringify(clientConfig));
              } catch (error) {
                console.error("EXCEPTION writing client config File :> ", error);
                throw new Error(
                  error instanceof Error ? error.message : "Unknown error occurred > While writing client config File."
                );
              }
              return {
                code: 1,
                data: null,
                result: "Successfully license exchange/received."
              };
            }
          });
        } else {
          return yield _License.sync(license_Key, org_Id).then((syncRes) => {
            if (Number(syncRes == null ? void 0 : syncRes.code) < 0) {
              return syncRes;
            } else {
              return {
                code: 1,
                data: null,
                result: "Successfully license sync."
              };
            }
          });
        }
      } catch (error) {
        console.error("Initialization fail: ", error);
        throw new Error(error instanceof Error ? error.message : "Unknown error occurred > Initialization failed.");
      }
    });
  }
  static getConfig(org_Id = "") {
    return __async(this, null, function* () {
      if (!org_Id) {
        console.error(`Org id should't be blank '${org_Id}'.`);
        throw new Error(`Org id should't be blank '${org_Id}'.`);
      }
      const clientData = yield this.readFileAndParse(org_Id.toString().trim());
      if (!clientData) {
        console.error(`No client config found. please call init() with org id ${org_Id}.`);
        throw new Error(`No client config found. please call init() with org id ${org_Id}.`);
      }
      return {
        code: 1,
        data: clientData,
        result: "Success"
      };
    });
  }
  static update(license_Key = "", org_Id = "", assignType = "update") {
    return __async(this, null, function* () {
      if (!license_Key || !org_Id) {
        console.error(`license_Key & org_Id should't be blank '${org_Id}'.`);
        throw new Error(`license_Key & org_Id should't be blank '${org_Id}'.`);
      }
      let orgInitFile = `${baseFolderPath}/${org_Id.toString().trim()}/${initFile}`;
      if (import_fs2.default.existsSync(orgInitFile)) {
        let fileData = import_fs2.default.readFileSync(orgInitFile, "utf8");
        const parseData = JSON.parse(fileData);
        parseData.assignType = assignType;
        parseData.device = yield getDeviceDetails();
        parseData.licenseKey = license_Key;
        parseData.orgId = org_Id.toString().trim();
        parseData.dateTime = /* @__PURE__ */ new Date();
        const res_init = yield _License.init(parseData == null ? void 0 : parseData.baseUrl, license_Key, parseData);
        return res_init;
      } else {
        console.error(`No exiting init file found please do initialize client using init() org id ${org_Id}.`);
        throw new Error(`No exiting init file found please do initialize client using init()`);
      }
    });
  }
  static sync(license_Key = "", org_Id = "") {
    return __async(this, null, function* () {
      if (!license_Key || !org_Id) {
        console.error(`license_Key & org_Id should't be blank '${org_Id}'.`);
        throw new Error(`license_Key & org_Id should't be blank '${org_Id}'.`);
      }
      let orgInitFile = `${baseFolderPath}/${org_Id.toString().trim()}/${initFile}`;
      if (import_fs2.default.existsSync(orgInitFile)) {
        let fileData = import_fs2.default.readFileSync(orgInitFile, "utf8");
        const parseData = JSON.parse(fileData);
        if (parseData.licenseKey !== license_Key) {
          console.error(`License key '${license_Key}' doesn't match with existing license to sync.`);
          throw new Error(`License key '${license_Key}' doesn't match with existing license to sync.`);
        } else {
          return yield this.getLicense(org_Id.toString().trim(), parseData).then((exchRes) => {
            if (Number(exchRes == null ? void 0 : exchRes.code) < 0) {
              return exchRes;
            } else {
              return {
                code: 1,
                data: null,
                result: "License synced successfully."
              };
            }
          });
        }
      } else {
        console.error(`No exiting init file found for org id ${org_Id}, please do initialize client again.`);
        throw new Error(`No exiting init file found for org id ${org_Id}, please do initialize client again.`);
      }
    });
  }
  static calculateDays(startDate = "") {
    if (startDate !== "") {
      const date = new Date(startDate);
      const today = /* @__PURE__ */ new Date();
      date.setUTCHours(0, 0, 0, 0);
      today.setUTCHours(0, 0, 0, 0);
      const differenceInMilliseconds = today.getTime() - date.getTime();
      const differenceInDays = Math.floor(differenceInMilliseconds / (1e3 * 60 * 60 * 24)) + 1;
      return differenceInDays;
    }
    return -1;
  }
  static getFeatures(org_Id = "", featureName = "all") {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      try {
        if (!org_Id) {
          console.error(`Org id should't be blank '${org_Id}'.`);
          throw new Error(`Org id should't be blank '${org_Id}'.`);
        }
        if (!featureName) {
          console.debug(`Feature name should't be blank '${featureName}', Now auto set to "all".`);
          featureName = "all";
        }
        let licenseData = yield this.extractLicense(org_Id.toString().trim());
        if (Number(licenseData == null ? void 0 : licenseData.code) < 0)
          return licenseData;
        let fullLicense = __spreadValues({}, licenseData == null ? void 0 : licenseData.data);
        let _lic_package = (_a = fullLicense == null ? void 0 : fullLicense.include) == null ? void 0 : _a.package;
        let _features = (_lic_package == null ? void 0 : _lic_package.featuresList) || (_lic_package == null ? void 0 : _lic_package.features) || [];
        let _lic_meta = {
          issueDate: ((_b = fullLicense == null ? void 0 : fullLicense.meta) == null ? void 0 : _b.issued) || "",
          expiryDate: ((_c = fullLicense == null ? void 0 : fullLicense.meta) == null ? void 0 : _c.expiry) || "",
          package_id: (_lic_package == null ? void 0 : _lic_package._id) || "",
          isExpired: false
        };
        if (((_d = fullLicense == null ? void 0 : fullLicense.include) == null ? void 0 : _d.package) && _features && (_features == null ? void 0 : _features.length) > 0) {
          let expiryDateDays = _License.calculateDays(_lic_meta == null ? void 0 : _lic_meta.expiryDate);
          if (expiryDateDays >= 2) {
            _lic_meta.isExpired = true;
          }
          if (typeof featureName === "string" && (featureName == null ? void 0 : featureName.toLowerCase()) === "all") {
            let _fList = [];
            _features.forEach((item) => {
              _fList.push(__spreadProps(__spreadValues({}, item), {
                data: (item == null ? void 0 : item.type) == "number" && (item == null ? void 0 : item.data) !== "" ? Number(item == null ? void 0 : item.data) : (item == null ? void 0 : item.type) == "boolean" && (item == null ? void 0 : item.data) !== "" ? item.data === "false" ? false : Boolean(item.data) : (item == null ? void 0 : item.type) == "date" && (item == null ? void 0 : item.data) !== "" ? new Date(item == null ? void 0 : item.data) : item.data
              }));
            });
            return {
              code: 1,
              data: _fList,
              result: "List of all features",
              meta: _lic_meta || null
            };
          } else if (typeof featureName === "object" && Array.isArray(featureName)) {
            const filteredList = _features.length > 0 ? _features == null ? void 0 : _features.filter((obj) => featureName == null ? void 0 : featureName.includes(obj.name)) : [];
            let _fList = [];
            if (filteredList && (filteredList == null ? void 0 : filteredList.length) > 0) {
              filteredList == null ? void 0 : filteredList.forEach((item) => {
                _fList.push(__spreadProps(__spreadValues({}, item), {
                  data: (item == null ? void 0 : item.type) == "number" && (item == null ? void 0 : item.data) !== "" ? Number(item == null ? void 0 : item.data) : (item == null ? void 0 : item.type) == "boolean" && (item == null ? void 0 : item.data) !== "" ? item.data === "false" ? false : Boolean(item.data) : (item == null ? void 0 : item.type) == "date" && (item == null ? void 0 : item.data) !== "" ? new Date(item == null ? void 0 : item.data) : item.data
                }));
              });
              return {
                code: 1,
                data: _fList,
                result: "List of features",
                meta: _lic_meta || null
              };
            }
          } else {
            const item = _features.length > 0 ? _features == null ? void 0 : _features.find((data) => {
              var _a2;
              return ((_a2 = data == null ? void 0 : data.name) == null ? void 0 : _a2.toLowerCase()) === (featureName == null ? void 0 : featureName.toLowerCase());
            }) : null;
            if (item) {
              return {
                code: 1,
                data: __spreadProps(__spreadValues({}, item), {
                  data: (item == null ? void 0 : item.type) == "number" && (item == null ? void 0 : item.data) !== "" ? Number(item == null ? void 0 : item.data) : (item == null ? void 0 : item.type) == "boolean" && (item == null ? void 0 : item.data) !== "" ? item.data === "false" ? false : Boolean(item.data) : (item == null ? void 0 : item.type) == "date" && (item == null ? void 0 : item.data) !== "" ? new Date(item == null ? void 0 : item.data) : item.data
                }),
                meta: _lic_meta || null,
                result: item ? "Success" : "No Feature Found."
              };
            }
          }
          let _errorMsg = `No Feature found with this name '${typeof featureName === "string" ? featureName : featureName == null ? void 0 : featureName.join(",")}'`;
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
    });
  }
  static getLicenseDetails(org_Id = "") {
    return __async(this, null, function* () {
      var _a, _b, _c;
      try {
        if (!org_Id) {
          console.error(`Org id should't be blank '${org_Id}'.`);
          throw new Error(`Org id should't be blank '${org_Id}'.`);
        }
        let licenseData = yield this.extractLicense(org_Id.toString().trim());
        if (Number(licenseData == null ? void 0 : licenseData.code) < 0)
          return licenseData;
        let fullLicense = __spreadValues({}, licenseData == null ? void 0 : licenseData.data);
        let _lic_package = (_a = fullLicense == null ? void 0 : fullLicense.include) == null ? void 0 : _a.package;
        let _lic_meta = {
          issueDate: ((_b = fullLicense == null ? void 0 : fullLicense.meta) == null ? void 0 : _b.issued) || "",
          expiryDate: ((_c = fullLicense == null ? void 0 : fullLicense.meta) == null ? void 0 : _c.expiry) || "",
          package_id: (_lic_package == null ? void 0 : _lic_package._id) || "",
          isExpired: false
        };
        let expiryDateDays = _License.calculateDays(_lic_meta == null ? void 0 : _lic_meta.expiryDate);
        if (expiryDateDays >= 2) {
          _lic_meta.isExpired = true;
        }
        let featuresList = (_lic_package == null ? void 0 : _lic_package.featuresList) || (_lic_package == null ? void 0 : _lic_package.features) || [];
        fullLicense.meta = _lic_meta;
        let _fList = [];
        if ((featuresList == null ? void 0 : featuresList.length) > 0) {
          featuresList.forEach((item) => {
            _fList.push(__spreadProps(__spreadValues({}, item), {
              data: (item == null ? void 0 : item.type) == "number" && (item == null ? void 0 : item.data) !== "" ? Number(item == null ? void 0 : item.data) : (item == null ? void 0 : item.type) == "boolean" && (item == null ? void 0 : item.data) !== "" ? item.data === "false" ? false : Boolean(item.data) : (item == null ? void 0 : item.type) == "date" && (item == null ? void 0 : item.data) !== "" ? new Date(item == null ? void 0 : item.data) : item.data
            }));
          });
        }
        fullLicense.include.package.features = _fList;
        return {
          code: 1,
          data: fullLicense,
          result: "License Details",
          meta: _lic_meta || null
        };
      } catch (error) {
        console.error("Get License Details fail: ", error);
        throw new Error(error instanceof Error ? error.message : "Unknown error occurred > GetLicenseDetail().");
      }
    });
  }
};
var License = _License;
License.licenseKey = "";
License.baseUrl = "";
License.secretId = "";
// private static platform: string = "";
// private static deviceId: string = "";
License.device = {};
License.org_Id = "default";
// private static _ip: string = ip.address() || "";
License.dateTime = /* @__PURE__ */ new Date();
License.timeZone = import_moment_timezone.default.tz.guess();
License.doExchange = (..._0) => __async(_License, [..._0], function* (org_Id = _License.org_Id, clientData) {
  try {
    if (!org_Id) {
      console.error(`Org id should't be blank '${org_Id}'.`);
      throw new Error(`Org id should't be blank '${org_Id}'.`);
    }
    if (clientData) {
      let publicFilePath = `${baseFolderPath}/${org_Id.toString().trim()}/${publicFile}`;
      let tempPublicFilePath = `${baseFolderPath}/${org_Id.toString().trim()}/temp_${publicFile}`;
      let _public_Key = import_fs2.default.existsSync(tempPublicFilePath) ? yield import_fs2.default.readFileSync(tempPublicFilePath, "utf8") : yield import_fs2.default.readFileSync(publicFilePath, "utf8");
      if (!(clientData == null ? void 0 : clientData.licenseKey)) {
        console.error(`No client license key found, please call init() again with required data.`);
        throw new Error(`No client license key found, please call init() again with required data.`);
      } else if (!_public_Key) {
        console.error(`No client public key found, please call init() again with required data.`);
        throw new Error(`No client public key found, please call init() again with required data.`);
      }
      const _doExchangeApi = `${clientData.baseUrl}/sdk/api/doExchange`;
      const _clientData = __spreadValues({}, clientData);
      if (_clientData.secretId)
        delete _clientData.secretId;
      if (_clientData.baseUrl)
        delete _clientData.baseUrl;
      const apiBody = {
        key: _public_Key.toString(),
        licenseKey: _clientData == null ? void 0 : _clientData.licenseKey,
        email: _clientData == null ? void 0 : _clientData.email,
        orgId: _clientData == null ? void 0 : _clientData.orgId,
        assignType: _clientData == null ? void 0 : _clientData.assignType
      };
      return yield import_axios.default.post(`${_doExchangeApi}`, apiBody, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then((res) => __async(_License, null, function* () {
        var _a, _b;
        if (((_a = res.data) == null ? void 0 : _a.resultCode) == 1) {
          import_fs2.default.writeFileSync(`${baseFolderPath}/${org_Id.toString().trim()}/${serverFile}`, ((_b = res.data) == null ? void 0 : _b.data) || "");
          return yield _License.getLicense(org_Id.toString().trim(), clientData).then((getLic) => {
            if (Number(getLic == null ? void 0 : getLic.code) < 0) {
              return getLic;
            } else {
              return {
                code: 1,
                data: null,
                result: "Successfully exchanged and received license."
              };
            }
          });
        } else {
          console.error(`Exchange fail with license server for org '${org_Id}'.`);
          throw new Error(`Exchange fail with license server for org '${org_Id}'.`);
        }
      })).catch((err) => {
        var _a, _b, _c, _d, _e;
        if ((err == null ? void 0 : err.code) == "ECONNREFUSED" || ((_a = err == null ? void 0 : err.message) == null ? void 0 : _a.includes("ECONNREFUSED"))) {
          console.error("Unable to connect License server :", err == null ? void 0 : err.message);
          throw new Error(
            err instanceof Error ? `Unable to connect License server : ${err == null ? void 0 : err.message}` : "Something went wrong at licensing server end."
          );
        }
        console.debug(
          "License Server Response : ",
          `Status: ${(_b = err == null ? void 0 : err.response) == null ? void 0 : _b.status} : ${err == null ? void 0 : err.message} : `,
          (_c = err == null ? void 0 : err.response) == null ? void 0 : _c.data
        );
        let _errorMsg = ((_e = (_d = err == null ? void 0 : err.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || "Fail to get license from server.";
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
});
License.getLicense = (org_Id = "", clientData) => __async(_License, null, function* () {
  try {
    const _clientEncryptedData = yield aesEncrypt(clientData == null ? void 0 : clientData.secretId, clientData);
    const _clientKeyData = yield rsaEncrypt(`${baseFolderPath}/${org_Id}/${serverFile}`, clientData == null ? void 0 : clientData.secretId);
    const licenseServerAPI = `${clientData == null ? void 0 : clientData.baseUrl}/sdk/api/generateLicense`;
    const apiBody = {
      key: _clientKeyData,
      licenseKey: clientData == null ? void 0 : clientData.licenseKey,
      client: _clientEncryptedData
    };
    let licenseUrl = "";
    return yield import_axios.default.post(`${licenseServerAPI}`, apiBody, {
      headers: {
        "Content-Type": "application/json"
      }
    }).then((res) => {
      var _a, _b, _c;
      if (((_a = res.data) == null ? void 0 : _a.resultCode) == 1) {
        try {
          import_fs2.default.writeFileSync(
            `${licenseBaseFolder}/${org_Id}/${licenseFile}`,
            JSON.stringify(JSON.parse((_b = res.data) == null ? void 0 : _b.data), null, 2)
          );
        } catch (error) {
          console.error("SDK EXCEPTION :> ", error);
          throw new Error(error instanceof Error ? error.message : "License File Save Exception.");
        }
        licenseUrl = (_c = res.data) == null ? void 0 : _c.downloadUrl;
        updateTrace(org_Id, { isExpired: false, isActive: true, dateTime: /* @__PURE__ */ new Date() });
        return {
          code: 1,
          data: { licenseUrl },
          result: "License received and saved."
        };
      } else {
        console.error(`Get License fail with license server. '${org_Id}'.`);
        throw new Error(`Get License fail with license server. '${org_Id}'.`);
      }
    }).catch((err) => {
      var _a, _b, _c, _d, _e;
      if ((err == null ? void 0 : err.code) == "ECONNREFUSED" || ((_a = err == null ? void 0 : err.message) == null ? void 0 : _a.includes("ECONNREFUSED"))) {
        console.error("Unable to connect License server :", err == null ? void 0 : err.message);
        throw new Error(
          err instanceof Error ? `Unable to connect License server : ${err == null ? void 0 : err.message}` : "Something went wrong at licensing server end."
        );
      }
      console.debug(
        "License Server Response : ",
        `Status: ${(_b = err == null ? void 0 : err.response) == null ? void 0 : _b.status} : ${err == null ? void 0 : err.message} : `,
        (_c = err == null ? void 0 : err.response) == null ? void 0 : _c.data
      );
      let _errorMsg = ((_e = (_d = err == null ? void 0 : err.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || "Fail to get license from server.";
      console.error({ _errorMsg });
      throw new Error(_errorMsg);
    });
  } catch (error) {
    console.error("Get License Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Get License.");
  }
});
License.checkValidKey = (license_Key = "", baseUrl = "") => __async(_License, null, function* () {
  try {
    const licenseServerAPI = `${baseUrl}/sdk/api/keyCheck/${license_Key}`;
    return yield import_axios.default.get(`${licenseServerAPI}`, {
      headers: {
        "Content-Type": "application/json"
      }
    }).then((res) => {
      var _a, _b;
      if (((_a = res.data) == null ? void 0 : _a.resultCode) == 1) {
        return {
          code: 1,
          data: null,
          result: ((_b = res.data) == null ? void 0 : _b.message) || "Key is valid"
        };
      } else {
        console.error(`Key is invalid.`);
        throw new Error(`Key is invalid.`);
      }
    }).catch((err) => {
      var _a, _b, _c, _d;
      if ((err == null ? void 0 : err.code) == "ECONNREFUSED" || ((_a = err == null ? void 0 : err.message) == null ? void 0 : _a.includes("ECONNREFUSED"))) {
        console.error("Unable to connect License server :", err == null ? void 0 : err.message);
        throw new Error(
          err instanceof Error ? `Unable to connect License server : ${err == null ? void 0 : err.message}` : "Something went wrong at licensing server end."
        );
      }
      console.debug(
        "License Server Response : ",
        `Status: ${(_b = err == null ? void 0 : err.response) == null ? void 0 : _b.status} : ${err == null ? void 0 : err.message} :`,
        ((_c = err == null ? void 0 : err.response) == null ? void 0 : _c.data) || (err == null ? void 0 : err.response) || err
      );
      let _errorMsg = ((_d = err == null ? void 0 : err.response) == null ? void 0 : _d.status) == 400 ? `Invalid license key '${license_Key}', please check the license key` : `Fail to check license key '${license_Key}'`;
      console.error({ _errorMsg });
      throw new Error(_errorMsg);
    });
  } catch (error) {
    console.error("Key Check Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Key Check.");
  }
});
License.checkPreinit = (org_Id = "") => __async(_License, null, function* () {
  let isInitFile = import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/${initFile}`) || false;
  let isPublicFile = import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/${publicFile}`) || false;
  let isPrivateFile = import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/${privateFile}`) || false;
  return { isInitFile, isPublicFile, isPrivateFile };
});
License.checkExchangeFiles = (org_Id = "") => __async(_License, null, function* () {
  let isServerFile = import_fs2.default.existsSync(`${baseFolderPath}/${org_Id}/${serverFile}`) || false;
  let isLicenseFile = import_fs2.default.existsSync(`${licenseBaseFolder}/${org_Id}/${licenseFile}`) || false;
  return { isServerFile, isLicenseFile };
});
License.removeKeyFiles = (org_Id = "", reason = "init()") => __async(_License, null, function* () {
  let orgPublicFile = `${baseFolderPath}/${org_Id}/${publicFile}`;
  let orgPrivateFile = `${baseFolderPath}/${org_Id}/${privateFile}`;
  let orgServerFile = `${baseFolderPath}/${org_Id}/${serverFile}`;
  const filesToDelete = [orgPublicFile, orgPrivateFile, orgServerFile];
  try {
    filesToDelete.forEach((filePath) => {
      if (import_fs2.default.existsSync(filePath)) {
        import_fs2.default.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("Remove Files Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> Remove Files.");
  }
  return true;
});
License.readFileAndParse = (org_Id = "") => __async(_License, null, function* () {
  let fileData = import_fs2.default.readFileSync(`${baseFolderPath}/${org_Id}/${initFile}`, "utf8");
  const parseData = JSON.parse(fileData);
  return parseData || null;
});
License.extractLicense = (org_Id = "") => __async(_License, null, function* () {
  var _a, _b;
  try {
    const filePath = `${licenseBaseFolder}/${org_Id}/${licenseFile}`;
    let oldTrace = yield getTrace(org_Id);
    if (oldTrace && oldTrace.isActive == false) {
      return { code: -2, result: "License is not active, please contact admin.", data: null };
    } else if (oldTrace && oldTrace.isExpired == true) {
      return { code: -2, result: "License is Expired, please contact admin.", data: null };
    }
    if (import_fs2.default.existsSync(filePath)) {
      let _encryptedLicense = yield import_fs2.default.readFileSync(filePath, "utf8");
      _encryptedLicense = JSON.parse(_encryptedLicense);
      const decodedSign = rsaDecrypt(`${baseFolderPath}/${org_Id}/${privateFile}`, _encryptedLicense == null ? void 0 : _encryptedLicense.sign);
      if ((_a = decodedSign == null ? void 0 : decodedSign.toString()) == null ? void 0 : _a.includes("Invalid")) {
        console.error(decodedSign || `Invalid encrypted data received for decrypt signature for org ${org_Id}`);
        throw new Error(decodedSign || "Invalid encrypted data received for decrypt signature.");
      }
      let decodedLicense = aesDecrypt(decodedSign, _encryptedLicense == null ? void 0 : _encryptedLicense.enc);
      if ((_b = decodedLicense == null ? void 0 : decodedLicense.toString()) == null ? void 0 : _b.includes("Invalid")) {
        console.error(decodedSign || `Invalid encrypted data received for decrypt license for org ${org_Id}`);
        throw new Error(decodedSign || "Invalid encrypted data received for decrypt license.");
      }
      const fullLicense = typeof decodedLicense == "string" ? JSON.parse(decodedLicense) : decodedLicense;
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
});
License.delete = (org_Id = "") => __async(_License, null, function* () {
  if (!org_Id) {
    console.error(`Org id should't be blank '${org_Id}'.`);
    throw new Error(`Org id should't be blank '${org_Id}'.`);
  }
  try {
    let orgInitFile = `${baseFolderPath}/${org_Id.toString().trim()}/${initFile}`;
    if (import_fs2.default.existsSync(orgInitFile)) {
      let fileData = import_fs2.default.readFileSync(orgInitFile, "utf8");
      const parseData = JSON.parse(fileData);
      return yield import_axios.default.delete(`${parseData == null ? void 0 : parseData.baseUrl}/sdk/api/delete/${org_Id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then((res) => {
        var _a;
        if (((_a = res.data) == null ? void 0 : _a.resultCode) == 1) {
          try {
            _License.removeKeyFiles(org_Id, "deleteLicense()");
            if (import_fs2.default.existsSync(`${licenseBaseFolder}/${org_Id}/${licenseFile}`)) {
              import_fs2.default.unlink(`${licenseBaseFolder}/${org_Id}/${licenseFile}`, () => {
              });
            }
          } catch (error) {
            console.error("Fail to delete files after delete license. ", error);
            throw new Error(error instanceof Error ? error.message : "License File Delete Exception.");
          }
          return {
            code: 1,
            data: {},
            result: "License deleted."
          };
        } else {
          console.error(`Fail to delete license on server. '${org_Id}'.`);
          throw new Error(`Fail to delete license on server. '${org_Id}'.`);
        }
      }).catch((err) => {
        var _a, _b, _c, _d, _e;
        if ((err == null ? void 0 : err.code) == "ECONNREFUSED" || ((_a = err == null ? void 0 : err.message) == null ? void 0 : _a.includes("ECONNREFUSED"))) {
          console.error("Unable to connect License server :", err == null ? void 0 : err.message);
          throw new Error(
            err instanceof Error ? `Unable to connect License server : ${err == null ? void 0 : err.message}` : "Something went wrong at licensing server end."
          );
        }
        console.debug(
          "License Server Response : ",
          `Status: ${(_b = err == null ? void 0 : err.response) == null ? void 0 : _b.status} : ${err == null ? void 0 : err.message} : `,
          (_c = err == null ? void 0 : err.response) == null ? void 0 : _c.data
        );
        let _errorMsg = ((_e = (_d = err == null ? void 0 : err.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || "Fail to delete license from server.";
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
});
(function() {
  return __async(this, null, function* () {
    function readDirectories(directoryPath) {
      const subFolders = [];
      const contents = import_fs2.default.readdirSync(directoryPath);
      for (const item of contents) {
        const itemPath = import_path.default.join(directoryPath, item);
        if (import_fs2.default.statSync(itemPath).isDirectory()) {
          subFolders.push(item);
        }
      }
      return subFolders;
    }
    const midnight = "0 30 0 * * *";
    import_node_cron.default.schedule(midnight, () => __async(this, null, function* () {
      try {
        const subFolders = (yield readDirectories(baseFolderPath)) || [];
        for (const orgId of subFolders) {
          let orgInitFile = `${baseFolderPath}/${orgId}/${initFile}`;
          if (import_fs2.default.existsSync(orgInitFile)) {
            let fileData = import_fs2.default.readFileSync(orgInitFile, "utf8");
            const parseData = JSON.parse(fileData);
            parseData.device = yield getDeviceDetails();
            if (parseData && (parseData == null ? void 0 : parseData.licenseKey) && (parseData == null ? void 0 : parseData.licenseKey) !== "" && import_fs2.default.existsSync(`${baseFolderPath}/${orgId}/${serverFile}`)) {
              try {
                const _clientEncryptedData = yield aesEncrypt(parseData == null ? void 0 : parseData.secretId, parseData);
                const _clientKeyData = yield rsaEncrypt(`${baseFolderPath}/${orgId}/${serverFile}`, parseData == null ? void 0 : parseData.secretId);
                const licenseServerAPI = `${parseData.baseUrl}/sdk/api/generateLicense`;
                const apiBody = {
                  key: _clientKeyData,
                  licenseKey: parseData == null ? void 0 : parseData.licenseKey,
                  client: _clientEncryptedData
                };
                yield import_axios.default.post(`${licenseServerAPI}`, apiBody, {
                  headers: {
                    "Content-Type": "application/json"
                  }
                }).then((res) => __async(this, null, function* () {
                  var _a, _b;
                  if (((_a = res.data) == null ? void 0 : _a.resultCode) == 1) {
                    try {
                      import_fs2.default.writeFileSync(
                        `${licenseBaseFolder}/${orgId}/${licenseFile}`,
                        JSON.stringify(JSON.parse((_b = res.data) == null ? void 0 : _b.data), null, 2)
                      );
                    } catch (error) {
                      logging(
                        orgId,
                        "Auto sync license",
                        `License File Save Exception: ${error instanceof Error ? error.message : "License File Save Exception."}`
                      );
                    }
                    updateTrace(orgId, { isExpired: false, isActive: true, dateTime: /* @__PURE__ */ new Date() });
                  } else {
                    logging(orgId, "Auto sync license", `Fail: ${JSON.stringify(res.data)}`);
                  }
                })).catch((err) => __async(this, null, function* () {
                  var _a, _b;
                  logging(
                    orgId,
                    "Auto sync license",
                    `Fail: Status: ${(_a = err == null ? void 0 : err.response) == null ? void 0 : _a.status} : ${err == null ? void 0 : err.message} : ${JSON.stringify((_b = err == null ? void 0 : err.response) == null ? void 0 : _b.data)}`
                  );
                }));
              } catch (error) {
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
    }));
    return true;
  });
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  License,
  aesDecrypt,
  aesEncrypt,
  aesGenerateKeys,
  rsaDecrypt,
  rsaEncrypt,
  rsaGenerateKeys
});
//# sourceMappingURL=index.js.map