export interface objectProps {
  [key: string]: string | number | boolean | undefined | null | object | unknown;
}

export interface clientDataProps {
  email: string;
  phone: string;
  userName: string;
  orgId: string;
  orgName: string;
  serverNameAlias: string;
  assignTyp: string;
}

export interface initializeProps {
  base_Url: string;
  license_Key: string;
  clientData: clientDataProps;
}
