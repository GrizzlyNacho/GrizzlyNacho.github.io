import pystache
import json
from py import util

def generateCreations():
	tmplPage = util.loadFile("templates/page.html")
	tmplContents = util.loadFile("templates/contents_creations.html")
	#defResume = json.loads(util.loadFile("definitions/creations.json"))

	#genContents = pystache.render(tmplContents, defResume)
	generated = pystache.render(tmplPage, {'contents': tmplContents})
	
	return generated