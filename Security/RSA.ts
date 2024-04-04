import forge from "node-forge";
import fs from "fs";
import { rsaKey } from "../DataFormats";

const forgeKeyCreationOptions: any = {
  bits: 2048,
  // e: 0x10001,
};

export function rsaGenerateKeys(): rsaKey {
  try {
    const keys = forge.pki.rsa.generateKeyPair(forgeKeyCreationOptions);
    const privateKey = forge.pki.privateKeyToPem(keys.privateKey);
    const publicKey = forge.pki.publicKeyToPem(keys.publicKey);

    return { privateKey, publicKey };
  } catch (error) {    
    console.error("RSA Keygen exception: ",error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
    
  }
}

export function rsaEncrypt(keyFilePath:string="", plainText:string=""): String {
  return "";
}

export function rsaDecrypt(keyFilePath:string="", encryptedText:string=""): String {
  return "";
}
