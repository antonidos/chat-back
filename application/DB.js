const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

class DB {
    constructor (dbFilePath="") {
        (async () => {
            this.db = await open({
                filename: dbFilePath,
                driver: sqlite3.Database
            })
        })()
    }

    /**
     * Получить запись таблицы users по колонке username.
     * 
     * @param {string} email 
     * @returns {Promise} 
     */
    getUserByUsername(userName) {
        const user = this.db.get(`SELECT * FROM users WHERE username=${userName}`);
        return user;
    }

    /**
     * Получить запись из таблицы users по token.
     * 
     * @param {string} token 
     * @returns {Promise}
     */
    getUserByToken(token) {
        const user = this.db.get('SELECT * FROM users WHERE token=?', [token]);
        return user;
    }

    /**
     * Добавлить запись в таблицу users.
     * 
     * @param {string} userName 
     * @param {string} password 
     * @param {string} token 
     * @returns {Promise}
     */
    addNewUser(userName, password, token) {
        const result = this.db.run(
            'INSERT INTO users (username, password, token) VALUES (?, ?, ?)',
            [userName, password, token]
        );
        return result;
    }
}