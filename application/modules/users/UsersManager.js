const Answer = require('../../routes/Answer');
const commonModule = require('../commonModule');
const Module = require('../module/Module');
const uuid = require('uuid');
const fs = require('fs');

class UsersManager extends Module {
    constructor(params) {
        super(params);
    }

    // регистрация нового пользователя в базе.
    async registration(data) {
        const { userName, password, email } = data;

        if (!(userName && password && email)) {
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
            token,
            email
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
        const { userName, password } = data;

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
        const { age, email, phone, token } = data;
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
        const { filter } = data;
        const result = await this.db.searchUsers(filter);
        return Answer.getDataToTemplate(result)
    }

    async getDialogsOfUser(data) {
        const { token } = data;
        if (!token) {
            Answer.getDataToTemplate(
                false,
                "На сервер передан пустой токен"
            );
        }
        const fullDataFialogs = await this.db.getDialogsOfUser(token)
        const dialogs = fullDataFialogs[0];
        const IDsCompanions = fullDataFialogs[1];

        const IDsDialogs = dialogs.map(chat => chat.id)
        const lastMessages = await this.db.getLastMessages(IDsDialogs);
        const avatars = await this.db.getAvatarsOfCompanions(IDsCompanions)
        console.log({dialogs, lastMessages, avatars})
        return Answer.getDataToTemplate({dialogs, lastMessages, avatars})
    }

    async addChatOfUser(data) {
        const { token, username } = data;
        if (!token) {
            Answer.getDataToTemplate(
                false,
                "На сервер передан пустой токен"
            );
        }
        const result = await this.db.addUserChat(token, username)
        return Answer.getDataToTemplate(result)
    }

    async deleteChatOfUser(data) {
        const { token, username } = data;
        if (!token) {
            Answer.getDataToTemplate(
                false,
                "На сервер передан пустой токен"
            );
        }
        const result = await this.db.deleteUserChat(token, username)
        return Answer.getDataToTemplate(result)
    }

    async addMessageInChat(data) {
        const { token, chatId, content } = data;
        const timestamp = Math.floor(Date.now() / 1000)
        if (!token || !chatId || !content) {
            Answer.getDataToTemplate(
                false,
                "Одно из значений пустое!"
            );
        }

        const result = await this.db.addMessage(token, chatId, content, timestamp)
        if(result) {
            const result2 = this.db.updateLastMessage(chatId, token, content, timestamp)
            if(result2) return Answer.getDataToTemplate(true)
        }

        return Answer.getDataToTemplate(false, "Произошла ошибка");
    }

    async getChat(data) {
        const { chatId } = data;
        if (!chatId) {
            Answer.getDataToTemplate(
                false,
                "Одно из значений пустое!"
            );
        }

        const result = await this.db.getDialog(chatId)
        return Answer.getDataToTemplate(result);
    }

    async changeSetting(data) {
        const { token, theme, notifications } = data;
        const user = await this.db.getUserByToken(token);
        if (!user) {
            return Answer.getDataToTemplate(
                false,
                "Пользователь в базе не найден"
            );
        }
        if (theme !== "DARK" || theme !== "LIGHT")
            if (!user) {
                return Answer.getDataToTemplate(
                    false,
                    "Такой темы не существует"
                );
            }

        if (notifications !== "0" || notifications !== "1")
            if (!user) {
                return Answer.getDataToTemplate(
                    false,
                    "Передан неверный параметр"
                );
            }
        const result = await this.db.changeUserSettings(user.id, theme, notifications)
        if(result) return Answer.getDataToTemplate(true);
        return Answer.getDataToTemplate(false, 'Произошла ошибка');
    }

    async getSettings(data) {
        const { token } = data;
        const user = await this.db.getUserByToken(token);
        if (!user) {
            return Answer.getDataToTemplate(
                false,
                "Пользователь в базе не найден"
            );
        }
        const result = await this.db.getUserSettings(user.id)
        return Answer.getDataToTemplate(result);
    }

    async setTheme(data) {
        const { token, theme } = data;
        const user = await this.db.getUserByToken(token);
        if (!user) {
            return Answer.getDataToTemplate(
                false,
                "Пользователь в базе не найден"
            );
        }
        if (theme !== "DARK" || theme !== "LIGHT")
            if (!user) {
                return Answer.getDataToTemplate(
                    false,
                    "Такой темы не существует"
                );
            }


        const result = await this.db.setTheme(user.id, theme)
        if(result) return Answer.getDataToTemplate(true);
        return Answer.getDataToTemplate(false, 'Произошла ошибка');
    }

    async saveAvatar(data) {
        const { token, 
            avatar: avatarImage,
        } = data;

        if (!avatarImage) {
            return Answer.getDataToTemplate(false, "Файл не передан с клиента на сервер");
        }

        const filename = avatarImage.filename;

        if (!token) {
            return Answer.getDataToTemplate(false, "Токен пользователя пустой");
        }

        const userIdObject = await this.db.getUserByToken(token);

        if (!userIdObject) {
            return Answer.getDataToTemplate(false, "Пользователь в системе не найден по токену");
        }

        const userId = userIdObject.id

        const src = commonModule.getPathToFileAPI(filename);

        const guid = uuid.v4();

        const result = await this.db.saveAvatar(userId, src, filename, guid);

        if (!result) {
            return Answer.getDataToTemplate(false, "Не удалось сохранить файл");
        }

        const fileDate = await this.db.getTaskFileByGUID(guid);

        if (!fileDate) {
            return Answer.getDataToTemplate(false, "Не удалось получить информацию о файле");
        }

        return Answer.getDataToTemplate(fileDate);
    }

    async removeAvatar(data) {
        const { 
            token
        } = data;

        const user = await this.db.getUserByToken(token);

        if (!user) {
            return Answer.getDataToTemplate(false, "Пользователь в базе не найден");
        }

        const userId = user.id

        const result = await this.db.removeAvatar(userId);

        if (!result) {
            return Answer.getDataToTemplate(false, "Не удалось удалить запись файл задачи БД");
        }

        return Answer.getDataToTemplate(true);
    }

    async getAvatar(data) {
        const {token} = data

        const user = await this.db.getUserByToken(token);

        if (!user) {
            return Answer.getDataToTemplate(false, "Пользователь в базе не найден");
        }

        const id = user.id;

        const result = await this.db.getAvatar(id)

        return Answer.getDataToTemplate(result);
    }

    async getAvatarsOfCompanions(data) {

    }
}

module.exports = UsersManager;