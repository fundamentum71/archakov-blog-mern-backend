import express from 'express';
import mongoose from 'mongoose';
import { registerValidation } from './validations/auth.js';
import checkAuth from './utils/checkAuth.js';

import * as UserController from './controllers/UserController.js';

mongoose
	.connect(
		'mongodb+srv://admin:wwwwww@cluster0.rxaypsn.mongodb.net/blog?retryWrites=true&w=majority',
	)
	.then(() => console.log('DB ok'))
	.catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());

//авторизация
app.post('/auth/login', UserController.login);

//регистрация
app.post('/auth/register', registerValidation, UserController.register);

//получение информации о себе
app.get('/auth/me', checkAuth, UserController.getMe);

app.listen(3000, (err) => {
	if (err) {
		return console.log(err);
	}

	console.log('Server OK');
});
