
// interface objectProps {
//   [key: string]: string | number | boolean | undefined | null | object | unknown;
// }


export function generateKey(length: number | null){
    console.log(`rsa fn generateKey ${length}`);
}

export function encrypt(orgId: object | null | undefined) {
    console.log(`rsa fn encrypt ${orgId}`);
}


export function decrypt(orgId: object | null | undefined) {
    console.log(`rsa fn decrypt ${orgId}`);
}

  // Default export with a specific name
  const aesBB = {
    generateKey,
    encrypt,
    decrypt
  };
  export default aesBB;

  module.exports = aesBB;