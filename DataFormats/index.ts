export type rsaKey = {privateKey:string, publicKey:string};

export type clientInputData = {
  email: String | null | undefined;
  phone: String | null | undefined;
  userName: String | null | undefined;
  orgId: String | null | undefined;
  orgName: String | null | undefined;
  serverNameAlias: String | null | undefined;
};

export type responseData = {
  code: Number,
  data: Object | null,
  result: String | null | undefined
}