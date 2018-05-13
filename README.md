BetterTTV
=========

[![Build Status](https://travis-ci.org/night/BetterTTV.svg?branch=master)](https://travis-ci.org/night/BetterTTV) [![Dependencies Status](https://david-dm.org/night/BetterTTV/status.svg)](https://david-dm.org/night/BetterTTV) [![Discord](https://discordapp.com/api/guilds/229471495087194112/widget.png)](https://discord.gg/nightdev)

Building BetterTTV
===

Getting the essentials
---
1. Install nodejs.
2. Run ```npm install``` within the BetterTTV directory.

Development
----

We use gulp to concatenate all of the files and templates into one. We include a dev module that creates a server to imitate the CDN when gulp is watching. Just run the following command from the BetterTTV directory.

```
gulp watch
```

A webserver will start and you should visit Twitch in your browser. Turn on developer mode in the console with the following:
```
BetterTTV.settings.set('developerMode', true);
```

Then refresh the page and BetterTTV should be loaded from your computer.

**Debug Messages:**

In order to receive debug messages inside the browser's console log, you must toggle the consoleLog localStorage setting.

Type this in the JavaScript console to enable console logging:
```
BetterTTV.settings.set('consoleLog', true);
```

Linting
---
We use [ESLint](http://eslint.org/) to ensure a consistent code style and avoid buggy code.

Running ```gulp``` will automatically check for any errors in the code. Please fix any errors before creating a pull request. Any warnings produced prior to your changes can be ignored.

**Live Linting with Sublime Text:**

If you use Sublime Text as your text editor, you can set it up to highlight any errors that ESLint would throw in real-time.

1. Get ESLint using ```npm install eslint```
2. Install [Sublime Package Control](https://packagecontrol.io/installation)
3. Install [SublimeLinter](http://www.sublimelinter.com/en/latest/installation.html#installing-via-pc)
4. Install [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint#linter-installation)

**Live Linting with VSCode:**

If you use VSCode as your text editor, you can set it up to highlight any errors that ESLint would throw in real-time.

1. Get ESLint using ```npm install eslint```
2. Install the ESLint extension from the extensions marketplace
