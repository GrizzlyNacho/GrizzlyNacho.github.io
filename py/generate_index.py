import pystache
from py import util

def generateIndex():
	tmplPage = util.loadFile("templates/page.html")
	tmplContents = util.loadFile("templates/contents_index.html")
	generated = pystache.render(tmplPage, {'contents': tmplContents})
	return generated