BetterTTV
=========

>
>  Copyright (c) 2014 NightDev
>
>
>  Permission is hereby granted, free of charge, to any person obtaining a copy
>
>  of this software and associated documentation files (the "Software"), to deal
>
>  in the Software without limitation of the rights to use, copy, modify, merge,
>
>  and/or publish copies of the Software, and to permit persons to whom the
>
>  Software is furnished to do so, subject to the following conditions:
>
>
>  The above copyright notice, any copyright notices herein, and this permission
>
>  notice shall be included in all copies or substantial portions of the Software,
>
>  the Software, or portions of the Software, may not be sold for profit, and the
>
>  Software may not be distributed nor sub-licensed without explicit permission
>
>  from the copyright owner.
>
>
>  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>
>  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>
>  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>
>  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>
>  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>
>  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
>
>  THE SOFTWARE.
>
>
>  Should any questions arise concerning your usage of this Software, or to
>
>  request permission to distribute this Software, please contact the copyright
>
>  holder at http://nightdev.com/contact
>
>
>  ---------------------------------
> 
>
>   Unofficial TLDR:
>
>   Free to modify for personal use
>
>   Need permission to distribute the code
>
>   Can't sell addon or features of the addon
>

Building BetterTTV
===

Getting the essentials
---
1. Install nodejs.
2. Run ```npm install``` within the BetterTTV directory.

Gulp
---
We use gulp to concatenate all of the files and templates into one. You can either make gulp watch for changes or run it manually.

From the BetterTTV directory, run
```
gulp
```
or
```
gulp watch
```

Testing
----

We include a test module that creates a server to imitate the CDN.

To use it, we must first modify the hosts file on your computer.

**on *nix:**
```
echo "127.0.0.1 cdn.betterttv.net" | sudo tee -a /etc/hosts
```

**on Windows:**

add ```127.0.0.1 cdn.betterttv.net``` to ```%SystemRoot%\system32\drivers\etc\hosts```

Now just run the following command from the BetterTTV directory.

**on *nix:**
```
sudo npm test
```

**on Windows you need an elevated command prompt:**
```
npm test
```

A webserver will start and you can visit Twitch in your browser and browse normally. Files not included in the repo are pulled from the actual server, so everything works.