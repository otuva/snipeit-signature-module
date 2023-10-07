# TODO: THIS WILL BE UPDATED

# snipeit-zimmet-modulu
Snipeit automation to give form for in-person asset-acceptance by asset tag or username

Api that server consumes expects `SNIPEIT_TOKEN` and `SNIPEIT_HOST` env variables set.

If you want to serve from path for apache proxy pass set env variable `SERVE_FROM_PATH` with leading slash like `/zimmet`

```bash
npm i
cd src/py
python3 -m venv venv
venv/bin/pip install -r requirements.txt
```
