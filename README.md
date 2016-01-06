# Topdown Game Demo using Phaser.js

A simple topdown game demo using the Phaser game development framework. She's a work in progress so is by no means done. 

Resolution of the canvas is scaled by 200% to show off the beautiful pixels. This can be changed in-code.

Copy the frameworks files over to your project folder. Node and Bower are required. Make sure it includes these files:

* gulpfile.js
* .gitignore
* .jshintignore
* .bowerrc
* bower.json
* config.json
* package.json


### config.json

	dest :  your_destination_folder_for_your_compiled_files
	assets : your_assets_folder - leave blank tot put images,css,js,videos,fonts in the root. !! You will need to manually move the src assets to this folder.
	hostname :  enter_your_server_hostname
	env : dev (options are: dev, tst, prd)


## Install Dependencies

In your project folder run [sudo] **npm install** and [sudo] **bower install**.


## Gulp

Run **gulp dev** in your project folder to kickoff browsersync, jshint and sass watching.

Run **gulp build** to compile all assets and compress images
