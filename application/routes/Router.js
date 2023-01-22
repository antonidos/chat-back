const express = require('express');
const router = express.Router();
const Answer = require('./Answer');

/**
 * 
 * @param {*} Object 
 * @returns {Router} 
 */
function Router({ usersManager }) {
    const answer = new Answer();

    // *******************************
    // Авторизация, регистрация
    // *******************************
    router.post('/auth/registration', async (req, res) => {
        try {
            const value = await usersManager.registration(req.body);
            res.send(answer.good(value));   
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    });

    // авторизация
    router.post('/auth/login', async (req, res) => {
        try {
            const value = await usersManager.login(req.body);
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    });

    // выход
    router.get('/auth/logout/:token', async (req, res) => {
        try {
            const value = await usersManager.logout(req.params);
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    })

    // *******************************
    // Работа с данными пользователей.
    // *******************************

    router.get('/users/get_user_data/:token', async (req, res) => {
        try {
            const value = await usersManager.getUserData(req.params);
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    });

    router.post('/users/update_user_info/', async (req, res) => {
        try {
            console.log(req.body)
            const value = await usersManager.updateUserInfo(req.body);
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    });

    router.get('/users/search_users/:filter', async (req, res) => {
        try {
            const value = await usersManager.searchUsers(req.params)
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    })

    router.get('/dialogs/get_dialogs_of_user?/:token', async (req, res) => {
        try {
            const value = await usersManager.getDialogsOfUser(req.params)
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    })

    router.post('/dialogs/add_dialog', async(req, res) => {
        try {
            const value = await usersManager.addChatOfUser(req.body)
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    })

    router.post('/dialogs/delete_dialog', async(req, res) => {
        try {
            const value = await usersManager.deleteChatOfUser(req.body)
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    })

    router.all('/*', (req, res) => res.send(answer.bad(404)));
    return router;
}

module.exports = Router;