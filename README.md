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

---

## Running tests

### With a visible browser
```
ng test
cypress open
```

### Headless
```
ng test --browsers ChromeHeadless
cypress run
```

### Run all prior to commit

ng test --browsers ChromeHeadless --watch=false && cypress run

---

## Cypress setup

[Source](https://dev.to/angular/ci-ready-e2e-tests-for-angular-with-cypress-and-typescript-in-under-60-minutes-4f30)

1. ng add @briebug/cypress-schematic --addCypressTestScripts
2. Update .gitignore
   ```
   # Cypress
   /cypress/videos/
   /cypress/screenshots/
   ```
3. Run one of those:
   - ng e2e [--headless] OR npm e2e
   - npm cy:open
   - npm cy:run

3. Setup CI like (for now) oneliner (will need to serve production build later)
   - npm install --save-dev start-server-and-test
   - update package.json
      ```
      "e2e:ci": "start-server-and-test start http://ng.reminders.test:4200 cy:run",
      ```
   - npm run e2e:ci

---

## Useful testing references here

https://codecraft.tv/courses/angular/unit-testing/asynchronous/
https://angular.io/guide/testing-services
