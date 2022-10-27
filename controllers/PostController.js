import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
	try {
		//получаем все посты и связываем их с таблицей users
		const posts = await PostModel.find().populate('user').exec();

		res.json(posts);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось получить статьи',
		});
	}
};

export const getLastTags = async (req, res) => {
	try {
		//возьмем тэги с последних 5ти статей
		const posts = await PostModel.find().limit(5).exec();
		const tags = posts
			.map((obj) => obj.tags)
			.flat()
			.slice(0, 5);

		res.json(tags);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось получить статьи',
		});
	}
};

export const getOne = async (req, res) => {
	try {
		//вытаскиваем id статьи
		const postId = req.params.id;

		//найти статью по id
		PostModel.findOneAndUpdate(
			{
				_id: postId,
			},
			{
				//показать только одну статью
				$inc: { viewsCount: 1 },
			},
			{
				//после обновления вернуть
				returnDocument: 'after',
			},
			(err, doc) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: 'Не удалось получить статью',
					});
				}
				if (!doc) {
					return res.status(404).json({
						message: 'Статья не найдена',
					});
				}
				res.json(doc);
			},
		).populate('user');
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось получить статьи',
		});
	}
};

export const remove = async (req, res) => {
	try {
		//вытаскиваем id статьи
		const postId = req.params.id;

		PostModel.findOneAndDelete(
			{
				_id: postId,
			},
			(err, doc) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: 'Не удалось удалить статью',
					});
				}
				if (!doc) {
					return res.status(404).json({
						message: 'Статья не найдена',
					});
				}

				res.json({
					success: true,
				});
			},
		);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось получить статьи',
		});
	}
};

export const create = async (req, res) => {
	try {
		const doc = new PostModel({
			title: req.body.title,
			text: req.body.text,
			imageUrl: req.body.imageUrl,
			tags: req.body.tags,
			//вытащит после авторизации
			user: req.userId,
		});

		const post = await doc.save();

		res.json(post);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось создать статью',
		});
	}
};

export const update = async (req, res) => {
	try {
		//вытаскиваем id статьи
		const postId = req.params.id;

		await PostModel.updateOne(
			{
				_id: postId,
			},
			{
				title: req.body.title,
				text: req.body.text,
				imageUrl: req.body.imageUrl,
				tags: req.body.tags,
				//вытащит после авторизации
				user: req.userId,
			},
		);

		res.json({
			success: true,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Не удалось обновить статью',
		});
	}
};
