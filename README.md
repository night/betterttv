# <img src="src/assets/logos/logo.svg" height="40" style="margin-bottom: -1px;"> BetterTTV

[![Build Status](https://github.com/night/betterttv/actions/workflows/ci.yml/badge.svg)](https://github.com/night/betterttv/actions/workflows/ci.yml) [![Discord](https://img.shields.io/discord/229471495087194112?color=5865F2&label=discord)](https://discord.gg/nightdev) [![Crowdin](https://badges.crowdin.net/betterttv/localized.svg)](https://crowdin.com/project/betterttv)

# Building BetterTTV

## Getting the essentials

1. Install nodejs.
2. Run `npm install` within the BetterTTV directory.

## Development

We use [Vite](https://vite.dev/) to bundle all of the files and templates into one.
Just run the following command from the BetterTTV directory to start the dev server.

```
npm start
```

This builds `betterttv.js` and serves it on port 2888, rebuilding on every change and reloading the page once the rebuild finishes. Use the development version of BetterTTV on Twitch with this userscript in a script manager like TamperMonkey:

```
// ==UserScript==
// @name         BetterTTV Development
// @description  Enhances Twitch with new features, emotes, and more.
// @namespace    http://betterttv.com/
// @copyright    NightDev, LLC
// @icon         https://cdn.betterttv.net/assets/logos/bttv_logo.png
// @version      0.0.1
// @match        https://*.twitch.tv/*
// @match        https://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function betterttv() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://127.0.0.1:2888/betterttv.js';
    const head = document.getElementsByTagName('head')[0];
    if (!head) return;
    head.appendChild(script);
})()
```

Once installed you should disable BetterTTV's main extension so BetterTTV will only be loaded from your computer.

**Debug Messages:**

In order to receive debug messages inside the browser's console log, you must toggle the consoleLog localStorage setting.

Type this in the JavaScript console to enable console logging:

```
BetterTTV.settings.set('consoleLog', true);
```

## Linting

We use [ESLint](https://eslint.org/) to ensure a consistent code style and avoid buggy code.

Running `npm run lint` will automatically check for any errors in the code. Please fix any errors before creating a pull request. Any warnings produced prior to your changes can be ignored.

**Live Linting with Sublime Text:**

If you use Sublime Text as your text editor, you can set it up to highlight any errors that ESLint would throw in real-time.

1. Get ESLint using `npm install eslint`
2. Install [Sublime Package Control](https://packagecontrol.io/installation)
3. Install [SublimeLinter](https://www.sublimelinter.com/en/latest/installation.html#installing-via-pc)
4. Install [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint#linter-installation)

**Live Linting with VSCode:**

If you use VSCode as your text editor, you can set it up to highlight any errors that ESLint would throw in real-time.

1. Get ESLint using `npm install eslint`
2. Install the ESLint extension from the extensions marketplace
