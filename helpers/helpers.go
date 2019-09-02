package helpers

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

var StaticDir = "/static"

func getFileFullName(filename string, ext string) string {
	pathS, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	var file string
	filepath.Walk(filepath.Join(pathS, "static"), func(path string, f os.FileInfo, _ error) error {
		if !f.IsDir() {
			if strings.HasSuffix(filepath.Ext(path), ext) {
				if strings.HasPrefix(f.Name(), filename) {
					file = f.Name()
				}
			}
		}
		return nil
	})
	return file
}

func getLink(in string) string {
	files := strings.Split(in, ".")
	fullName := getFileFullName(files[0], files[len(files)-1])
	href := fmt.Sprintf(StaticDir + "/" + fullName)
	fmt.Println(href)
	return href
}

//GetAsset get full asset file name with hash given the original name and extension in template
func GetAsset(in string) (out string) {
	return getLink(in)
}

//GetConfigString get config string in tempate
func GetConfigString(in string) (out string) {
	out = beego.AppConfig.String(in)
	return out
}

//LoadStyleAsync is a helper to return Link tag with media=none
func LoadStyleAsync(in string) (out string) {
	out = fmt.Sprintf("<link rel='stylesheet' href='%s' media='none' onload=%s>", in, "if(media!='all')media='all'")
	return out
}
