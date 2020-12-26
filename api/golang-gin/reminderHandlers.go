package main

import (
  "database/sql"
  "fmt"
  "github.com/gin-gonic/gin"
  "log"
)

type ReminderParams struct {
  Content string
  Done    *bool
  Due     *string
}

func getReminders(c *gin.Context) {
  //reminders := make([]Reminder, 0)
  var reminders []ReminderParams
  scanReminders := func(rows *sql.Rows) {
    for rows.Next() {
      var reminder ReminderParams
      if err := rows.Scan(&reminder); err != nil {
        log.Fatal(err)
      }
      reminders = append(reminders, reminder)
    }
  }

  userScopeQuery(scanReminders, c, "SELECT * FROM reminders LIMIT $1", 10)

  c.JSON(200, gin.H{"items": reminders})
}

func getReminder(c *gin.Context) {

  var id int
  var content string
  var done *bool
  var due *string
  scanRow := func(row *sql.Row) error {
    return row.Scan(&id, &content, &done, &due)
  }

  mustUserScopeQueryRow(scanRow, c,
    // language=PostgreSQL
    "SELECT id, content, done, due FROM reminders WHERE id = $1", c.Param("id"))

  c.JSON(200, gin.H{
    "id": id,
    "content": content,
    "due": due,
    "done": done,
  })
}

func createReminder(c *gin.Context) {
  var p ReminderParams
  bindErr := c.BindJSON(&p)
  panicIf(bindErr)

  mustUserScopeExec(c,
    "INSERT INTO reminders (content, done, due) VALUES ($1, $2, $3)",
    p.Content, p.Done, p.Due,
  )
  c.JSON(200, gin.H{"status": "reminder created"})
}

func patchReminder(c *gin.Context) {
  var p ReminderParams
  bindErr := c.BindJSON(&p)
  panicIf(bindErr)

  args := make([]interface{}, 0)

  frag := "UPDATE reminders SET"
  frag, args = addToSetParamsIf(p.Content != "", "content", p.Content, frag, args)
  frag, args = addToSetParamsIf(p.Done != nil, "done", p.Done, frag, args)
  frag, args = addToSetParamsIf(p.Due != nil, "due", p.Due, frag, args)
  frag = frag[:len(frag)-1] // remove trailing comma

  id := c.Param("id")
  args = append(args, id)
  frag += fmt.Sprintf(" WHERE id = $%d", len(args))

  mustUserScopeExec(c, frag, args...)

  c.JSON(200, gin.H{
    "status":  "reminder updated",
    "params":  p,
    "sql":     frag,
    "sqlArgs": args,
  })
}

// Idempotent, not checking if actually deleting anything
func deleteReminder(c *gin.Context) {
  id := c.Param("id")

  // language=PostgreSQL
  mustUserScopeExec(c, "DELETE FROM reminders WHERE id=$1", id)

  c.JSON(200, gin.H{
    "status": "delete OK",
  })
}
