const api = require('./src/api');

const express = require('express')
const app = express()

const DOSYA_ISMI = `${__dirname}/output/zimmet.docx`

// todo bunu kaldir
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/assets/usage.html`);
})

app.get('/submit', (req, res) => {
    if (req.query.formtype === 'zimmet') {
        res.redirect(`/${req.query.fname}`)
    } else if (req.query.formtype === 'iade') {
        res.redirect(`/iade/${req.query.fname}`)
    }
})

app.get('/:usernameOrTag', (req, res) => {
    const re = /^\d{5}$/g;

    // tag 
    if (re.test(req.params.usernameOrTag)) {
        api.getAssetByTag(req.params.usernameOrTag).then(async hardware => {
            const hardwareResult = api.checkValidAsset(hardware);
            // ok
            if (typeof hardwareResult === 'boolean' && hardwareResult) {
                api.giveJsonToPython(hardware);
                // res.send(hardware);
                res.download(DOSYA_ISMI);
            } else if (typeof hardwareResult === 'string') { //patladi hatayi goster
                res.send(hardwareResult);
            }
        });
    } else { // user
        let valid = true;
        api.getIdByUsername(req.params.usernameOrTag).then(async user_id => {
            if (user_id) {
                api.getAssetsByUserId(user_id).then(assets => {
                    if (assets.total > 0) {
                        assets.rows.forEach(hardware => {
                            const hardwareResult = api.checkValidAsset(hardware);
                            if (typeof hardwareResult === 'string') { //patladi hatayi goster
                                valid = false;
                                res.send(hardwareResult);
                            }
                        });
                    } else {
                        valid = false;
                        res.send('kullanicinin ustunde demirbas yok')
                    }
                    if (valid) {
                        api.giveJsonToPython(assets);
                        // res.send(assets)
                        res.download(DOSYA_ISMI);
                    }
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
                res.download(DOSYA_ISMI);
            });
        } else {
            res.send("kullanici adi hatali")
        }
    });

});

if ('SNIPEIT_TOKEN' in process.env && 'SNIPEIT_HOST' in process.env) {
    app.listen(3000)
} else {
    console.error(`set SNIPEIT_TOKEN and SNIPEIT_HOST variables in env`)
}
