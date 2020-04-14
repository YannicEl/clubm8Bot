import { ScrapeUrl } from 'types/scrapeUrl';

const token = process.env.TOKEN;
export const BASE_URL = `https://api.telegram.org/bot${token}/`;
export const SCRAPE_URLS: ScrapeUrl[] = [
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

export enum Methods {
	sendPhoto = 'sendPhoto',
	sendMessage = 'sendMessage'
}
