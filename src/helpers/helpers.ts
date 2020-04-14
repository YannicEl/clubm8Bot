import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { BASE_URL, Methods, SCRAPE_URLS } from './globals';
import { Product } from 'types/product';
import { ScrapeUrl } from 'types/scrapeUrl';

export async function makeRequest(method: Methods, payload: object) {
	await fetch(BASE_URL + method, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function sendMsg(chat_id: string, msg: string) {
	await fetch(BASE_URL + Methods.sendMessage, {
		method: 'post',
		body: JSON.stringify({
			text: msg,
			chat_id: chat_id,
			parse_mode: 'Markdown'
		}),
		headers: { 'Content-Type': 'application/json' }
	});
}

export function errorReturn(code: number, msg: string) {
	return {
		statusCode: code,
		body: JSON.stringify({
			error: msg
		})
	};
}

export function successReturn(event: any) {
	return {
		statusCode: 200,
		body: JSON.stringify({
			input: event
		})
	};
}

export async function getProducts(): Promise<Product[]> {
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
