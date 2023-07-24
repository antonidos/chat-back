const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

class DB {
    constructor(dbFilePath = "") {
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
        const user = this.db.get('SELECT id, username, token, email, phone, age FROM users WHERE token=?', [token]);
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
    addNewUser(userName, password, token, email) {
        const result = this.db.run(
            'INSERT INTO users (username, email, password, token) VALUES (?, ?, ?, ?)',
            [userName, email, password, token]
        );
        this.setDefaultSettings(result.id)
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

    async getDialogsOfUser(token) {
        const result = await this.db.all(
            `SELECT * FROM
                (SELECT dialogs.id, dialogs.username1, dialogs.user1, dialogs.user2, users.username as username2 FROM 
                    (SELECT dialogs.id, dialogs.user1, dialogs.user2, users.username as username1, dialogs.user2 FROM dialogs
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

        const dialogs = result
            ? result.map((dialog) => ({
                id: dialog.id,
                username1: dialog.username1,
                username2: dialog.username2,
            }))
            : [];
        try {
            const userId = (await this.getUserByToken(token)).id;
            const idsCompanions = result ? result.map(dialog => dialog.user1 === userId ? dialog.user2 : dialog.user1) : [];
            return [dialogs, idsCompanions];
        } catch {
            return false
        }
        
    }

    addUserChat(token, username) {
        this.db.run(
            `INSERT INTO dialogs (user1, user2) VALUES (
                    (SELECT id FROM users WHERE token=?)
                    , (SELECT id FROM users WHERE username=?)
                )`,
            [token, username]
        )
        const result = this.db.get(
            `SELECT id FROM dialogs WHERE 
            (user1=(SELECT id FROM users WHERE token=?) 
            AND user2=(SELECT id FROM users WHERE username=?))
            OR (user2=(SELECT id FROM users WHERE token=?) 
            AND user1=(SELECT id FROM users WHERE username=?))`
            , [token, username, token, username]
        )
        return result
    }

    deleteUserChat(token, username) {
        const result = this.db.run(
            `DELETE FROM dialogs WHERE 
                (user1 = (SELECT id FROM users WHERE token=?) 
                AND user2 = (SELECT id FROM users WHERE username=?))
                OR (user2 = (SELECT id FROM users WHERE token=?) 
                AND user1 = (SELECT id FROM users WHERE username=?))
            `,
            [token, username, token, username]
        )
    }

    addMessage(token, chatId, content, timestamp) {
        const result = this.db.run(
            `INSERT into messages (dialog_id, sender, content, timestamp) VALUES (
                ?, (SELECT username from users WHERE token=?), ?, ?
            )`, [chatId, token, content, timestamp]
        )
        return result
    }

    async updateLastMessage(dialog_id, token, content, timestamp) {
        const result = await this.db.get(`SELECT * FROM last_messages WHERE dialog_id=?`, [dialog_id]);
        // console.log(result)
        if (result) {
            this.db.run(`UPDATE last_messages set sender=(SELECT username from users 
                WHERE token=?), content=?, timestamp=? WHERE dialog_id=?`
                , [token, content, timestamp, dialog_id]
            )
            return true
        } else {
            this.db.run(`INSERT INTO last_messages (dialog_id, sender, content, timestamp) 
                VALUES (?, (SELECT username from users WHERE token=?),?,?)`
                , [dialog_id, token, content, timestamp]
            )
            return true
        }

    }

    getLastMessages(ids) {
        const result = this.db.all(`
            SELECT * FROM last_messages WHERE dialog_id IN (${ids.join(',')}) 
        `)
        return result;
    }

    getAvatarsOfCompanions(ids) {
        const result = this.db.all(`
            SELECT src, username FROM users_avatars 
            INNER JOIN users on users_avatars.user_id = users.id
            WHERE user_id IN (${ids.join(',')}) 
        `)
        return result;
    }

    getDialog(chatId) {
        const result = this.db.all(
            `SELECT sender, content, timestamp FROM messages WHERE dialog_id=?`
            , [chatId]
        )
        return result;
    }

    setDefaultSettings(user_id) {
        this.db.run(`
            INSERT INTO user_settings (user_id, theme, notifications) VALUES (?, 'LIGHT', false)
        `, [user_id])
    }

    changeUserSettings(user_id, theme, notifications) {
        const result = this.db.run(`
            UPDATE user_settings set theme =?, notifications=? WHERE user_id=?
        `, [theme, notifications, user_id])
        return result;
    }

    setTheme(user_id, theme) {
        const result = this.db.run(`
            UPDATE user_settings set theme=? WHERE user_id=?
        `, [theme, user_id])
        return result;
    }

    getUserSettings(user_id) {
        const result = this.db.get(`SELECT * FROM user_settings WHERE user_id=?`, [user_id]);
        return result;
    }

    async saveAvatar(userId, src, filename, guid) {
        const isExist = await this.getAvatar(userId);
        if (isExist) {
            const result = this.db.run(`
            UPDATE 
                users_avatars
            SET
                src=?, file_name=?, guid=?
            WHERE
                user_id=?
        `, [src, filename, guid, userId]);
            return result;
        } else {
            const result = this.db.run(`
            INSERT INTO
                users_avatars
                (user_id, src, file_name, guid)
            VALUES
                (?, ?, ?, ?)
        `, [userId, src, filename, guid]);
            return result;
        }
    }

    getTaskFileByGUID(guid) {
        const result = this.db.get(`
            SELECT
                *
            FROM 
                users_avatars
            WHERE
            guid = ?
        `, [guid]);
        return result;
    }

    getAvatar(id) {
        const result = this.db.get(`
            SELECT
                *
            FROM 
                users_avatars
            WHERE
            user_id = ?
        `, [id]);
        return result;
    }

    removeAvatar(userId) {
        const result = this.db.run(`
            DELETE FROM 
                users_avatars 
            WHERE 
                user_id = ?
        `, [userId]);
        return result;
    }
}

module.exports = DB;