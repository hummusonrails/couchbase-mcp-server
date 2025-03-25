#!/usr/bin/env node

import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import couchbase from "couchbase";
import { zodToJsonSchema } from "zod-to-json-schema";

const QueryCouchbaseInputSchema = z.object({
  statement: z.string().describe("A SQL++ query statement to execute on Couchbase")
});

const {
  COUCHBASE_CONNECTION_STRING,
  COUCHBASE_USERNAME,
  COUCHBASE_PASSWORD
} = process.env;

if (!COUCHBASE_CONNECTION_STRING || !COUCHBASE_USERNAME || !COUCHBASE_PASSWORD) {
  console.error("Error: Missing Couchbase connection environment variables.");
  console.error("Please set COUCHBASE_CONNECTION_STRING, COUCHBASE_USERNAME, and COUCHBASE_PASSWORD.");
  process.exit(1);
}

let cluster: couchbase.Cluster | null = null;

async function initCouchbase(): Promise<couchbase.Cluster> {
  if (!cluster) {
    cluster = await couchbase.connect(COUCHBASE_CONNECTION_STRING as string, {
      username: COUCHBASE_USERNAME,
      password: COUCHBASE_PASSWORD
    });
    console.error("Connected to Couchbase cluster.");
  }
  return cluster;
}

const server = new Server(
  {
    name: "Couchbase Query Server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "query-couchbase",
        description: "Execute a Couchbase query using a SQL++ statement",
        inputSchema: zodToJsonSchema(QueryCouchbaseInputSchema),
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === "query-couchbase") {
    const statement = request.params.arguments?.statement;
    if (typeof statement !== "string") {
      return {
        content: [
          { type: "text", text: "Invalid input: 'statement' must be a string" }
        ],
        isError: true
      };
    }
    console.error("Tool invocation received for query-couchbase with statement:", statement);
    try {
      const cluster = await initCouchbase();
      const queryResult = await cluster.query(statement);
      console.error("Query executed successfully. Rows returned:", queryResult.rows.length);
      return {
        content: [
          { type: "text", text: JSON.stringify(queryResult.rows, null, 2) }
        ],
        isError: false
      };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error executing query:", errMsg);
      return {
        content: [
          { type: "text", text: `Error executing query: ${errMsg}` }
        ],
        isError: true
      };
    }
  }
  throw new Error("Unknown tool");
});

const transport = new StdioServerTransport();

server.connect(transport).then(() => {
  console.error("MCP server connected.");
}).catch((error) => {
  console.error("Error connecting MCP server:", error);
  process.exit(1);
});

process.on("exit", (code) => {
  console.error("Process exiting with code:", code);
});
process.on("SIGINT", () => {
  console.error("Received SIGINT. Exiting.");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.error("Received SIGTERM. Exiting.");
  process.exit(0);
});
