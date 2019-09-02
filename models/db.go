package models

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB(dbtype string, dataSourceName string) (*sql.DB, error) {
	DB, err := sql.Open(dbtype, dataSourceName)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return DB, nil
}
