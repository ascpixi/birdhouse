# Birdhouse Setup
In order to create your own, personalized instance of Birdhouse, you'll need to run two services - the **backend** and the **frontend**. Both are contained in different directories of this repository.

::: warning
Birdhouse is still in early development and is not yet ready for production. It is recommended to only run Birdhouse on local networks.
:::

You may find a ready setup in the `demo` directory. In order to run it, simply run both `run-frontend.bat` and `run-backend.bat`. These scripts are unfortunately only available for Windows (for now), but they should be easy to port to Unix-like systems.

## Setting up the backend
Before starting the backend, make sure you have a MySQL database ready. With your MySQL database, import the `/backend/db/schema.sql` file. If anything goes wrong, you may use the `/backend/db/destroy.sql` script to drop all Birdhouse data and tables.

First, you'll need to create a backend configuration file. As a template, you may use the following JSON document:

```json
{
    "port": 3000,
    "frontendUrl": "http://localhost:5173",
    "backendUrl": "http://localhost:3000",
    "userContentPath": "user-content",
    "staticContentPath": "static",
    "staticContent": {
        "defaultAvatar": "default-avatar.png",
        "defaultBanner": "default-banner.jpg"
    }
}
```

All paths are relative to the directory the configuration file is placed in.

The configuration parameters are as follows:
- `port`: the port to run the backend HTTP server on.
- `frontendUrl`: the URL of the frontend. Used mostly for CORS.
- `backendUrl`: the URL the backend will be available to the Internet from. If you're hosting Birdhouse on a LAN or only exposing it as `localhost`, you may provide either the IP or `localhost` here.
- `userContentPath`: the path to the folder to place user-uploaded content in.
- `staticContentPath`: the path of the static content folder, where pre-defined content is placed in.
- `staticContent`: defines paths to static resources, relative to `staticContentPath`.
    - `defaultAvatar`: the image to use as the default user avatar (profile picture).
    - `defaultBanner`: the image to use as the default user banner (shown on the profile page of users).

The following environment variables are required:
- `BIRDHOUSE_CFG` - the backend configuration file to use. Should point to a JSON document. If not absolute, the path will be relative to the current working directory.
- `DB_HOST` - the hostname of the MySQL database to connect to.
- `DB_USER` - the username of the database to login as.
- `DB_PASSWORD` - the password of the database to login as. Optional. If not present, the target database user will be assumed to have no set password.
- `DB_DATABASE` - the name of the database in the database server to use.

After setting these variables, first, run `npm install` in the `/backend` directory. Afterwards, start the server with `npm run serve`.


## Setting up the frontend
For the frontend, you only need the `VITE_BIRDHOUSE_API_URL` environment variable to be set to the URL of the backend API, which should be reachable from the Internet (or the network, if hosted locally). After the variable is set, run `npm install`, and then `npm run dev` to run the frontend.

::: warning
Currently, the `npm run dev` command is temporary. It will run the frontend in development mode - please be aware that Birdhouse is not yet ready for production.
:::