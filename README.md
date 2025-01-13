1. Migrate
```bash
cd src/
sqlx migrate run
```

2. Seed
```bash
psql -U app -h db -d oms_development < src/seeds.sql
```
