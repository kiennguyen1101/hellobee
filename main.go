package main

import (
	"fmt"
	"hellobee/helpers"
	"hellobee/models"
	_ "hellobee/routers"

	"github.com/astaxie/beego"
	_ "github.com/astaxie/beego/session/mysql"
	"github.com/volatiletech/sqlboiler/boil"
)

func main() {

	var err error

	if beego.AppConfig.String("runmode") == "dev" {
		boil.DebugMode = true
	}

	models.DB, err = models.InitDB("mysql", "cbidev:cbidev@/beego?parseTime=true")

	if err != nil {
		fmt.Println("Error initializing database!")
		return
	}

	beego.BConfig.WebConfig.Session.SessionProvider = "mysql"
	beego.BConfig.WebConfig.Session.SessionProviderConfig = "cbidev:cbidev@/beego?parseTime=true"

	beego.SetStaticPath(helpers.StaticDir, "static")
	// fmt.Println(beego.AppConfig.String("runmode"))
	beego.AddFuncMap("getAsset", helpers.GetAsset)
	beego.AddFuncMap("loadStyleAsync", helpers.LoadStyleAsync)
	beego.AddFuncMap("getConfigString", helpers.GetConfigString)
	beego.Run()
}
