import { successReturn, sendMsg, errorReturn } from '../helpers/helpers';

import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB();

export async function registerRoutine(event: any, chatId: string) {
	console.log(process.env.DB_NAME);
	const params = {
		TableName: process.env.DB_NAME || '',
		Item: {
			chatId: {
				S: '' + chatId
			}
		}
	};

	try {
		await dynamodb.putItem(params).promise();
	} catch (e) {
		console.log('Error writing chatId to DB');
		console.log(e);
		return errorReturn(500, 'Internal server error');
	}

	try {
		await sendMsg(
			chatId,
			'Du wirst informiert sobald der prickelnde Mate-Eistee reduziert ist 💯'
		);
		console.log('Message sent');
	} catch (e) {
		console.log('error sending msg');
		console.log(e);
	}
	return successReturn(event);
}
