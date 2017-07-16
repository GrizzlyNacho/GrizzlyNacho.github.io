import pystache
from py import util

def generateResume():
	tmplPage = util.loadFile("templates/page.html")
	tmplContents = util.loadFile("templates/contents_resume.html")
	generated = pystache.render(tmplPage, {'contents': tmplContents})
	return generated