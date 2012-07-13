APMPlayer
=========

APMPlayer is a modern javascript media player framework developed
to be a single media player library API to serve all APMG audio content.

APMPlayer supports both static audio and live audio streaming officially.
The library also contains stubs to facilitate the addition of video playables
in the future.

The library has been tested mostly with static MP3 audio playback, AAC+
live streaming over RTMP, and MP3 live streaming over HTML5.  A variety of
playback mechanisms are supported (flash streaming via RTMP, progressive download
over flash, and HTML5 audio playback).  The player will automatically use the
most optimal mechanism based on browser, plugins available, and files provided.


Required Dependencies
---------------------
* JQuery -- tested and works with version 1.4 - 1.7


Included Dependencies
---------------------
All third party libraries can be found in directories starting with /lib,
and are packaged as part of this release:

* SoundManager2 -- V2.97a.20120527 is the current release bundled as part
of APMPlayer.  SoundManager2 handles all of the low-level playback,
HTML5, as well as flash streaming mechanisms over RTMP.
file: /script/lib/soundmanager2-jsmin.js
file: /script/lib/swf/*

* JQueryUI Slider -- main library used for scrubber and volume bar.
file: /script/lib/jquery-ui-slider.custom.min.js

* Modernizr -- backwards compatibility for non-HTML5 and CSS3 browsers.
file: /script/lib/modernizr-2.5.3-custom.min.js

* QUnit -- javascript unit testing framework.


Project structure
-----------------
* /docs/ -  API + UML documentation.
* /examples/ - piles of examples, with relative paths to libs for ease of dev
* /script/ - location of all js library files, including 3rd-party /lib files
* /skin/ - location of all css, sprites and files associated with UI.
* /test/ - project unit tests, using qUnit (jQuery testing framework)
* /util/ - utility/non-js scripts.  currently includes a simple PHP script
to force a prompt for file downloads.

Major Components Overview
-------------------------
Player functionality and display generally consists of these three major
components:

* APMPlayer_UI -- handles all of the display-related logic and provides
the glue between HTML and APMPlayer.  This is a JQuery plugin or 'fn' and
requires JQuery to work (see /docs + /examples)

* APMPlayer -- APMPlayer is a wrapper to SoundManager2 that handles
playback based on supported Playable type (eg, audio; live_audio).  file:
/script/apmplayer.js  APMPlayerFactory is also part of apmplayer.js and is a
factory pattern which provides a singleton version of APMPlayer, a Playlist,
a Playable creator, and a basic Underwriting module (see /docs)

* SoundManager2 -- handles all of the lower-level playback capabilities.
This version includes the soundManager2 V2.97a.20120527 release.  located in
/script/lib/.


License: BSD-3
--------------
The application  and is licensed under
APMPlayer was developed by American Public Media and is released under
the BSD-3 license.  Please see the license.bp for acceptable boilerplates
included in the headers of all files throughout the project.
