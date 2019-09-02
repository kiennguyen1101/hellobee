package controllers

import (
	"context"
	"fmt"
	"hellobee/models"

	"html/template"

	"github.com/astaxie/beego"
	// "github.com/volatiletech/sqlboiler/boil"
	. "github.com/volatiletech/sqlboiler/queries/qm"
	"golang.org/x/crypto/bcrypt"
)

type userLoginData struct {
	Username string `form:"username"`
	Password string `form:"password"`
}

type sessionData struct {
	User  *models.User `json:"user"`
	Token string       `json:"token"`
}

type loginResponse struct {
	ResponseData
	Data sessionData `json:"data"`
}

//LoginController handle authentication
type LoginController struct {
	CommonController
}

//HashPassword hash password string
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 4)
	return string(bytes), err
}

//CheckPasswordHash check password
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

//Prepare common values
func (c *LoginController) Prepare() {
	c.Layout = "layout/auth_fullpage.html"
	c.TplName = "auth/login.html"
	c.LayoutSections = make(map[string]string)
	c.LayoutSections["Scripts"] = "auth/_login_scripts.html"
}

//Get method
func (c *LoginController) Get() {
	//c.EnableXSRF = false
	c.Data["xsrfField"] = template.HTML(c.XSRFFormHTML())
	c.Data["xsrfToken"] = c.XSRFToken()
	c.Data["Title"] = "Login"
	c.Render()
}

//Post method
func (c *LoginController) Post() {

	loginData := userLoginData{}
	invalidMsg := "User name or password is incorrect!"

	//c.Context.Input.IsAjax() bool
	if err := c.ParseForm(&loginData); err != nil {
		c.Data["json"] = loginResponse{ResponseData{400, "Invalid Request Data"}, sessionData{}}
		c.ServeJSON()
	}

	ctx := context.Background()

	user, err := models.Users(Where("username=?", loginData.Username)).One(ctx, models.DB)

	if user == nil {
		fmt.Println(err)
		c.SetStatus(400)
		c.Data["json"] = loginResponse{ResponseData{404, invalidMsg}, sessionData{}}
		c.ServeJSON()
		if err != nil {
			fmt.Println("err: ", err)
		}
	}

	if CheckPasswordHash(loginData.Password, user.Password) {
		token := fmt.Sprintf("%d%s", user.ID, beego.AppConfig.String("SessionHashKey"))
		hashed, _ := HashPassword(token)
		c.SetSession("UserID", user.ID)
		c.SetSession("Token", hashed)
		user.Password = ""
		c.Data["json"] = loginResponse{ResponseData{200, fmt.Sprintf("Welcome back, %s", user.Email)}, sessionData{user, string(hashed)}}
		c.ServeJSON()
		// c.Redirect("/", 200)
	} else {
		c.SetStatus(400)
		c.Data["json"] = loginResponse{ResponseData{404, invalidMsg}, sessionData{}}
		c.ServeJSON()
	}

}
