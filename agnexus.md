# Airtable MCP Server on agnexus

## About
A Model Context Protocol server that provides read and write access to Airtable databases. This server enables LLMs to inspect database schemas, then read and write records.

## Overview
The Airtable MCP Server exposes 15 tools that enable:

- **list_bases** - List all accessible Airtable bases with their IDs, names, and permission levels
- **list_tables** - List all tables in a specific base with configurable detail levels
- **describe_table** - Get detailed information about a specific table including fields and views
- **list_records** - List records from a table with optional filtering, sorting, and pagination
- **search_records** - Search for records containing specific text across fields
- **get_record** - Retrieve a specific record by its ID
- **create_record** - Create a new record in a table with specified field values
- **update_records** - Update one or more existing records in a table
- **delete_records** - Delete one or more records from a table
- **create_table** - Create a new table in a base with defined fields
- **update_table** - Update a table's name or description
- **create_field** - Add a new field to an existing table
- **update_field** - Update a field's name or description
- **create_comment** - Add a comment to a specific record
- **list_comments** - List all comments on a specific record

## Getting Started with agnexus
To deploy this MCP Server on agnexus, you need to provide an Airtable Personal Access Token (PAT).

### Setting up your Airtable credentials

1. Go to [Airtable's token creation page](https://airtable.com/create/tokens/new)
2. Sign in to your Airtable account (or create one if you don't have one)
3. Create a new Personal Access Token with the following settings:
   - **Name**: Choose any name, e.g., "agnexus MCP Server"
   - **Scopes**: Select the following based on your needs:
     - `schema.bases:read` - Required for listing bases and tables
     - `data.records:read` - Required for reading records
     - `schema.bases:write` - Optional, for creating/updating tables and fields
     - `data.records:write` - Optional, for creating/updating/deleting records
     - `data.recordComments:read` - Optional, for reading comments
     - `data.recordComments:write` - Optional, for creating comments
   - **Access**: Select the bases you want to access. Choose "Add all resources" if unsure.
4. Click **Create token** and copy the generated token (it starts with `pat...`)
5. Store this token securely - you'll need it during deployment

## Deploying on agnexus

1. On the agnexus page for this MCP server, click the **Deploy** button
2. You'll be guided through the deployment workflow with step-by-step instructions
3. During deployment (or afterwards), navigate to the **Environment Variables** section
4. Add the following environment variables:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AIRTABLE_API_KEY` | **Yes** | Your Airtable Personal Access Token (starts with `pat...`) |

5. Complete the deployment workflow

## That's it!
Your agnexus deployment will now have access to Airtable through the MCP server. You can use natural language to:

- Browse and explore your Airtable bases and tables
- Read, search, and filter records
- Create, update, and delete records
- Manage table schemas and fields
- Add and view comments on records
