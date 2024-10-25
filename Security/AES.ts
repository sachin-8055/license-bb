import crypto from "crypto";

const defaultKeyLength: number = 32;
const algorithum = 'aes-256-ecb';
/* const algorithum = 'aes-256-gcm'; */
export function aesGenerateKeys(): string {
  try {
    const newAesKey: string = crypto.randomBytes(defaultKeyLength).toString("base64");
    return newAesKey || "";
  } catch (error: any) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}

export function aesEncrypt(secretKey: string = "", plainText: string = ""): String {
  try {
    let encmsg = "";
    if (typeof plainText == "object") {
      plainText = JSON.stringify(plainText);
    }

    let aesKey = Buffer.from(secretKey, "base64");

    const cipher = crypto.createCipheriv(algorithum, aesKey, null); // Note the use of null for IV
    encmsg = cipher.update(plainText, "utf8", "base64");
    encmsg += cipher.final("base64");

    return encmsg;
  } catch (error: any) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}

export function aesDecrypt(secretKey: string = "", encryptedText: string = ""): String {
  try {
    
    if(!secretKey || secretKey === ""){
      return "Invalid / blank secret key received for decryption";
    }
    
    if(!encryptedText || encryptedText === ""){
      return "Invalid / blank encrypted data received for decryption";
    }


    let decryptedData = null;

    let aesKey = Buffer.from(secretKey, "base64");
    // const decipher = crypto.createDecipheriv("aes-256-ecb", aesKey, null); // Note the use of null for IV
    const decipher = crypto.createDecipheriv(algorithum, aesKey, null); // Note the use of null for IV
    decryptedData = decipher.update(encryptedText, "base64", "utf8");
    decryptedData += decipher.final("utf8");

    let plainText = decryptedData || "";

    if (plainText.trim() !== "" && plainText.includes("{") && typeof plainText === "string") {
      plainText = JSON.parse(plainText);
    }

    return plainText;
  } catch (error: any) {
    console.error("AES Keygen Exception :", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred AES Keygen.");
  }
}
