
import { licenseBB } from "../dist/index"

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)

  licenseBB.init({
    base_Url: "",
    license_Key: "",
    clientData: {
      email: "",
      phone: "",
      userName: "",
      orgId: "",
      orgName: "",
      serverNameAlias: "",
      assignTyp: ""
    }
  });

}
