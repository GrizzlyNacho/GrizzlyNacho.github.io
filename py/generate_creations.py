import pystache
import json
from py import util

def generateCreations():
	tmplPage = util.loadFile("templates/page.html")
	tmplContents = util.loadFile("templates/contents_creations.html")
	defCreations = json.loads(util.loadFile("definitions/creations.json"))

	genContents = pystache.render(tmplContents, defCreations)
	generated = pystache.render(tmplPage, {'contents': genContents})
	
	return generated