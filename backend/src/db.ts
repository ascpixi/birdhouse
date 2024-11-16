import mysql from "mysql";

/**
 * Represents a value that is not yet fetched from the database.
 */
export type Deferred<T> = () => T;

function promisifyVoid<T>(target: (callback: (err: T) => void) => void) {
    return new Promise<void>((resolve, reject) => {
        target(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export class Database {
    private sql: mysql.Connection;

    constructor(sql: mysql.Connection) {
        this.sql = sql;
    }

    async beginTransaction() {
        return promisifyVoid(cb => this.sql.beginTransaction(cb));
    }

    async commit() {
        return promisifyVoid(cb => this.sql.commit(cb));
    }

    async rollback() {
        return promisifyVoid(cb => this.sql.rollback(cb));
    }

    async asTransaction(block: () => void | Promise<void>) {
        await this.beginTransaction();

        try {
            await block();
        } catch (err) {
            console.error("(err!) error encountered, rolling back transaction");
            await this.rollback();
            throw err;
        }

        await this.commit();
    }

    async query(query: string, values: any) {
        return new Promise<any>((resolve, reject) => {
            this.sql.query(query, values, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    async queryOne(query: string, values: any): Promise<Record<string, any> | null> {
        const results = await this.query(query, values);
        if (!Array.isArray(results) || results.length != 1 || typeof results[0] !== "object")
            return null;

        return results[0];
    }
}

let _globalDb: Database | null = null;

/**
 * Registers a global database connection, which can be retrieved via the `db()` function.
 */
export function registerGlobalDatabase(db: Database) {
    if (db == null)
        throw new Error("Attempted to register a null global database.");

    _globalDb = db;
}

/**
 * Accesses the global database instance.
 */
export function db() {
    if (_globalDb == null)
        throw new Error("Cannot access the database before 'registerGlobalDatabase' is called.");

    return _globalDb;
}
