CREATE TABLE IF NOT EXISTS trustflow_history (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS trustflow_verifications (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS trustflow_logs (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS trustflow_history_timestamp_idx ON trustflow_history (timestamp DESC);
CREATE INDEX IF NOT EXISTS trustflow_verifications_timestamp_idx ON trustflow_verifications (timestamp DESC);
CREATE INDEX IF NOT EXISTS trustflow_logs_timestamp_idx ON trustflow_logs (timestamp DESC);
