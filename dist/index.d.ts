declare function aesGenerateKeys(): string;
declare function aesEncrypt(secretKey?: string, plainText?: string): String;
declare function aesDecrypt(secretKey?: string, encryptedText?: string): String;

type rsaKey = {
    privateKey: string;
    publicKey: string;
};
type clientInputData = {
    email: String | null | undefined;
    phone?: String | null | undefined;
    userName: String | null | undefined;
    orgId: String | null | undefined;
    orgName?: String | null | undefined;
    assignType?: String | null | undefined | 'default';
    serverNameAlias?: String | null | undefined | 'UAT' | 'SIT' | 'LIVE' | 'TEST';
};
type responseData = {
    code: Number | number | 1 | -1 | -2;
    data: Object | any | null;
    result: String | null | undefined;
    meta?: Object | any | null;
};
type DeviceDetails = {
    deviceId: string | undefined;
    osType: string | undefined;
    deviceType?: 'Desktop' | 'Mobile' | string | undefined;
    browser?: string | undefined | '';
};

declare function rsaGenerateKeys(): rsaKey;
declare function rsaEncrypt(keyFilePath?: string, plainText?: string): String;
declare function rsaDecrypt(keyFilePath?: string, encryptedText?: string): String;

declare class License {
    private static task;
    private static licenseKey;
    private static baseUrl;
    private static secretId;
    private static device;
    private static org_Id;
    private static dateTime;
    private static timeZone;
    private static doExchange;
    private static getLicense;
    private static checkValidKey;
    private static checkPreinit;
    private static checkExchangeFiles;
    private static removeKeyFiles;
    private static readFileAndParse;
    private static extractLicense;
    /** External access functions */
    static init(base_Url: string | undefined, license_Key: string | undefined, clientData: clientInputData): Promise<responseData>;
    static getConfig(org_Id?: String): Promise<responseData>;
    static update(license_Key?: string, org_Id?: string, assignType?: string): Promise<responseData>;
    static sync(license_Key?: string, org_Id?: string): Promise<responseData>;
    private static calculateDays;
    static getFeatures(org_Id?: string, featureName?: string | string[] | any): Promise<responseData>;
    static getLicenseDetails(org_Id?: string): Promise<responseData>;
    static delete: (org_Id?: String) => Promise<responseData>;
}

export { DeviceDetails, License, aesDecrypt, aesEncrypt, aesGenerateKeys, clientInputData, responseData, rsaDecrypt, rsaEncrypt, rsaGenerateKeys, rsaKey };
