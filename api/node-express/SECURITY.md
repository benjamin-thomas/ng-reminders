## To read

https://blog.codinghorror.com/protecting-your-cookies-httponly/

---

## The most interesting idea I found to secure the JWT/localstorage combo a bit

Source : https://dev.to/rdegges/please-stop-using-local-storage-1i04

  You can attach a ip to the JWT. Makes it even harder to steal.

---

### And A better idea still

    ...the only OWASP recommendation I could find is to keep JWTs in local session storage and use a fingerprint cookie to prevent sidejacking?

See: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
