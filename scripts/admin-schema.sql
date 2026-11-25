CREATE TABLE IF NOT EXISTS maldives_admin_user (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maldives_admin_session (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES maldives_admin_user(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text
);
CREATE INDEX IF NOT EXISTS maldives_admin_session_user_idx ON maldives_admin_session ("userId");

CREATE TABLE IF NOT EXISTS maldives_admin_account (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES maldives_admin_user(id) ON DELETE CASCADE,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS maldives_admin_account_user_idx ON maldives_admin_account ("userId");

CREATE TABLE IF NOT EXISTS maldives_admin_verification (
  id text PRIMARY KEY,
  identifier text NOT NULL UNIQUE,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maldives_admin_member (
  user_id text PRIMARY KEY REFERENCES maldives_admin_user(id),
  role text NOT NULL CHECK (role IN ('owner', 'publisher', 'editor')),
  active boolean NOT NULL DEFAULT true,
  auth_version integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maldives_admin_rate_limit (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS maldives_admin_revision (
  id uuid PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN ('site', 'affiliates')),
  parent_id uuid REFERENCES maldives_admin_revision(id),
  actor_id text NOT NULL REFERENCES maldives_admin_user(id),
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS maldives_admin_revision_scope_idx ON maldives_admin_revision (scope, created_at DESC);

CREATE TABLE IF NOT EXISTS maldives_admin_workspace (
  scope text PRIMARY KEY CHECK (scope IN ('site', 'affiliates')),
  draft_id uuid REFERENCES maldives_admin_revision(id),
  published_id uuid REFERENCES maldives_admin_revision(id),
  redo_ids uuid[] NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 0
);
INSERT INTO maldives_admin_workspace (scope) VALUES ('site'), ('affiliates') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS maldives_admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN ('site', 'affiliates', 'team', 'auth')),
  actor_id text NOT NULL REFERENCES maldives_admin_user(id),
  action text NOT NULL,
  revision_id uuid REFERENCES maldives_admin_revision(id),
  subject_id text REFERENCES maldives_admin_user(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS maldives_admin_audit_scope_idx ON maldives_admin_audit (scope, id DESC);
