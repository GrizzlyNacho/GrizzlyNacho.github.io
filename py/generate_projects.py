import pystache
import json
from py import util

def generateProjects():
	tmplPage = util.loadFile("templates/page.html")
	tmplContents = util.loadFile("templates/contents_projects.html")
	defProjects = json.loads(util.loadFile("definitions/projects.json"))

	genContents = pystache.render(tmplContents, defProjects)
	generated = pystache.render(tmplPage, {'contents': genContents})
	
	return generated