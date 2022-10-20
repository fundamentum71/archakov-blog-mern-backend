import express from 'express';
import multer from 'multer';
import cors from 'cors';

import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';
import { UserController, PostController } from './controllers/index.js';

mongoose
	.connect(
		'mongodb+srv://admin:wwwwww@cluster0.rxaypsn.mongodb.net/blog?retryWrites=true&w=majority',
	)
	.then(() => console.log('DB ok'))
	.catch((err) => console.log('DB error', err));

const app = express();

//создаем хранилище где будем сохранять картинки
const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		//не получает ошибок и нужно сохранить файлы в папку uploads
		cb(null, 'uploads');
	},
	filename: (_, file, cb) => {
		//не получает ошибок и вытаскиваем оригинальное название
		cb(null, file.originalname);
	},
});

//добавляем логику multer в express
const upload = multer({ storage });

app.use(express.json());

//разрешаем запросы
app.use(cors());

//дает возможность обращаться к файлам в папке
app.use('/uploads', express.static('uploads'));

//запрос на загрузку картинки
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	});
});

//авторизация
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);

//регистрация
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);

//получение информации о себе
app.get('/auth/me', checkAuth, UserController.getMe);

//получение всех статей
app.get('/posts', PostController.getAll);
//получить одну статью
app.get('/posts/:id', PostController.getOne);
//создать статью
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
//удалить статью
app.delete('/posts/:id', checkAuth, PostController.remove);
//обновить статью
app.patch(
	'/posts/:id',
	checkAuth,
	postCreateValidation,
	handleValidationErrors,
	PostController.update,
);

app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}

	console.log('Server OK');
});
