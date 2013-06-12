fs = require('fs')
minify = require('./buildengine/minify').minify
exec = require('child_process').exec
convert = require('./converter/convert').convert
copyLibs = require('./buildengine/copyLibs').copyLibs

# Run a command and exit with an error message if it fails.
runCommand = (cmd, callback) ->
	exec cmd, (error, stdout, stderr) ->
		if error != null
			console.log stderr
			console.log 'Command failed: ' + cmd
			process.exit(1)
		if callback
			callback()


task 'minify', 'Minifies the whole project, or only one file if given two arguments', (options) ->

	if options.arguments.length == 2
		fileIn = options.arguments[0]
		fileOut = options.arguments[1]

		console.log "minifying #{fileIn}"
		minify(fileIn, fileOut, true);
	else 	
		console.log 'minifying'
		fileIn = 'src'
		fileOut = 'minified/goo/goo.js'
		includefile = 'buildengine/glob/minify.glob'
	
		minify(fileIn, fileOut, true, includefile)	
		
		source = 'lib'
		target = 'minified/goo/lib'
		includeFile = 'buildengine/glob/copy.glob'
		copyLibs(source, target, includeFile)


task 'testserver', 'Start Testacular server', (options) ->
	server = require('testacular').server
	server.start(configFile: 'test/testacular.conf.js')

task 'testmin', 'Start Testacular server for minified engine', ->
	server = require('testacular').server
	server.start(configFile: 'test/testacular-min.conf.js')
	
option '-o', '--output [FILE]', 'Outputfile'

task 'checkstyle', 'Run JSHint', (options) ->
	# I'm not sure that the cli module is official,
	# but it's a convenient way of running JSHint
	# with the same config files (.jshintrc and .jshintignore)
	# as when running from the command-line.
	cli = require('jshint/src/cli/cli')
	
	if options.arguments[1]
		files = options.arguments[1]
	else
		files = "src/ test/"
		
	cmdopts = cli.interpret("jshint --reporter=tools/jshint-reporter.js #{files}")

task 'whitespace',
	'Removes trailing whitespace in source files. Requires find, xargs and sed commands.',
	(options) ->
		dirs = ['src', 'test', 'examples']
		do next = ->
			dir = dirs.shift()
			runCommand "find #{dir} -type f -name '*.js' | xargs sed --in-place -r 's/\\s+$//'", ->
				if dirs.length
					next()

task 'checkstyleforjenkins', 'Run JSHint to XML', (options) ->
	# I'm not sure that the cli module is official,
	# but it's a convenient way of running JSHint
	# with the same config files (.jshintrc and .jshintignore)
	# as when running from the command-line.
	cli = require('jshint/src/cli/cli')
	cmdopts = cli.interpret('jshint --reporter=checkstyle src/ test/')

task 'init-git', 'Install the precommit script', (options) ->
	fs.writeFile '.git/hooks/pre-commit', '#!/bin/sh\nexec node tools/pre-commit.js\n'
	
task 'convert',
	"Converts a file from old json structure to new directory-json structure.\nUse cake convert [inputFile] [outputDirectory].",
	(options) ->		
		if options.arguments.length != 4
			console.log 'Wrong paramaters, use cake convert [inputFile] [outputDirectory] [objectname]'
		else
			convert options.arguments[1], options.arguments[2], options.arguments[3]
			console.log "#{options.arguments[1]} converted"
		process.exit(0)

task 'jsdoc',
	'Creates the API documentation',
	->
		# This requires a shell.
		# To make this work in Windows too,
		# we could run JSdoc as a Node module.
		runCommand 'tools/generate_jsdoc.sh'




