# Setup notes

The database setup workflow creates `Universe`, `Events`, `ImpactLinks`, `Earnings`, `Runs`, `Briefings` and `Meta`. Universe has conventional column headers; other tables use a record key in column A and JSON in column B. Keep the headers produced by Setup Database unchanged.

Set the spreadsheet and owner chat in both Main and Error Handler configuration nodes. Attach fresh credentials by type using `credential-requirements.json`; exports intentionally omit every credential binding. The Alpha Vantage Query Auth parameter is `apikey`, with no space. Use `openai/gpt-oss-20b` through the configured Groq credential, not an OpenAI API credential.

For an optional fictional demo allocation, copy the one-line JSON representation of `data/demo-portfolio.json` into a Meta row: column A `portfolio_current`, column B the JSON object. Do this only on a new/empty demonstration database, so an existing real allocation is not overwritten. Otherwise enter your allocation through Telegram; `/portfolio new` starts an empty actual snapshot.

The optional `deployment/compose.full-installation.yml` preserves the larger original n8n installation layout, including extra sandbox services not needed by TickerWatch. It requires additional sandbox secrets and configuration and is a reference, not the default start command. The root Compose file starts the three services the project itself uses; the Yahoo MCP provider remains an external dependency.

Google Sheets OAuth client setup and Telegram bot creation happen in your own accounts. Provider API keys belong in n8n Credentials, never in workflow parameters or versioned `.env` files. No workflow is automatically published by the import helper.
