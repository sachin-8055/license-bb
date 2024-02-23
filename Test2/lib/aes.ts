import { objectProps } from "./types";


export function generateKey(length: number | null){
    console.log(`rsa fn generateKey ${length}`);
}

export function encrypt(orgId: objectProps | null | undefined) {
    console.log(`rsa fn encrypt ${orgId}`);
}


export function decrypt(orgId: objectProps | null | undefined) {
    console.log(`rsa fn decrypt ${orgId}`);
}

  // Default export with a specific name
  const aesBB = {
    generateKey,
    encrypt,
    decrypt
  };
  export default aesBB;