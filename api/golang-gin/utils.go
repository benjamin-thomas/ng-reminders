package main

import (
  "context"
  "database/sql"
  "fmt"
  "github.com/gin-gonic/gin"
  "github.com/gorilla/sessions"
  "log"
  "net/http"
  "os"
  "strconv"
)

func mustEnv(key string) string {
  val := os.Getenv(key)
  if val == "" {
    log.Panicln("Required env var not set:", key)
  }
  return val
}

func isDev() bool {
  return AppEnv == "development"
}

func mustGetSession(r *http.Request) *sessions.Session {
  session, err := sessionStore.Get(r, "session-key")
  if err != nil {
    log.Fatalf(err.Error())
  }
  return session
}

func panicIf(err error) {
  if err != nil {
    panic(err)
  }
}

// Builds SET SQL arguments string:
//   COL_NAME_1=$1, COL_NAME_2=$2, etc.
// While appending to the args slice for latter passing:
//   args = args + NAME_1_VALUE + NAME_2_VALUE, etc.
// **NOTE** => Trailing comma must be removed after last call
func addToSetParamsIf(cond bool, colName string, val interface{}, sql string, args []interface{}) (string,
  []interface{}) {
  if cond {
    args = append(args, val)
    sql += fmt.Sprintf(" %s=$%d,", colName, len(args))
  }
  return sql, args
}

func mustUserScopeQueryRow(fn func(row *sql.Row) error, c *gin.Context, query string, args ...interface{}) {
  log.Println("Provided SQL:", query)
  log.Println("Provided SQL Args:", args)
  session := mustGetSession(c.Request)

  ctx := context.Background()
  tx, begTxErr := db.BeginTx(ctx, nil)
  panicIf(begTxErr)

  safeUserID, convErr := strconv.Atoi(session.Values["userID"].(string))
  panicIf(convErr)

  // Cannot use $1, only string interpolation.
  frag := fmt.Sprintf("SET LOCAL app.tenant_id = %d", safeUserID)
  log.Println("sql:", frag)
  _, rlsErr := tx.Exec(frag)
  panicIf(rlsErr)

  row := tx.QueryRow(query, args...)
  rowErr := fn(row)
  panicIf(rowErr)

  commitErr := tx.Commit()
  panicIf(commitErr)
}


func mustUserScopeExec(c *gin.Context, query string, args ...interface{}) {
  log.Println("Provided SQL:", query)
  log.Println("Provided SQL Args:", args)
  session := mustGetSession(c.Request)

  ctx := context.Background()
  tx, begTxErr := db.BeginTx(ctx, nil)
  panicIf(begTxErr)

  safeUserID, convErr := strconv.Atoi(session.Values["userID"].(string))
  panicIf(convErr)

  // Cannot use $1, only string interpolation.
  frag := fmt.Sprintf("SET LOCAL app.tenant_id = %d", safeUserID)
  log.Println("sql:", frag)
  _, rlsErr := tx.Exec(frag)
  panicIf(rlsErr)

  _, execErr := tx.Exec(query, args...)
  panicIf(execErr)

  commitErr := tx.Commit()
  panicIf(commitErr)
}

func userScopeQuery(fn func(rows *sql.Rows), c *gin.Context, query string, args ...interface{}) {
  session := mustGetSession(c.Request)
  // Create a new context, and begin a transaction
  ctx := context.Background()
  tx, err := db.BeginTx(ctx, nil)
  if err != nil {
    log.Fatal(err)
  }
  // `tx` is an instance of `*sql.Tx` through which we can execute our queries

  frag := fmt.Sprintf("SET LOCAL app.tenant_id = %s", session.Values["userID"])
  _, rlsErr := tx.Exec(frag)
  if rlsErr != nil {
    panic(rlsErr)
  }

  rows, err := tx.Query(query, args...)
  if err != nil {
    panic(err)
  }
  defer panicIf(rows.Close())

  fn(rows)

  // If the database is being written to ensure to check for Close
  // errors that may be returned from the driver. The query may
  // encounter an auto-commit error and be forced to rollback changes.
  closeErr := rows.Close()
  if closeErr != nil {
    log.Fatal(closeErr)
  }

  // Rows.Err will report the last error encountered by Rows.Scan.
  if err := rows.Err(); err != nil {
    log.Fatal(err)
  }
  err = tx.Commit()
  if err != nil {
    panic(err)
  }
}
