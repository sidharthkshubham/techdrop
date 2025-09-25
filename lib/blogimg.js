const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const { DefaultAzureCredential } = require("@azure/identity");

dotenv.config();  

async function saveResponse(responseData, filenamePrefix) {
  const arr = responseData["data"];
  const b64 = arr[0]["b64_json"];
  const filename = `${filenamePrefix}.png`;
  fs.writeFileSync(filename, Buffer.from(b64, "base64"));
  console.log("Image saved to: " + filename);
}

async function main() {
  // You will need to set these environment variables or edit the following values.
  const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
  const deployment = process.env["DEPLOYMENT_NAME"];
  const apiVersion = process.env["OPENAI_API_VERSION"];
  
  const generationsPath = `openai/deployments/${deployment}/images/generations`;
  const params = `?api-version=${apiVersion}`;
  const generationsUrl = `${endpoint}${generationsPath}${params}`;
  
  // Initialize the DefaultAzureCredential to be used for Entra ID authentication.
  // If you receive a `PermissionDenied` error, be sure that you run `az login` in your terminal
  // and that you have the correct permissions to access the resource.
  // Learn more about necessary permissions:  https://aka.ms/azure-openai-roles
  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken("https://cognitiveservices.azure.com/.default");

  const generationBody = {
    "prompt": "xyz image boy",
    "n": 1,
    "size": "1024x1024",
    "output_format": "png"
  };
  const generationResponse = await axios.post(generationsUrl, generationBody, { headers : {
    'Authorization': 'Bearer ' + tokenResponse.token,
    'Content-Type': 'application/json'
  }});
  await saveResponse(generationResponse.data, "generated_image");
  
}

main().catch((err) => {  
  console.error("This sample encountered an error:", err);  
});