import express from "express";
import mysql from "mysql";
import cors from "cors";

import { Database, registerGlobalDatabase } from "./db.js";
import { mysqlAsyncConnect } from "./session.js";
import { env, envOptional } from "./common.js";
import { cfg, cfgRelPath, loadBackendConfig } from "./config.js";

import { useUserEndpoints } from "./endpoint/user.js";
import { usePostsEndpoints } from "./endpoint/posts.js";
import { useAuthEndpoints } from "./endpoint/auth.js";
import { useMediaEndpoints } from "./endpoint/media.js";
import { useTimelineEndpoints } from "./endpoint/timeline.js";

await loadBackendConfig();

const app = express();

app.use(express.json());
app.use(cors({
    origin: cfg().frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use("/static", express.static(cfgRelPath(cfg().staticContentPath)));
app.use("/user-content", express.static(cfgRelPath(cfg().userContentPath)));

const sql = mysql.createConnection({
    host: env("DB_HOST"),
    user: env("DB_USER"),
    password: envOptional("DB_PASSWORD"),
    database: env("DB_DATABASE"),
    charset: "utf8mb4"
});

await mysqlAsyncConnect(sql);
registerGlobalDatabase(new Database(sql));
console.log("( ok ) database connection established");

useUserEndpoints(app);
usePostsEndpoints(app);
useAuthEndpoints(app);
useMediaEndpoints(app);
useTimelineEndpoints(app);
console.log("( ok ) all endpoints registered");

app.listen(cfg().port, () => {
    console.log(`( ok ) backend listening on port ${cfg().port}`);
});
