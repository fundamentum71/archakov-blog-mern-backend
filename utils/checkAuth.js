//Функция middleware(функция посредник)
import jwt from 'jsonwebtoken';

export default (req, res, next) => {
	//проверка авторизации
	const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

	if (token) {
		try {
			//расшифровывыем токен
			const decoded = jwt.verify(token, 'secret123');
			//вшиваем в реквест
			req.userId = decoded._id;
			next();
		} catch (error) {
			return res.status(403).json({
				message: 'Нет доступа',
			});
		}
	} else {
		return res.status(403).json({
			message: 'Нет доступа',
		});
	}
};
