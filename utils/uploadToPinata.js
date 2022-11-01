const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecrect = process.env.PINATA_API_SECRET || "";
const pinataApiJWT = process.env.PINATA_API_JWT || "";

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);
    let responses = [];
    console.log("\n----------------------\n")
    console.log("Uploading to Pinata...\n")

    for (fileIndex in files) {
        let data = new FormData();
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
        data.append('file', readableStreamForFile)
        let config = {
            method: 'post',
            url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
            headers: { 
                'Authorization': `Bearer ${pinataApiJWT}`,
                ...data.getHeaders()
            },
            data : data
        }
        try {
            const response = await axios(config);
            responses.push(response.data);
        } catch (error) {
            console.log(error);
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    let data = JSON.stringify(metadata);
    let config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pinataApiJWT}`
        },
        data : data
    }
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.log(error);
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }