const express = require("express");
const {licenseBB} = require("../Test3/test3/dist/index");

const app = express();

const initCall = async () =>{
    console.log("initCall...")

  const response = await licenseBB?.init({
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
  
  console.log("initCall..response",response);

}

initCall();