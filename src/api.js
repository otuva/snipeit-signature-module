// imports
const axios = require('axios');
const execSync = require("child_process").execSync;

// settings 
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// variables
const API_TOKEN = "<API_TOKEN>"
const HOST = "snipeit.example.com"

// zimmette hata var mi kontrol etmek icin. hata yoksa true varsa string hata mesaji dondurur
const checkValidAsset = (asset_json) => {
    if (asset_json.last_checkout === null) {
        return `Zimmet formundan once demirbas checkout edilmeli 'TAG: ${asset_json.asset_tag}'`;
    } else if (asset_json.manufacturer === null) {
        return `Demirbasin ureticisi bos olmamali 'TAG: ${asset_json.asset_tag}'`;
    } else if (asset_json.serial === "") {
        return `Demirbasin seri numarasi girilmemis. Demirbasin seri numarasi yoksa seri numarasini '-' olarak guncelleyin. 'TAG: ${asset_json.asset_tag}'`;
    } else if (asset_json.status === "error" && asset_json.messages === "Asset does not exist.") {
        return "Boyle bir tagi olan demirbas yok kontrol edin";
    } else if (asset_json.status === "error") {
        return `Bisiler patladi hata oldu: ${asset_json.messages}`
    } else {
        return true;
    }
}

// tag ile demirbas getir
const getByTag = (asset_tag) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${HOST}/api/v1/hardware/bytag/${asset_tag}?deleted=false`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${API_TOKEN}`
            }
        };

        axios
            .request(options)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });

    });
}

// kullanici adiyla id dondur
const getIdFromUsername = (username) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${HOST}/api/v1/users?limit=1&offset=0&sort=created_at&order=desc&username=${username}&deleted=false&all=false`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${API_TOKEN}`
            }
        };

        axios
            .request(options)
            .then((response) => {
                if (response.data.rows === undefined || response.data.rows.length === 0) {
                    resolve(null);
                } else {
                    const userId = response.data.rows[0].id;
                    resolve(userId);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// id ile kullanici ustundeki demirbaslari getir
const getAssetsFromId = (user_id) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${HOST}/api/v1/users/${user_id}/assets`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${API_TOKEN}`
            }
        };

        axios
            .request(options)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// jsonu docx olusturmak icin pitona ver
const giveJsonToPython = (json) => {
    // console.log(`${__dirname}/py/venv/bin/python ${__dirname}/py/handle_json.py '${JSON.stringify(json)}'`)
    // const pythonProcess = execSync(`${__dirname}/py/venv/bin/python`, [`${__dirname}/py/handle_json.py`, `'${JSON.stringify(json)}'`]);
    execSync(`${__dirname}/py/venv/bin/python ${__dirname}/py/handle_json.py '${JSON.stringify(json)}'`);
}

module.exports.checkValidAsset = checkValidAsset;
module.exports.getByTag = getByTag;
module.exports.getIdFromUsername = getIdFromUsername;
module.exports.getAssetsFromId = getAssetsFromId;
module.exports.giveJsonToPython = giveJsonToPython;
