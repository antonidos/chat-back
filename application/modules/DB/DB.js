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
        const user = this.db.get(`SELECT * FROM users WHERE username=?`, [userName]);
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

    /**
     * Обновить колонку token в таблице users.
     * 
     * @param {number} id 
     * @param {id} token 
     * @returns {Promise}
     */
    updateUserToken(id, token) {
        const result = this.db.run(
            'UPDATE users SET token=? WHERE id=?',
            [token, id]
        );
        return result;
    }

    updateUserData(age, email, phone, token) {
        const result = this.db.run(
            'UPDATE users SET age=?, email=?, phone=? WHERE token=?',
            [age, email, phone, token]
        );
        return result;
    }

    searchUsers(substr) {
        const result = this.db.all(
            'SELECT username, id FROM users WHERE instr(LOWER(username), ?) > 0',
            [substr]
        )
        return result
    }

    getDialogsOfUser(token) {
        // const result = this.db.all(
        //     `SELECT id FROM dialogs WHERE user1 = (
        //         SELECT id FROM users WHERE token=?
        //     ) OR user2 = (
        //         SELECT id FROM users WHERE token=?
        //     )`,
        //     [token, token]
        // )
        const result = this.db.all(
            `SELECT * FROM
                (SELECT dialogs.id, dialogs.username1, users.username as username2 FROM 
                    (SELECT dialogs.id, users.username as username1, dialogs.user2 FROM dialogs
                    INNER JOIN users 
                    ON dialogs.user1 = users.id) as dialogs
                INNER JOIN users 
                ON dialogs.user2 = users.id)
            WHERE id IN (SELECT id FROM dialogs WHERE user1 = (
                SELECT id FROM users WHERE token=?
            ) OR user2 = (
                SELECT id FROM users WHERE token=?
            ))`,
            [token, token]
        )
        return result;
    }
}

module.exports = DB;