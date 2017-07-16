import html

# Return an entire file.
def loadFile(filePath):
	fHandle = open(filePath, 'r')
	toReturn = fHandle.read()
	fHandle.close()
	return toReturn

def writeHTMLFile(filePath, contents):
	fHandle = open(filePath, 'w')
	fHandle.write(html.unescape(contents))
	fHandle.close()
	return