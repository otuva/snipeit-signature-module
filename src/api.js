// imports
const axios = require('axios');
const execSync = require("child_process").execSync;

// settings 
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// variables
const SNIPEIT_TOKEN = process.env.SNIPEIT_TOKEN
const SNIPEIT_HOST = process.env.SNIPEIT_HOST

// check if asset is valid for form. if it isn't return string error message, else return true
const checkValidAsset = (assetJson) => {
    if (assetJson.last_checkout === null) {
        return `Zimmet formundan once demirbas checkout edilmeli 'TAG: ${assetJson.asset_tag}'`;
    } else if (assetJson.manufacturer === null) {
        return `Demirbasin ureticisi bos olmamali 'TAG: ${assetJson.asset_tag}'`;
    } else if (assetJson.serial === "") {
        return `Demirbasin seri numarasi girilmemis. Demirbasin seri numarasi yoksa seri numarasini '-' olarak guncelleyin. 'TAG: ${assetJson.asset_tag}'`;
    } else if (assetJson.status === "error" && assetJson.messages === "Asset does not exist.") {
        return "Boyle bir tagi olan demirbas yok kontrol edin";
    } else if (assetJson.status === "error") {
        return `Bisiler patladi hata oldu: ${assetJson.messages}`
    } else {
        return true;
    }
}

// get asset by tag
const getAssetByTag = (assetTag) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/hardware/bytag/${assetTag}?deleted=false`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

// get asset by id
const getAssetById = (assetId) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/hardware/${assetId}`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

const getAccessoryById = (accessoryId) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/accessories/${accessoryId}`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

// return id by username
const getIdByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/users?limit=1&offset=0&sort=created_at&order=desc&username=${username}&deleted=false&all=false`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

const getUserDetails = (userId) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/users/${userId}`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

// get all assets from id
const getAssetsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/users/${userId}/assets`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

// query user id to get checkin activities
const getCheckinsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/reports/activity?limit=10&offset=0&target_type=user&target_id=${userId}&action_type=checkin%20from&order=desc&sort=created_at`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

// const getCheckoutByUserId = (userId) => {
//     return new Promise((resolve, reject) => {
//         const options = {
//             method: 'GET',
//             url: `https://${SNIPEIT_HOST}/api/v1/reports/activity?limit=10&offset=0&action_type=checkout&target_type=user&target_id=${userId}&order=desc&sort=created_at`,
//             headers: {
//                 accept: 'application/json',
//                 Authorization: `Bearer ${SNIPEIT_TOKEN}`
//             }
//         };

//         axios
//             .request(options)
//             .then((response) => {
//                 resolve(response.data);
//             })
//             .catch((error) => {
//                 reject(error);
//             });
//     });
// }

const getCheckoutByItemId = (type, itemId) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: `https://${SNIPEIT_HOST}/api/v1/reports/activity?limit=10&offset=0&action_type=checkout&item_type=${type}&item_id=${itemId}}&order=desc&sort=created_at`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${SNIPEIT_TOKEN}`
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

const getDetailedCheckinItemsByUsername = (userId) => {
    const rows = []

    return new Promise((resolve, reject) => {
        getCheckinsByUserId(userId)
            .then(async (checkedInItems) => {
                if (checkedInItems.total > 0) {
                    for await (const singleCheckin of checkedInItems.rows) {
                        if (singleCheckin.item.type === "asset") {
                            await getAssetById(singleCheckin.item.id).then((checkedinAsset) => {
                                rows.push(checkedinAsset)
                            })
                        } else if (singleCheckin.item.type === "accessory") {
                            await getAccessoryById(singleCheckin.item.id).then((checkedinAccessory) => {
                                rows.push(checkedinAccessory)
                            })
                        }
                    }

                    resolve({
                        totalCheckins: rows.length,
                        rows,
                        admin: checkedInItems.rows[0].admin.name,
                        target: checkedInItems.rows[0].target.name
                    })
                } else {
                    reject('kullanici hic iade yapmamis')
                }

            })
            .catch((error) => {
                reject(error);
            });
    });

}

// give json to python for creating docx
const giveJsonToPython = (json) => {
    // console.log(`${__dirname}/py/venv/bin/python ${__dirname}/py/handle_json.py '${JSON.stringify(json)}'`)
    // const pythonProcess = execSync(`${__dirname}/py/venv/bin/python`, [`${__dirname}/py/handle_json.py`, `'${JSON.stringify(json)}'`]);
    execSync(`${__dirname}/py/venv/bin/python ${__dirname}/py/handle_json.py '${JSON.stringify(json)}'`);
}

module.exports.checkValidAsset = checkValidAsset;
module.exports.getAssetByTag = getAssetByTag;
module.exports.getIdByUsername = getIdByUsername;
module.exports.getAssetsByUserId = getAssetsByUserId;
module.exports.getCheckoutByItemId = getCheckoutByItemId;
module.exports.getUserDetails = getUserDetails;
module.exports.getCheckinsByUserId = getCheckinsByUserId;
module.exports.getDetailedCheckinItemsByUsername = getDetailedCheckinItemsByUsername;
module.exports.giveJsonToPython = giveJsonToPython;
module.exports.SNIPEIT_HOST = SNIPEIT_HOST;