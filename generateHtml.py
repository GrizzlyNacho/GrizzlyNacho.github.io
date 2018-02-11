from py import *

# Wrapper to build the webpage

index = generate_index.generateIndex()
util.writeHTMLFile("index.html", index)

resume = generate_resume.generateResume()
util.writeHTMLFile("resume.html", resume)

creations = generate_creations.generateCreations()
util.writeHTMLFile("creations.html", creations)

projects = generate_projects.generateProjects()
util.writeHTMLFile("projects.html", projects)