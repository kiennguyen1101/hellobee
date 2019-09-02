package routers

import (
	"hellobee/controllers"

	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/home", &controllers.MainController{})
	beego.Router("/auth/login", &controllers.LoginController{})
	beego.Router("/auth/forgotpassword", &controllers.ForgotPasswordController{})
}
