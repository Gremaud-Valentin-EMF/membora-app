# Documentation de projet - Membora

- Auteur : Valentin Gremaud
- Date de création : 24.05.2025

## ANALYSE

## CONCEPTION

### Diagrammes entités relations

```mermaid
erDiagram

  t_users {
    pk_users int PK
    name string
    email string
    password_hash string
    role string
  }

  t_categories {
    pk_categories int PK
    name string
  }

  t_events {
    pk_events int PK
    title string
    date date
    fk_categories int FK
    fk_users int FK
  }

  tr_events_users {
    fk_events int FK
    fk_users int FK
  }

  t_permissions {
    fk_users int FK
    fk_categories int FK
  }

  t_users ||--o{ t_events : cree
  t_users ||--o{ tr_events_users : participe
  t_users ||--o{ t_permissions : autorise

  t_categories ||--o{ t_events : contient
  t_categories ||--o{ t_permissions : gere

  t_events ||--o{ tr_events_users : a_membre
```

## REALISATION

### Dépendances node

1. pg (postgres)
2. dotenv
3. express
4. cors
5. jsonwebtoken
6. joi
7. 

## DEPLOIEMENT
