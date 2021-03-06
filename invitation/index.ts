import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { config } from 'dotenv'
import { recover } from '../lib/recover'
import { createData, AirTableField } from '../lib/airtable'

// eslint-disable-next-line functional/no-expression-statement
config()

type Response = {
	readonly status: number
	readonly body: string | Record<string, unknown>
	readonly headers?: {
		readonly [key: string]: string
	}
}

const invite: AzureFunction = async (
	context: Context,
	req: HttpRequest
): Promise<Response> => {
	const {
		message = '',
		signature = '',
		market = '',
		asset = '',
		email = '',
		discord = '',
	} = req.body
	const recoverAccount =
		message && signature ? recover(message, signature) : undefined
	const address = recoverAccount ? recoverAccount : ''
	const fields: AirTableField = {
		message,
		signature,
		market,
		asset,
		email,
		discord,
		address,
	}

	const apiKey = process.env.AIRTABLE_API_KEY || ''
	const endpoint = process.env.AIRTABLE_ENDPOINT || ''
	const success = await createData(apiKey, endpoint, fields)
	const status = success ? 200 : 400
	return {
		status,
		body: {
			success: success,
		},
	}
}

export default invite
