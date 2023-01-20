const Answer = require('../../routes/Answer');
const commonModule = require('../commonModule');
const Module = require('../module/Module');

class UsersManager extends Module {
    constructor(params) {
        super(params);
    }

    // регистрация нового пользователя в базе.
    async registration(data) {
        const { userName, password } = data;
        
        if (!(userName && password)) {
            const text = "Имеются пустные данные";
            return Answer.getDataToTemplate(false, text);
        }
        
        const { token, passHash } = commonModule.hashUserData(userName, password);

        const user = await this.db.getUserByUsername(userName);
        if (user) {
            const text = "В базе данных уже имеется пользователь с данным Email";
            return Answer.getDataToTemplate(false, text);
        }

        const result = await this.db.addNewUser(
            userName,
            passHash, 
            token
        );

        if (!result) {
            const text = "Не удалось добавить пользователя в базу";
            return Answer.getDataToTemplate(false, text);
        }

        const userFromDB = await this.db.getUserByToken(token);

        if (!userFromDB) {
            return Answer.getDataToTemplate(false, "Пользователь в базе данных не найден");
        }

        return Answer.getDataToTemplate(userFromDB);
    }

    // авторизация пользователя
    async login(data) {
        const { userName, password, token: tokenClient } = data;

        if (!(userName && password)) {
            return Answer.getDataToTemplate(
                false,
                "Имеются пустные данные"
            );
        } 
        
        const { token, passHash } = commonModule.hashUserData(userName, password);

        const user = await this.db.getUserByUsername(userName);
        if (!(user && passHash === user.password)) {
            return Answer.getDataToTemplate(
                false,
                "Пользователь в базе не найден. E-mail или пароль не соовтетствуют"
            );
        }

        const result = await this.db.updateUserToken(user.id, token);
        if (!result) {
            return Answer.getDataToTemplate(
                false, 
                "Не удалось обновить токен пользователя"
            );
        }

       return Answer.getDataToTemplate(token);
    }

    // выход из акаунта
    async logout(data) {
        const { token } = data;
        if (!token) {
            Answer.getDataToTemplate(
                false,
                "На сервер передан пустой токен"
            );
        }

        const user = await this.db.getUserByToken(token);
        if (!user) {
            return Answer.getDataToTemplate(
                false,
                "Пользователь в базе не найден"
            );
        }
        const result = await this.db.updateUserToken(user.id, null);
        if (!result) {
            return Answer.getDataToTemplate(
                false, 
                "Не удалось обновить токен пользователя"
            );
        }
        return Answer.getDataToTemplate(true);
    }

    // получить данные о пользователе
    async getUserData(data) {
        const { token } = data;
        if (!token) {
            Answer.getDataToTemplate(
                false,
                "На сервер передан пустой токен"
            );
        }
        const user = await this.db.getUserByToken(token);
        if (!user) {
            Answer.getDataToTemplate(
                false,
                "Не найден пользователь в базе по токену"
            ); 
        }
        return Answer.getDataToTemplate(user);
    }

    async updateUserInfo(data) {
        const {age, email, phone, token} = data;
        if (!token) {
            Answer.getDataToTemplate(
                false,
                "На сервер передан пустой токен"
            );
        }
        const user = await this.db.getUserByToken(token);
        if (!user) {
            Answer.getDataToTemplate(
                false,
                "Не найден пользователь в базе по токену"
            ); 
        }
        const result = await this.db.updateUserData(age, email, phone, token)
        return Answer.getDataToTemplate(true)
    }

    async searchUsers(data) {
        const {filter} = data;
        const result = await this.db.searchUsers(filter);
        return Answer.getDataToTemplate(result)
    }
}

module.exports = UsersManager;