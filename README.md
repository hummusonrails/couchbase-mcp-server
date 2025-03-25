# Couchbase MCP Server

The [Model Context Protocol (MCP) is a protocol](https://modelcontextprotocol.io/introduction) for handling interactions between large language models (LLMs) and external systems. This repository implements a Couchbase MCP Server using the Couchbase Node.js SDK, enabling MCP clients (e.g., Claude Desktop) to perform natural language queries on Couchbase Capella clusters.

With this server you can use commands like:

* `Show me the results of SELECT * FROM my_bucket LIMIT 10`
* `Execute this query: SELECT name, age FROM users WHERE active = true`
* `Get me the latest 5 documents from my_bucket`
* `Summarize the latest 5 orders from the orders bucket for me`

## Setup

1. Clone the repository and install dependencies:

```bash
git clone git@github.com:hummusonrails/couchbase-mcp-server.git
cd couchbase-mcp-server
npm install
```

2. Create a `.env` file in the root directory and add your Couchbase connection string, username, and password:

```env
COUCHBASE_CONNECTION_STRING=couchbases://your-cluster.cloud.couchbase.com
COUCHBASE_USERNAME=your_username
COUCHBASE_PASSWORD=your_password
```

Refer to the `.env.sample` file for the required environment variables.

3. Build the project:

```bash
npm run build
```

4. Run the server using Stdio transport:

```bash
npx couchbase-mcp-server
```
> [!NOTE]
> The MCP server uses the StdioServerTransport, so it communicates over standard input/output. Ensure that your MCP client (e.g., Claude Desktop) is configured to use a local MCP server.
> Follow the [Claude Desktop documentation](https://modelcontextprotocol.io/quickstart/user) to set up the MCP client to connect to the local server.

## Features

### Couchbase Query Tool

* **ToolName:** `query-couchbase`
* **Description:** Executes a SQL++ query statement on your Couchbase Capella cluster.
* **Usage**: When invoked, the server will use the Couchbase Node.js SDK to execute the provided SQL++ query and return the results.

## Developing

To work on the project locally:

1. Install dependences:

```bash
npm install
npm run build
```

2. Test the server using an MCP client:

Launch your MCP client (e.g., Claude Desktop) configured to connect and invoke the tool using a sample query.

3. Debugging

All logging messages are sent to `stderr` to ensure that `stdout` only contains MCP protocol JSON. Check your logs for detailed connection and error messages.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue with your suggestions. For any changes, ensure you follow the project’s code style.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.