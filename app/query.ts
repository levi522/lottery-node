import mysql from "mysql2";
import dbConfig from "../config/db";

const pool = mysql.createPool(dbConfig);

const query = (sql: string) => {
    return new Promise<any>((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                    connection.release(); // 释放该链接，把该链接放回池里供其他人使用
                });
            }
        });
    });
};

export default query;
