import express from 'express';
import jwt from 'jsonwebtoken';
//для шифрования пароля
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { registerValidation } from './validations/auth.js';
import { validationResult } from 'express-validator';
import UserModel from './models/User.js';

mongoose
	.connect(
		'mongodb+srv://admin:wwwwww@cluster0.rxaypsn.mongodb.net/blog?retryWrites=true&w=majority',
	)
	.then(() => console.log('DB ok'))
	.catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());
//авторизация
app.post('/auth/login', async (req, res) => {
	try {
		//найти пользователя по признаку
		const user = await UserModel.findOne({ email: req.body.email });
		//если такой почты нет, неверный логин или пароль
		if (!user) {
			return res.status(404).json({
				message: 'Пользователь не найден',
			});
		}
		//проверка: сходятся ли пароли
		const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
		//если не сходятся
		if (!isValidPass) {
			return res.status(400).json({
				message: 'Неверный логин или пароль',
			});
		}
		//если все корректно, то он авторизуется
		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret123',
			{
				expiresIn: '30d',
			},
		);

		//чтобы не возвращаться hash при ответе
		const { passwordHash, ...userData } = user._doc;

		res.json({
			...userData,
			token,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось авторизоваться',
		});
	}
});

//регистрация
app.post('/auth/register', registerValidation, async (req, res) => {
	try {
		//валидация
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors.array());
		}

		//шифрование
		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const doc = new UserModel({
			email: req.body.email,
			fullName: req.body.fullName,
			avatarUrl: req.body.avatarUrl,
			passwordHash: hash,
		});

		//создаем пользователя
		const user = await doc.save();

		//создаем токен
		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret123',
			{
				expiresIn: '30d',
			},
		);

		//чтобы не возвращаться hash при ответе
		const { passwordHash, ...userData } = user._doc;

		res.json({
			...userData,
			token,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось зарегистрироваться',
		});
	}
});

app.listen(3000, (err) => {
	if (err) {
		return console.log(err);
	}

	console.log('Server OK');
});
