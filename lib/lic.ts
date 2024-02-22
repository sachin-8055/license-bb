// var { machineId } = require("node-machine-id");
// const moment = require("moment-timezone");
import {publicIpv4 } from 'public-ip';
// import axios from 'axios';
import fs from 'fs';
// import { ensureDirSync } from 'fs-extra'

import { initializeProps, objectProps } from "./types";
import { initProps } from "./reqInputs";

// global properties for reuse
let global_base_folder = "bbLicenseUtils";
// let global_baseURL: string = "";
// let global_deviceId: string = "";
// let global_orgId: string = "default";
let global_ipAddress: string = "";
// let global_dateTime = new Date();
// let global_timeZone = moment.tz.guess();

// Function to fetch IP address from a third-party service using async/await
async function getIpAddress() {
  try {
   
    const response = await fetch("https://api64.ipify.org?format=json");
    const data:any = await response.json();
    global_ipAddress = data?.ip || "-";
    return data?.ip || "-";
  } catch (error) {
    console.error("Error fetching IP address:", error);
   
    global_ipAddress = await publicIpv4() || "-"
   
    return global_ipAddress || "-";
  }
}

/** Internal Un-Exported function's */

// function extract(orgId: string | null | undefined) {
//     console.log(`fn license ${orgId}`);
// }

/** External access Exported functions */

export async function license(orgId: string | null | undefined) {
    console.log(`fn license ${orgId}`);
}

export async function config(orgId: string | null | undefined) {
    console.log(`fn config ${orgId}`);
}

export async function init(props: initializeProps): Promise<objectProps> {
    console.log(`fn init ${await getIpAddress()} `);
    console.log(`global_ipAddress ${global_ipAddress} `);
    try {
      // ensureDirSync(global_base_folder)
        if (!fs.existsSync(global_base_folder)) {
          fs.mkdirSync(global_base_folder, { recursive: true });
        }
      } catch (error) {
        console.log(error);
      }

  try {
    // Check if data is defined, not null, and an object
    if (
      typeof props.base_Url === "undefined" ||
      props.base_Url == null ||
      typeof props.license_Key === "undefined" ||
      props.license_Key == null ||
      typeof props.clientData === "undefined" ||
      props.clientData == null ||
      typeof props.clientData != "object"
    ) {

      return {
        call: "init",
        code: -1,
        result: "Invalid Props",
        expected:initProps
      };

    }

    return {
      call: "init",
      code: 1,
      result: "Success",
    };

  } catch (error: any) {

    return {
      call: "init",
      code: -99,
      result: `Exception: ${error?.message || ""}`,
    };

  }
}

// export async function update(props: initializeProps | null | undefined) {}

// export async function feature(orgId: string, featureName: string | null | undefined) {}

// Default export with a specific name
const licenseBB = {
  config,
  init,
//   update,
//   feature,
  license,
};
export * from "./types";
export default licenseBB;
