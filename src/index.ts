import { Handler } from 'aws-lambda';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { ScrapeUrl } from 'types/scrapeUrl';
import { Product } from 'types/product';
import { Payload } from 'types/payload';

const token = process.env.TOKEN;
const BASE_URL = `https://api.telegram.org/bot${token}/sendPhoto`;
const SCRAPE_URLS: ScrapeUrl[] = [
	{
		url: 'https://www.interspar.at/shop/lebensmittel/club-mate/p/2020000577515',
		name: 'Club Mate'
	},
	{
		url:
			'https://www.interspar.at/shop/lebensmittel/club-mate-mate-granatapfel/p/2020002976231',
		name: 'Club Mate Granatapfel'
	}
];

export const clubm8bot: Handler = async (event, context) => {
	console.log(JSON.parse(event.body));

	const body = JSON.parse(event.body);
	const message = body.message;
	const chatId = message.chat.id;

	if (!message.text.startsWith('/prices'))
		return {
			statusCode: 200,
			body: JSON.stringify({
				input: event
			})
		};

	let products: Product[] = [];
	try {
		products = await getProducts();
		console.log('Producted fetched successfully');
	} catch (e) {
		console.log('Error fetching products');
		console.log(e);
		return errorFetchingReturn;
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
				await fetch(BASE_URL, {
					method: 'post',
					body: JSON.stringify(payload),
					headers: { 'Content-Type': 'application/json' }
				});
			})
		);
		console.log('Message sent');
	} catch (e) {
		console.log('Error sending msg');
		console.log(e);
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			input: event
		})
	};
};

async function getProducts(): Promise<Product[]> {
	const ret: Product[] = [];

	await Promise.all(
		SCRAPE_URLS.map(async (product: ScrapeUrl) => {
			const res = await fetch(product.url);
			const html = await res.text();
			const $ = cheerio.load(html);

			let discounted = true;
			let price = $('.productDetailsPrice.discount').text();

			if (!price) {
				discounted = false;
				price = $('.productDetailsPrice').text();
			}

			const pic = $('.sparImageResponsive').attr('data-desktop-src');

			ret.push({
				name: product.name,
				price: price,
				discounted: discounted,
				pic: pic || '',
				url: product.url
			});
		})
	);

	return ret;
}

const errorFetchingReturn = {
	statusCode: 400,
	body: JSON.stringify({
		error: 'Error fetching products'
	})
};
