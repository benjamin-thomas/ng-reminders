## Useful devtools

- [bat: like curl, but with a nicer output](https://github.com/astaxie/bat)
  - bat http://localhost:4444/todos
- apt-get install httpie # https://httpie.org
  - http http://localhost:4444/todos


curl http://localhost:3000/todos -X POST \
     -H "Content-Type: application/json" \
     -d '{"task": "do bad thing"}'

http -f POST http://localhost:4444/todos done=false

## API setup

### Postgrest setup

```bash
cd ./api/postgrest/
./manage/dev/full_db_setup [redo]
```
