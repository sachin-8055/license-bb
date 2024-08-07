export type rsaKey = {privateKey:string, publicKey:string};

export type clientInputData = {
  email: String | null | undefined;
  phone?: String | null | undefined;
  userName: String | null | undefined;
  orgId: String | null | undefined;
  orgName?: String | null | undefined;  
  assignType?:String | null | undefined | 'default';
  serverNameAlias?: String | null | undefined | 'UAT' | 'SIT' | 'LIVE' | 'TEST';
};

export type responseData = {
  code: Number| number | 1 | -1 | -2,
  data: Object | any | null,
  result: String | null | undefined,
  meta?: Object | any | null
}
export type DeviceDetails = {
  deviceId: string | undefined;
  osType: string | undefined;
  deviceType?: 'Desktop' | 'Mobile'| string | undefined;
  browser?: string | undefined | '';
}
