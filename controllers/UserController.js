import jwt from 'jsonwebtoken';
//для шифрования пароля
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';

export const register = async (req, res) => {
	try {
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
};

export const login = async (req, res) => {
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
};

export const getMe = async (req, res) => {
	try {
		//вытаскивает id и ищет запись в базе данных
		const user = await UserModel.findById(req.userId);
		if (!user) {
			return res.status(404).json({
				message: 'Пользователь не найден',
			});
		}
		//если пользотватель нашелся

		const { passwordHash, ...userData } = user._doc;

		res.json({ userData });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Нет доступа',
		});
	}
};
