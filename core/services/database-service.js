const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'sqlmaxdb',
    password: 'root',
});

module.exports = class DatabaseService {
    getLastId() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT MAX(id) FROM messages', (err, data) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(data);
                }
            });
        });
    }
    getAllMessages(currentGroup) {
        return new Promise(async (resolve, reject) => {
            connection.query(
                `SELECT * FROM messages WHERE groupMessage='${currentGroup}'`,
                (err, data) => {
                    if (err) {
                        reject(err.message);
                    }
                    if (data == {}) {
                        resolve([]);
                    }
                    resolve(data);
                }
            );
        });
    }
    addMessageToDB(msg) {
        return new Promise(async (resolve, reject) => {
            const today = new Date();
            const time =
                today.getHours() +
                ':' +
                today.getMinutes() +
                ':' +
                today.getSeconds();
            const lastId = await this.getLastId();
            const newID = lastId[0]['MAX(id)'] + 1;
            connection.query(
                `INSERT INTO messages 
                (id, message, userName, time, userPicture, groupMessage) 
                VALUES (${newID}, '${msg.message}', '${msg.userName}', '${time}', '${msg.userPicture}', '${msg.groupMessage}')`,
                err => {
                    if (err) {
                        reject(err.message);
                    }
                    resolve(true);
                }
            );
        });
    }
    deleteMessage(id) {
        return new Promise(async (resolve, reject) => {
            connection.query(`DELETE FROM messages WHERE id=${id}`, err => {
                if (err) {
                    reject(err.message);
                }
                resolve(true);
            });
        });
    }
    getAllGroup() {
        return new Promise(async (resolve, reject) => {
            connection.query(`SELECT * FROM groupList`, (err, data) => {
                if (err) {
                    reject(err.message);
                }
                if (data == {}) {
                    resolve([]);
                }
                resolve(data);
            });
        });
    }
};
