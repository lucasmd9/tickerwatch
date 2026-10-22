# Current project state — 22 October 2026

Ten runtime workflows, 142 operational nodes, plus a separate manual database setup workflow. Only these eleven project workflows are in this repository. Diagnostic CHECK workflows, backups and abandoned attempts are excluded.

The current Main uses short spaced read views, a two-story daily briefing and `details` suffix parsing. Full briefing detail is retained separately within a bounded display field; per-case evidence remains in the database.

Supported-stock earnings use a fresh mapped historical-EPS cache for compact replies when available, while preferring fresh accepted issuer evidence. A provider fallback is explicitly labelled Alpha Vantage and does not overwrite issuer-checked Earnings records. Details retain the primary-source retrieval rules. Earnings persistence has one bounded retry for a transient write failure. Bare `/earnings` still requires a listing.

Market context on `/portfolio` includes SPY, Brent front-month futures and US 10-year Treasury yield. Default views omit routine quote timestamps; the detail view retains audit context. Yield changes are basis points, not bond returns. Stale data remains labelled.

The source installation's Alpha Vantage free key supported calendar, estimates and historical EPS but returned premium-required for news sentiment. No key or entitlement is provided by this repository. Historical tests used real external services; the included portable suite uses synthetic data and does not claim to rerun those live tests.
