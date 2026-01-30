#!/usr/bin/env node

import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import {AirtableService} from './airtableService.js';
import {createServer} from './index.js';

// Cloud Run deployment configuration
const CLOUD_RUN_HOST = '0.0.0.0';
const CLOUD_RUN_PORT = 8080;

function setupSignalHandlers(cleanup: () => Promise<void>): void {
	process.on('SIGINT', async () => {
		await cleanup();
		process.exit(0);
	});
	process.on('SIGTERM', async () => {
		await cleanup();
		process.exit(0);
	});
}

(async () => {
	const apiKey = process.argv.slice(2)[0];
	if (apiKey) {
		console.warn('warning (airtable-mcp-server): Passing in an API key as a command-line argument is deprecated and may be removed in a future version. Instead, set the `AIRTABLE_API_KEY` environment variable. See https://github.com/domdomegg/airtable-mcp-server/blob/master/README.md#usage for an example with Claude Desktop.');
	}

	const transport = process.env.MCP_TRANSPORT || 'stdio';
	const airtableService = new AirtableService(apiKey);
	const server = createServer({airtableService});

	if (transport === 'stdio') {
		setupSignalHandlers(async () => server.close());

		const stdioTransport = new StdioServerTransport();
		await server.connect(stdioTransport);
	} else if (transport === 'http') {
		const app = express();
		app.use(express.json());

		// Health check endpoint for Cloud Run
		app.get('/health', (_req, res) => {
			res.status(200).json({status: 'healthy'});
		});

		const httpTransport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
			enableJsonResponse: true,
		});

		app.post('/mcp', async (req, res) => {
			await httpTransport.handleRequest(req, res, req.body);
		});

		await server.connect(httpTransport);

		// Hardcoded for Cloud Run deployment: 0.0.0.0:8080
		const httpServer = app.listen(CLOUD_RUN_PORT, CLOUD_RUN_HOST, () => {
			console.error(`Airtable MCP server running on http://${CLOUD_RUN_HOST}:${CLOUD_RUN_PORT}/mcp`);
			console.error('Health check available at /health');
		});

		setupSignalHandlers(async () => {
			await server.close();
			httpServer.close();
		});
	} else {
		console.error(`Unknown transport: ${transport}. Use MCP_TRANSPORT=stdio or MCP_TRANSPORT=http`);
		process.exit(1);
	}
})().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
