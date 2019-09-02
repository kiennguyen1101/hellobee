package controllers

import (
	"html/template"
)

//ForgotPasswordController handle forgotpassword
type ForgotPasswordController struct {
	CommonController
}

type forgotPasswordForm struct {
	Email string `form:"email"`
}

type forgotPasswordResponse struct {
	ResponseData
	Data string `json:"data"`
}

//Prepare common values
func (c *ForgotPasswordController) Prepare() {
	c.Layout = "layout/auth_fullpage.html"
	c.TplName = "auth/forgotpassword.html"
	//c.EnableXSRF = false
	c.Data["xsrfField"] = template.HTML(c.XSRFFormHTML())
	c.Data["xsrfToken"] = c.XSRFToken()
	c.Data["Title"] = "Recover Password"
	c.LayoutSections = make(map[string]string)
	c.LayoutSections["Scripts"] = "auth/_forgotpassword_scripts.html"
}

//Get method
func (c *ForgotPasswordController) Get() {
	c.Render()
}

//Post method
func (c *ForgotPasswordController) Post() {
	form := forgotPasswordForm{}

	if c.IsAjax() {
		if err := c.ParseForm(&loginData); err != nil {
			c.Data["json"] = loginResponse{ResponseData{400, "Invalid Request Data"}, sessionData{}}
			c.ServeJSON()
		}
	} else {
		c.Render()
	}

}
