import express from 'express';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import checkAuth from './utils/checkAuth.js';

import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';

mongoose
	.connect(
		'mongodb+srv://admin:wwwwww@cluster0.rxaypsn.mongodb.net/blog?retryWrites=true&w=majority',
	)
	.then(() => console.log('DB ok'))
	.catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());

//авторизация
app.post('/auth/login', loginValidation, UserController.login);

//регистрация
app.post('/auth/register', registerValidation, UserController.register);

//получение информации о себе
app.get('/auth/me', checkAuth, UserController.getMe);

//получение всех статей
app.get('/posts', PostController.getAll);
//получить одну статью
app.get('/posts/:id', PostController.getOne);
//создать статью
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
//удалить статью
app.delete('/posts/:id', checkAuth, PostController.remove);
//обновить статью
app.patch('/posts/:id', checkAuth, postCreateValidation, PostController.update);

app.listen(3000, (err) => {
	if (err) {
		return console.log(err);
	}

	console.log('Server OK');
});
