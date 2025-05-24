CREATE DATABASE jeunesse;

CREATE TABLE t_users(
	pk_users SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(320) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(20) NOT NULL CHECK(role IN ('membre', 'responsable'))
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