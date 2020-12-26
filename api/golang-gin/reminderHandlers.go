package main

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
	"time"
)

type Reminder struct {
	Id      int     `json:"id"`
	Content string  `json:"content"`
	Done    *bool   `json:"done"`
	Due     *string `json:"due"`
}

func getReminders(c *gin.Context) {
	reminders := make([]Reminder, 0)
	scanReminders := func(rows *sql.Rows) {
		for rows.Next() {
			var r Reminder
			if err := rows.Scan(&r.Id, &r.Content, &r.Done, &r.Due); err != nil {
				log.Fatal(err)
			}
			if strings.HasSuffix(*r.Due, "Z") {
				*r.Due = (*r.Due)[:len(*r.Due)-1]
			}
			reminders = append(reminders, r)
		}
	}

	isDue := c.Query("is_due") == "1"
	query := "SELECT id, content, done, due FROM reminders"
	args := make([]interface{}, 0)

	if isDue {
		args = append(args, time.Now())
		query += fmt.Sprintf(" WHERE due < $%d", len(args))
	}

	q := c.Query("q")
	if q != "" {
		if len(args) == 0 {
			query += " WHERE"
		} else {
			query += " AND"
		}
		qq := strings.ReplaceAll(q, "*", "%")
		args = append(args, qq)
		query += fmt.Sprintf(" content ILIKE $%d", len(args))
	}
	query += " ORDER BY due ASC, id DESC"
	userScopeQuery(scanReminders, c, query, args...)

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

	if strings.HasSuffix(*due, "Z") {
		*due = (*due)[:len(*due)-1]
	}
	c.JSON(200, gin.H{
		"id":      id,
		"content": content,
		"due":     due,
		"done":    done,
	})
}

func createReminder(c *gin.Context) {
	var p Reminder
	bindErr := c.BindJSON(&p)
	panicIf(bindErr)

	mustUserScopeExec(c,
		"INSERT INTO reminders (content, done, due) VALUES ($1, $2, $3)",
		p.Content, p.Done, p.Due,
	)
	c.JSON(200, gin.H{"status": "reminder created"})
}

func patchReminder(c *gin.Context) {
	var p Reminder
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

func deleteManyReminders(c *gin.Context) {
	ids := c.Query("ids")
	if ids == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	inArgs := make([]string, 0)
	args := make([]interface{}, 0)
	for _, v := range strings.Split(ids, ",") {
		args = append(args, v)
		inArgs = append(inArgs, fmt.Sprintf("$%d", len(args)))
	}
	query := fmt.Sprintf("DELETE FROM reminders WHERE id IN (%s)", strings.Join(inArgs, ","))

	mustUserScopeExec(c, query, args...)

	c.Status(http.StatusNoContent)
}
