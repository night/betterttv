/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2015-05-07.2
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/* global self */
/* global safari */
/* jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/* ! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
    'use strict';
    // IE <10 is explicitly unsupported
    if (typeof navigator !== 'undefined' && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var
        doc = view.document,
        // only get URL when necessary in case Blob.js hasn't overridden it yet
        getURL = function() {
            return view.URL || view.webkitURL || view;
        },
        saveLink = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
        canUseSaveLink = 'download' in saveLink,
        click = function(node) {
            var event = doc.createEvent('MouseEvents');
            event.initMouseEvent(
                'click', true, false, view, 0, 0, 0, 0, 0
                , false, false, false, false, 0, null
            );
            node.dispatchEvent(event);
        },
        webkitReqFS = view.webkitRequestFileSystem,
        reqFS = view.requestFileSystem || webkitReqFS || view.mozRequestFileSystem,
        throwOutside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
                throw ex;
            }, 0);
        },
        forceSavableType = 'application/octet-stream',
        fsMinSize = 0,
        // See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
        // https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
        // for the reasoning behind the timeout and revocation flow
        arbitraryRevokeTimeout = 500, // in ms
        revoke = function(file) {
            var revoker = function() {
                if (typeof file === 'string') { // file is an object URL
                    getURL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            if (view.chrome) {
                revoker();
            } else {
                setTimeout(revoker, arbitraryRevokeTimeout);
            }
        },
        dispatch = function(filesaver, eventTypes, event) {
            eventTypes = [].concat(eventTypes);
            var i = eventTypes.length;
            while (i--) {
                var listener = filesaver['on' + eventTypes[i]];
                if (typeof listener === 'function') {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throwOutside(ex);
                    }
                }
            }
        },
        autoBom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob(['\ufeff', blob], {type: blob.type});
            }
            return blob;
        },
        FileSaver = function(blob, name) {
            blob = autoBom(blob);
            // First try a.download, then web filesystem, then object URLs
            var
                filesaver = this,
                type = blob.type,
                blobChanged = false,
                objectUrl,
                targetView,
                dispatchAll = function() {
                    dispatch(filesaver, 'writestart progress write writeend'.split(' '));
                },
                // on any filesys errors revert to saving with object URLs
                fsError = function() {
                    // don't create more object URLs than needed
                    if (blobChanged || !objectUrl) {
                        objectUrl = getURL().createObjectURL(blob);
                    }
                    if (targetView) {
                        targetView.location.href = objectUrl;
                    } else {
                        var newTab = view.open(objectUrl, '_blank');
                        if (newTab === undefined && typeof safari !== 'undefined') {
                            // Apple do not allow window.open, see http://bit.ly/1kZffRI
                            view.location.href = objectUrl;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatchAll();
                    revoke(objectUrl);
                },
                abortable = function(func) {
                    return function() {
                        if (filesaver.readyState !== filesaver.DONE) {
                            return func.apply(this, arguments);
                        }
                    };
                },
                createIfNotFound = {create: true, exclusive: false},
                slice
            ;
            filesaver.readyState = filesaver.INIT;
            if (!name) {
                name = 'download';
            }
            if (canUseSaveLink) {
                objectUrl = getURL().createObjectURL(blob);
                saveLink.href = objectUrl;
                saveLink.download = name;
                click(saveLink);
                filesaver.readyState = filesaver.DONE;
                dispatchAll();
                revoke(objectUrl);
                return;
            }
            // Object and web filesystem URLs have a problem saving in Google Chrome when
            // viewed in a tab, so I force save with application/octet-stream
            // http://code.google.com/p/chromium/issues/detail?id=91158
            // Update: Google errantly closed 91158, I submitted it again:
            // https://code.google.com/p/chromium/issues/detail?id=389642
            if (view.chrome && type && type !== forceSavableType) {
                slice = blob.slice || blob.webkitSlice;
                blob = slice.call(blob, 0, blob.size, forceSavableType);
                blobChanged = true;
            }
            // Since I can't be sure that the guessed media type will trigger a download
            // in WebKit, I append .download to the filename.
            // https://bugs.webkit.org/show_bug.cgi?id=65440
            if (webkitReqFS && name !== 'download') {
                name += '.download';
            }
            if (type === forceSavableType || webkitReqFS) {
                targetView = view;
            }
            if (!reqFS) {
                fsError();
                return;
            }
            fsMinSize += blob.size;
            reqFS(view.TEMPORARY, fsMinSize, abortable(function(fs) {
                fs.root.getDirectory('saved', createIfNotFound, abortable(function(dir) {
                    var save = function() {
                        dir.getFile(name, createIfNotFound, abortable(function(file) {
                            file.createWriter(abortable(function(writer) {
                                writer.onwriteend = function(event) {
                                    targetView.location.href = file.toURL();
                                    filesaver.readyState = filesaver.DONE;
                                    dispatch(filesaver, 'writeend', event);
                                    revoke(file);
                                };
                                writer.onerror = function() {
                                    var error = writer.error;
                                    if (error.code !== error.ABORT_ERR) {
                                        fsError();
                                    }
                                };
                                'writestart progress write abort'.split(' ').forEach(function(event) {
                                    writer['on' + event] = filesaver['on' + event];
                                });
                                writer.write(blob);
                                filesaver.abort = function() {
                                    writer.abort();
                                    filesaver.readyState = filesaver.DONE;
                                };
                                filesaver.readyState = filesaver.WRITING;
                            }), fsError);
                        }), fsError);
                    };
                    dir.getFile(name, {create: false}, abortable(function(file) {
                        // delete file if it already exists
                        file.remove();
                        save();
                    }), abortable(function(ex) {
                        if (ex.code === ex.NOT_FOUND_ERR) {
                            save();
                        } else {
                            fsError();
                        }
                    }));
                }), fsError);
            }), fsError);
        },
        FSProto = FileSaver.prototype,
        saveAs = function(blob, name) {
            return new FileSaver(blob, name);
        };
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name) {
            return navigator.msSaveOrOpenBlob(autoBom(blob), name);
        };
    }

    FSProto.abort = function() {
        var filesaver = this;
        filesaver.readyState = filesaver.DONE;
        dispatch(filesaver, "abort");
    };
    FSProto.readyState = FSProto.INIT = 0;
    FSProto.WRITING = 1;
    FSProto.DONE = 2;

    FSProto.error =
    FSProto.onwritestart =
    FSProto.onprogress =
    FSProto.onwrite =
    FSProto.onabort =
    FSProto.onerror =
    FSProto.onwriteend =
        null;

    return saveAs;
}(
       typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}
