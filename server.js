const api = require('./src/api');

const express = require('express')
const app = express()
app.engine('html', require('ejs').renderFile);

const FILE_NAME = `${__dirname}/output/zimmet.docx`
const SERVE_FROM_PATH = process.env.SERVE_FROM_PATH ? process.env.SERVE_FROM_PATH : '' // if serving from root leave empty, otherwise supply path like "/zimmet"

// todo bunu kaldir
app.get('/', (req, res) => {
    res.render(`${__dirname}/views/usage.html`, {SERVE_FROM_PATH:SERVE_FROM_PATH});
})

app.get('/submit', (req, res) => {
    if (req.query.formtype === 'zimmet') {
        res.redirect(`${SERVE_FROM_PATH}/${req.query.fname}`)
    } else if (req.query.formtype === 'iade') {
        res.redirect(`${SERVE_FROM_PATH}/iade/${req.query.fname}`)
    }
})

app.get('/:usernameOrTag', (req, res) => {
    const admins = []

    const re = /^\d{5}$/g;

    // tag 
    if (re.test(req.params.usernameOrTag)) {
        api.getAssetByTag(req.params.usernameOrTag).then(async hardware => {
            const hardwareResult = api.checkValidAsset(hardware);
            // ok
            if (typeof hardwareResult === 'boolean' && hardwareResult) {
                // res.send({
                //     asset: hardware,
                //     target: hardware.assigned_to.name
                // });
                api.getCheckoutByItemId('asset', hardware.id).then(assetCheckout => {
                    api.giveJsonToPython({
                        asset: hardware,
                        admin: assetCheckout.rows[0].admin.name,
                        target: hardware.assigned_to.name
                    });
                    res.download(FILE_NAME);
                })
            } else if (typeof hardwareResult === 'string') { //patladi hatayi goster
                res.send(hardwareResult);
            }
        });
    } else { // user
        let valid = true;
        api.getIdByUsername(req.params.usernameOrTag).then(async userId => {
            if (userId) {
                api.getAssetsByUserId(userId).then(assets => {
                    api.getUserDetails(userId).then(async user => {
                        if (assets.total > 0) {

                            for await (const hardware of assets.rows) {
                                const hardwareResult = api.checkValidAsset(hardware);
                                await api.getCheckoutByItemId('asset', hardware.id).then(assetCheckout =>
                                    admins.push(assetCheckout.rows[0].admin.name)
                                )
                                if (typeof hardwareResult === 'string') { //patladi hatayi goster
                                    valid = false;
                                    res.send(hardwareResult);
                                }
                            }
                        } else {
                            valid = false;
                            res.send('kullanicinin ustunde demirbas yok')
                        }
                        if (valid) {
                            // res.send({
                            //     totalAssets: assets.total,
                            //     rows: assets.rows,
                            //     admin: admins,
                            //     target: user.name
                            // })
                            api.giveJsonToPython({
                                totalAssets: assets.total,
                                rows: assets.rows,
                                admin: admins,
                                target: user.name
                            });
                            res.download(FILE_NAME);
                        }
                    })
                });
            } else {
                res.send("kullanici adi hatali")
            }
        });
    }
});

app.get('/iade/:username', (req, res) => {
    let valid = true;
    api.getIdByUsername(req.params.username).then(async userId => {
        if (userId) {
            api.getDetailedCheckinItemsByUsername(userId).then(async checkins => {
                api.giveJsonToPython(checkins);
                res.download(FILE_NAME);
            }).catch(reason => {
                res.send(reason)
            }
            );
        } else {
            res.send("kullanici adi hatali")
        }
    });

});

if ('SNIPEIT_TOKEN' in process.env && 'SNIPEIT_HOST' in process.env) {
    app.listen(3000)
    console.log('http://localhost:3000')
} else {
    console.error(`set SNIPEIT_TOKEN and SNIPEIT_HOST variables in env`)
}
