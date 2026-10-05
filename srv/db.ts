import { Pool, type PoolClient } from 'pg';
import type { HistoryItem, LogEntry, VerificationRecord } from './types';

export type RecordKind = 'history' | 'verifications' | 'logs';
type StoredRecord = HistoryItem | VerificationRecord | LogEntry;

export interface SeedData {
  history: HistoryItem[];
  verifications: VerificationRecord[];
  logs: LogEntry[];
}

export interface NewRecord {
  kind: RecordKind;
  record: StoredRecord;
}

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 5000 })
  : null;
const memoryStore: Record<RecordKind, Map<string, StoredRecord>> = {
  history: new Map(),
  verifications: new Map(),
  logs: new Map()
};

let initialization: Promise<void> | undefined;
let initialized = false;

function tableFor(kind: RecordKind): string {
  return 'trustflow_' + kind;
}

async function insertRows(client: PoolClient, rows: NewRecord[]): Promise<void> {
  for (const { kind, record } of rows) {
    await client.query(
      'INSERT INTO ' + tableFor(kind) + ' (id, timestamp, payload) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO NOTHING',
      [record.id, record.timestamp, JSON.stringify(record)]
    );
  }
}

export const dataStore = {
  get mode(): 'postgres' | 'memory' | 'not-configured' {
    if (pool) return 'postgres';
    return process.env.NODE_ENV === 'production' ? 'not-configured' : 'memory';
  },

  async initialize(seed: SeedData): Promise<void> {
    if (initialized) return;
    if (!pool) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL is required in production. Configure a PostgreSQL connection string.');
      }
      for (const kind of ['history', 'verifications', 'logs'] as const) {
        if (memoryStore[kind].size === 0) {
          for (const record of seed[kind]) memoryStore[kind].set(record.id, record);
        }
      }
      initialized = true;
      return;
    }

    if (!initialization) {
      initialization = (async () => {
        const schema = [
          'CREATE TABLE IF NOT EXISTS trustflow_history (id TEXT PRIMARY KEY, timestamp BIGINT NOT NULL, payload JSONB NOT NULL)',
          'CREATE TABLE IF NOT EXISTS trustflow_verifications (id TEXT PRIMARY KEY, timestamp BIGINT NOT NULL, payload JSONB NOT NULL)',
          'CREATE TABLE IF NOT EXISTS trustflow_logs (id TEXT PRIMARY KEY, timestamp BIGINT NOT NULL, payload JSONB NOT NULL)',
          'CREATE INDEX IF NOT EXISTS trustflow_history_timestamp_idx ON trustflow_history (timestamp DESC)',
          'CREATE INDEX IF NOT EXISTS trustflow_verifications_timestamp_idx ON trustflow_verifications (timestamp DESC)',
          'CREATE INDEX IF NOT EXISTS trustflow_logs_timestamp_idx ON trustflow_logs (timestamp DESC)'
        ].join(';');
        await pool.query(schema);

        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          for (const kind of ['history', 'verifications', 'logs'] as const) {
            const { rows } = await client.query<{ count: string }>(
              'SELECT COUNT(*)::text AS count FROM ' + tableFor(kind)
            );
            if (rows[0].count === '0') {
              await insertRows(client, seed[kind].map((record) => ({ kind, record })));
            }
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        initialized = true;
      })().catch((error: unknown) => {
        initialization = undefined;
        throw error;
      });
    }
    await initialization;
  },

  async checkConnection(): Promise<void> {
    if (pool) await pool.query('SELECT 1');
  },

  async getAll<T extends StoredRecord>(kind: RecordKind): Promise<T[]> {
    if (pool) {
      const { rows } = await pool.query<{ payload: T }>(
        'SELECT payload FROM ' + tableFor(kind) + ' ORDER BY timestamp DESC'
      );
      return rows.map((row) => row.payload);
    }
    return [...memoryStore[kind].values()].sort((a, b) => b.timestamp - a.timestamp) as T[];
  },

  async getById<T extends StoredRecord>(kind: RecordKind, id: string): Promise<T | undefined> {
    if (pool) {
      const { rows } = await pool.query<{ payload: T }>(
        'SELECT payload FROM ' + tableFor(kind) + ' WHERE id = $1', [id]
      );
      return rows[0]?.payload;
    }
    return memoryStore[kind].get(id) as T | undefined;
  },

  async insertMany(records: NewRecord[]): Promise<void> {
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await insertRows(client, records);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      return;
    }
    for (const { kind, record } of records) memoryStore[kind].set(record.id, record);
  },

  async clear(kind: RecordKind): Promise<void> {
    if (pool) {
      await pool.query('DELETE FROM ' + tableFor(kind));
      return;
    }
    memoryStore[kind].clear();
  },

  async reset(seed: SeedData): Promise<void> {
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const kind of ['history', 'verifications', 'logs'] as const) {
          await client.query('DELETE FROM ' + tableFor(kind));
        }
        await insertRows(client, [
          ...seed.history.map((record) => ({ kind: 'history' as const, record })),
          ...seed.verifications.map((record) => ({ kind: 'verifications' as const, record })),
          ...seed.logs.map((record) => ({ kind: 'logs' as const, record }))
        ]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      return;
    }
    for (const kind of ['history', 'verifications', 'logs'] as const) {
      memoryStore[kind].clear();
      for (const record of seed[kind]) memoryStore[kind].set(record.id, record);
    }
  }
};

export async function closeDataStore(): Promise<void> {
  await pool?.end();
}
