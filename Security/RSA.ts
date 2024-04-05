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
    console.error("RSA Keygen exception: ", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
  }
}

export function rsaEncrypt(keyFilePath: string = "", plainText: string = ""): String {
  try {
    let PUBKEY = fs.readFileSync(keyFilePath, "utf8");
    let _input = plainText;
    if (typeof plainText == "object") {
      _input = JSON.stringify(plainText);
    }
    const forgePublicKey = forge.pki.publicKeyFromPem(PUBKEY);
    const _encryptedData = forgePublicKey.encrypt(_input);
    const encmsg = forge.util.encode64(_encryptedData);

    return encmsg;
  } catch (error) {
    console.error("RSA Keygen exception: ", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
  }
}

export function rsaDecrypt(keyFilePath: string = "", encryptedText: string = ""): String {
  try {
    let PRIVKEY = fs.readFileSync(keyFilePath, "utf8");
    let plainText = "";

    const forgePrivateKey = forge.pki.privateKeyFromPem(PRIVKEY);
    const base64Decode_to_byte = forge.util.decode64(encryptedText);
    plainText = forgePrivateKey.decrypt(base64Decode_to_byte);

    if (plainText.trim() != "" && plainText.includes("{") && typeof plainText == "string") {
      plainText = JSON.parse(plainText);
    }

    return plainText;
  } catch (error) {
    console.error("RSA Keygen exception: ", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred> RSA Keygen.");
  }
}
