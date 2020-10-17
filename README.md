## Useful devtools

- [bat: like curl, but with a nicer output](https://github.com/astaxie/bat)
  - bat http://localhost:4444/todos
- apt-get install httpie # https://httpie.org
  - http http://localhost:4444/todos


### POST without authentication
```batch
curl http://localhost:4444/todos -X POST \
     -H "Content-Type: application/json" \
     -d '{"task": "do bad thing"}'

http -f POST http://localhost:4444/todos done=false
```

### POST with authentication
```batch
curl http://localhost:4444/todos -X POST \
     -H "Authorization: Bearer $TOKEN"   \
     -H "Content-Type: application/json" \
     -d '{"task": "learn how to auth"}'

http POST http://localhost:4444/todos "Authorization:Bearer $TOKEN" task="learn how to auth"
```

## API setup

### Postgrest setup

```bash
cd ./api/postgrest/
./manage/dev/full_db_setup [redo]
```
