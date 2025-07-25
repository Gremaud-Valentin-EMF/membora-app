-- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://github.com/pgadmin-org/pgadmin4/issues/new/choose if you find any bugs, including reproduction steps.
BEGIN;


CREATE TABLE IF NOT EXISTS public.articles
(
    id serial NOT NULL,
    titre character varying(255) COLLATE pg_catalog."default" NOT NULL,
    contenu text COLLATE pg_catalog."default" NOT NULL,
    etat character varying(32) COLLATE pg_catalog."default" NOT NULL,
    auteur_id integer,
    tenant_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_publication timestamp without time zone,
    CONSTRAINT articles_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.categories
(
    id serial NOT NULL,
    nom character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    tenant_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.evenements
(
    id serial NOT NULL,
    nom character varying(255) COLLATE pg_catalog."default" NOT NULL,
    categorie_id integer,
    statut character varying(32) COLLATE pg_catalog."default" NOT NULL,
    tenant_id integer NOT NULL,
    date timestamp without time zone,
    createur_id integer,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT evenements_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.membres
(
    id serial NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    nom character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    role character varying(32) COLLATE pg_catalog."default" NOT NULL,
    tenant_id integer NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'active'::character varying,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT membres_pkey PRIMARY KEY (id),
    CONSTRAINT membres_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.participations
(
    id serial NOT NULL,
    membre_id integer NOT NULL,
    evenement_id integer NOT NULL,
    present boolean NOT NULL DEFAULT false,
    tenant_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT participations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.permissions
(
    membre_id integer NOT NULL,
    categorie_id integer NOT NULL,
    tenant_id integer NOT NULL,
    CONSTRAINT permissions_pkey PRIMARY KEY (membre_id, categorie_id)
);

CREATE TABLE IF NOT EXISTS public.tenants
(
    id serial NOT NULL,
    nom character varying(255) COLLATE pg_catalog."default" NOT NULL,
    logo_url text COLLATE pg_catalog."default",
    primary_color character varying(32) COLLATE pg_catalog."default",
    secondary_color character varying(32) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    slug character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tenants_pkey PRIMARY KEY (id),
    CONSTRAINT tenants_slug_key UNIQUE (slug)
);

ALTER TABLE IF EXISTS public.articles
    ADD CONSTRAINT articles_auteur_id_fkey FOREIGN KEY (auteur_id)
    REFERENCES public.membres (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_articles_auteur
    ON public.articles(auteur_id);


ALTER TABLE IF EXISTS public.articles
    ADD CONSTRAINT articles_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_articles_tenant
    ON public.articles(tenant_id);


ALTER TABLE IF EXISTS public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categories_tenant
    ON public.categories(tenant_id);


ALTER TABLE IF EXISTS public.evenements
    ADD CONSTRAINT evenements_categorie_id_fkey FOREIGN KEY (categorie_id)
    REFERENCES public.categories (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_evenements_categorie
    ON public.evenements(categorie_id);


ALTER TABLE IF EXISTS public.evenements
    ADD CONSTRAINT evenements_createur_id_fkey FOREIGN KEY (createur_id)
    REFERENCES public.membres (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;


ALTER TABLE IF EXISTS public.evenements
    ADD CONSTRAINT evenements_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_evenements_tenant
    ON public.evenements(tenant_id);


ALTER TABLE IF EXISTS public.membres
    ADD CONSTRAINT membres_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_membres_tenant
    ON public.membres(tenant_id);


ALTER TABLE IF EXISTS public.participations
    ADD CONSTRAINT participations_evenement_id_fkey FOREIGN KEY (evenement_id)
    REFERENCES public.evenements (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_participations_evenement
    ON public.participations(evenement_id);


ALTER TABLE IF EXISTS public.participations
    ADD CONSTRAINT participations_membre_id_fkey FOREIGN KEY (membre_id)
    REFERENCES public.membres (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_participations_membre
    ON public.participations(membre_id);


ALTER TABLE IF EXISTS public.participations
    ADD CONSTRAINT participations_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_participations_tenant
    ON public.participations(tenant_id);


ALTER TABLE IF EXISTS public.permissions
    ADD CONSTRAINT permissions_categorie_id_fkey FOREIGN KEY (categorie_id)
    REFERENCES public.categories (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.permissions
    ADD CONSTRAINT permissions_membre_id_fkey FOREIGN KEY (membre_id)
    REFERENCES public.membres (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.permissions
    ADD CONSTRAINT permissions_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

END;