import pystache
import json
from py import util

def generateResume():
	tmplPage = util.loadFile("templates/page.html")
	tmplContents = util.loadFile("templates/contents_resume.html")
	defResume = json.loads(util.loadFile("definitions/resume.json"))

	genContents = pystache.render(tmplContents, defResume)
	generated = pystache.render(tmplPage, {'contents': genContents})
	
	return generated