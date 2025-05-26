
CREATE DATABASE jeunesse;

CREATE TABLE t_users(
	pk_users SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(320) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(20) NOT NULL CHECK(role IN ('membre', 'responsable')),
	status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected'));
);

CREATE TABLE t_categories(
	pk_categories SERIAL PRIMARY KEY,
	name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE t_events(
	pk_events SERIAL PRIMARY KEY,
	title VARCHAR(150) NOT NULL,
	date DATE NOT NULL,
	fk_categories INTEGER NOT NULL REFERENCES t_categories(pk_categories) ON DELETE CASCADE,
	fk_users INTEGER NOT NULL REFERENCES T_users(pk_users) ON DELETE SET NULL
);

CREATE TABLE tr_events_users(
	fk_events INTEGER NOT NULL REFERENCES t_events(pk_events) ON DELETE CASCADE,
	fk_users INTEGER NOT NULL REFERENCES t_users(pk_users) ON DELETE CASCADE,
	PRIMARY KEY (fk_events, fk_users)
);

CREATE TABLE t_permissions (
	fk_users INTEGER NOT NULL REFERENCES t_users(pk_users) ON DELETE CASCADE,
	fk_categories INTEGER NOT NULL REFERENCES t_categories(pk_categories) ON DELETE CASCADE,
	PRIMARY KEY (fk_users, fk_categories)
);


CREATE TABLE t_tenants (
  pk_tenant VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE t_users
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected'));

ALTER TABLE t_users
ADD COLUMN fk_tenant VARCHAR(100) NOT NULL REFERENCES t_tenants(pk_tenant) ON DELETE CASCADE;

ALTER TABLE t_events
ADD COLUMN fk_tenant VARCHAR(100) NOT NULL REFERENCES t_tenants(pk_tenant) ON DELETE CASCADE;

ALTER TABLE t_categories
ADD COLUMN fk_tenant VARCHAR(100) NOT NULL REFERENCES t_tenants(pk_tenant) ON DELETE CASCADE;

ALTER TABLE tr_events_users
ADD COLUMN fk_tenant VARCHAR(100) NOT NULL REFERENCES t_tenants(pk_tenant) ON DELETE CASCADE;

ALTER TABLE t_permissions
ADD COLUMN fk_tenant VARCHAR(100) NOT NULL REFERENCES t_tenants(pk_tenant) ON DELETE CASCADE;


ALTER TABLE t_users ALTER COLUMN fk_tenant SET NOT NULL;
ALTER TABLE t_events ALTER COLUMN fk_tenant SET NOT NULL;
ALTER TABLE t_categories ALTER COLUMN fk_tenant SET NOT NULL;
ALTER TABLE tr_events_users ALTER COLUMN fk_tenant SET NOT NULL;
ALTER TABLE t_permissions ALTER COLUMN fk_tenant SET NOT NULL;


