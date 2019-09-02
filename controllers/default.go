package controllers

import (
	"fmt"

	"github.com/astaxie/beego"
)

//CommonController extends beego.Controller
type CommonController struct {
	beego.Controller
}

//ResponseData
type ResponseData struct {
	Code int16       `json:"code"`
	Msg  string      `json:"msg"`
}

//SetStatus set Status Code Header 400
func (c *CommonController) SetStatus(code int) {
	c.Ctx.Output.SetStatus(code)
}

//MainController struct
type MainController struct {
	beego.Controller
}

//Get method
func (c *MainController) Get() {

	userID := c.GetSession("UserID")
	fmt.Println(userID)
	if userID == nil {
		c.Ctx.Redirect(302, "/auth/login")
	}

	c.Layout = "layout/fullpage.html"
	c.TplName = "index.tpl"
	c.Render()
}

//IsAjax shortcut
func (c *CommonController) IsAjax() bool {
	return c.Context.Input.IsAjax()
}