import {
	successReturn,
	errorReturn,
	makeRequest,
	getProducts
} from '../helpers/helpers';
import { Product } from 'types/product';
import { Payload } from 'types/payload';
import { Methods, } from '../helpers/globals';

export async function pricesRoutine(event: any, chatId: string) {
	let products: Product[] = [];
	try {
		products = await getProducts();
		console.log('Producted fetched successfully');
	} catch (e) {
		console.log('Error fetching products');
		console.log(e);
		return errorReturn(400, 'Bad Request');
	}

	const payloads: Payload[] = [];
	products.forEach(product => {
		const caption = product.discounted
			? `Bruh [${product.name}](${product.url}) ist verbilligt 🔥🔥 💯`
			: `[${product.name}](${product.url}) kostet derzeit  *${product.price}*, leider kein Rabatt 😢`;

		payloads.push({
			chat_id: chatId,
			photo: product.pic,
			caption: caption,
			parse_mode: 'MarkdownV2'
		});
	});

	try {
		await Promise.all(
			payloads.map(async (payload: Payload) => {
				console.log(payload);
				await makeRequest(Methods.sendPhoto, payload);
			})
		);
		console.log('Message sent');
	} catch (e) {
		console.log('Error sending msg');
		console.log(e);
		console.log(400, 'Error fetching products');
	}

	return successReturn(event);
}
