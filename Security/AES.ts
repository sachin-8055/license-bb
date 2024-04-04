import crypto from "crypto";

const defaultKeyLength: number = 32;

export function aesGenerateKeys(): string {
  try {
    const newAesKey: string = crypto.randomBytes(defaultKeyLength).toString("base64");

    return newAesKey || "";

  } catch (error: any) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}

export function aesEncrypt(secretKey:string="", plainText:string=""): String {
  return "";
}

export function aesDecrypt(secretKey:string="", encryptedText:string=""): String {
  return "";
}
