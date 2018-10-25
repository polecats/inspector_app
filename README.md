# Pipe Inspection App

This is a PoC of a pipe inspection application.
You need to run this application with a backend service (refer to this link https://github.com/polecats/inspector_server)


## Important!
**This is a PoC application. Use at your own risk!**


## Table of Contents
 - [Getting Started](#getting-started)
 - [Powered By](#powered-by)
 - [Project Commands](#project-commands)
 - [Android Build Issues](#use-cases)
 - [Inspection Form Record format](#inspection-form-record-format)
 - [W.I.P](#w.i.p)

## Getting Started

* [Download the installer](https://nodejs.org/) for Node.js 6 or greater.
* Install the ionic CLI globally: `npm install -g ionic`
* Clone this repository: `git clone https://github.com/polecats/inspector_app.git`.
* Run `npm install` from the project root.
* Run `ionic serve` in a terminal from the project root.
* Make sure that the mobile application is pointing to the right backend server by going to the app's `Settings` menu and changing the server URL.

_Note: You may need to add “sudo” in front of any global commands to install the utilities._


## Powered By
This app was created and powered by
* Angular
* Ionic
* Apache Cordova
* Apple iOS
* Google Android


## Project Commands
* restore and prep
>* **ionic cordova prepare**

* run ionic server with console output and no auto browser open
>* **ionic server -c --no-open**

* build web asset
>* **ionic build**

* build android apk
>* **ionic cordova build android**
>* **ionic cordova build android --release**

* Update Ionic
>* **npm update -g ionic**

* Update Cordova CLI
>* **npm update -g cordova**

* Update Cordova Android or iOS
>* **ionic cordova platform remove android**
>* **ionic cordova platform add android@6.3.0**


## Android Build Issues
* build error
>* https://stackoverflow.com/questions/43280871/android-getting-manifest-merger-failed-error-after-updating-to-a-new-version

* cannot find symbol FileUtils etc
>* https://stackoverflow.com/questions/46551464/how-to-remove-cordova-plugin-compat



## Inspection Form Record format
~~~~
{
	'id': 'guid',
	'name':'report 1',
	'datasheet': {
		'id':'guid',
		'asset':'assetname',
		
	},
	'observation': {
		'id':'guid',
		'data':	[
			{
				'id':'guid',
				'identifier':'id',
				'location':'loc',
				'findings':[
					'notes 1', 'notes 2',...
				],
				'recommendation': [
					'notes 1', 'notes 2'...
				],
				'photos': [
					'base64', 'base64'...
				]
			},
			...
		]
	}
	'drawings': {
		'id':'guid',
		'format':type-id,
		'data': 'base64'
	}
}
~~~~

## W.I.P
Drawing tools still buggy and need some fine-tuned virtual controllers

