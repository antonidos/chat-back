const express = require('express');
const router = express.Router();
const Answer = require('./Answer');
const multerTaskPircture = require('../modules/multer/multerTaskPicture');

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
            const value = await users.getUserData(req.params);
            res.json(answer.good(value));
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            res.json(answer.bad(900));
        }
    });

    

    router.all('/*', (req, res) => res.send(answer.bad(404)));
    return router;
}

module.exports = Router;