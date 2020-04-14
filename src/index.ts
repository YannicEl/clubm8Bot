import { Handler } from 'aws-lambda';
import { errorReturn, getProducts, sendMsg } from './helpers/helpers';
import { pricesRoutine } from './commands/prices';
import { registerRoutine } from './commands/register';
import { Product } from 'types/product';
import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB();

export const clubm8bot: Handler = async (event, context) => {
	console.log(JSON.parse(event.body));

	const body = JSON.parse(event.body);
	const message = body.message;
	const chatId = message.chat.id;

	const command = message.text;
	if (command.startsWith('/register')) {
		return registerRoutine(event, chatId);
	} else if (command.startsWith('/prices')) {
		return pricesRoutine(event, chatId);
	} else {
		return errorReturn(400, 'Unknown command');
	}
};

export const checkDiscount: Handler = async (event, context) => {
	let products: Product[] = [];
	try {
		products = await getProducts();
		console.log('Producted fetched successfully');
	} catch (e) {
		console.log('Error fetching products');
		console.log(e);
		return errorReturn(400, 'Bad Request');
	}
	products = products.filter(e => e.discounted);

	if (products.length > 0) {
		try {
			const params = {
				TableName: process.env.DB_NAME || ''
			};
			const res = await dynamodb.scan(params).promise();
			const ids = res.Items?.map(e => e.chatId.S);

			await Promise.all(
				products.map(async e => {
					if (ids) {
						console.log(ids);
						await Promise.all(
							ids.map(async id => {
								console.log(id);
								if (id) {
									await sendMsg(
										id,
										`Bruh [${e.name}](${e.url}) ist verbilligt 🔥🔥 💯`
									);
								}
							})
						);
					}
				})
			);
		} catch (e) {
			console.log('error');
			console.log(e);
			return errorReturn(500, 'Internal Server Error');
		}
	}
};
