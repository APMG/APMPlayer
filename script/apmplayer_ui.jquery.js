/*********************************************************************************
 *
 *   Copyright (c) 2012, American Public Media Group
 *
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *   - Neither the name of the American Public Media Group nor the names of
 *     its contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *   AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *   IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *   ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 *   LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 *   OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 *   SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 *   INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 *   CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *   ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *   POSSIBILITY OF SUCH DAMAGE.
 *
 **********************************************************************************/
/**
 * @name apmplayer_ui.jquery.js
 * @fileOverview
 * @description main user-interface integration between jQuery and APMPlayer.
 * contains first the main object supporting integration w/ APMPlayers
 * and second the $.fn.apmplayer_ui definition
 */
(function ($) {

    'use strict';

    /**
     * APMPlayerUI
     * User-interface integration w/ APMPlayer that supports $.fn.apmplayer_ui
     * Current version of $.fn.apmplayer_ui only allows a single instance of the UI at a time
     */
    var APMPlayerUI = function (jq_element, jq_args) {

        var player_ui = this;

        this.parent_id = '#' + jq_element.attr('id');
        this.args = jq_args;

        this.init = function () {
            player_ui.main.init();
            player_ui.controls.init();
            player_ui.events.init();
            player_ui.playlist.init();
        };

        this.main = {
            settings : {
                autoplay      : false,   //defaults, can be overridden on player init()
                muted         : false,
                fetchMetadata : false,
                volume        : 0.9
            },
            isReady : false,
            init : function () {
                if (player_ui.args.hasOwnProperty('settings')) {
                    player_ui.main.mergeSettings(player_ui.args.settings);
                }
                if (player_ui.main.settings.autoplay === true
                        && player_ui.main.settings.fetchMetadata === true) {
                    player_ui.main.settings.autoplay = 'wait';  //this resolves the race-condition to make sure fetchMetadata call completes before autoplay occurs.
                }
            },
            mergeSettings : function (settings) {
                var prop;
                for (prop in settings) {
                    if (settings.hasOwnProperty(prop)
                            && player_ui.main.settings.hasOwnProperty(prop)) {
                        player_ui.main.settings[prop] = settings[prop];
                    }
                }
            },
            canAutoPlay : function () {
                if (player_ui.main.settings.autoplay === true
                        && APMPlayer.mechanism.getCurrentSolution() !== APMPlayer.mechanism.type.HTML5
                        && player_ui.main.isReady === true) {
                    return true;
                }
                return false;
            },
            updateAutoPlay : function (playable) {
                var current_playable = player_ui.playlist.current();
                if (current_playable.identifier === playable.identifier
                        && player_ui.main.settings.autoplay === 'wait') {
                    player_ui.main.settings.autoplay = true;
                }
            },
            fetchMetadata : function (playable) {
                //something like this is used by APMG to get metadata, duration, other info about a playable before it starts playing.
                //for this version, it simply by-passes the API call and passes through to the callback directly

                player_ui.events.onFetchMetadata(playable);

                //example similar to the API call used by APMG:
                //$.getJSON('http://mywebservice.org/api/audio/metadata/?callback=?', 'id=' + playable.identifier, player_ui.events.onFetchMetadata);
            }
        };

        this.skin = {
            /**
             * holds map of css
             * (potentially overridable down the road if differing id's/class names are desired)
             */
            css : {
                play: "apm_player_play",
                pause: "apm_player_pause",
                seeker: "apm_player_bar",
                seekerBufferingCls: "buffering",
                seekerLoading: "apm_player_loading",
                liveStreamingCls: "streaming",
                volumeWrapper: "apm_player_volume_wrapper",
                volumeMutedCls: "muted",
                volumeBar: "apm_volume_bar",
                volumeBarWrapper: "apm_player_volume_slider_wrapper",
                volumeStatus: "apm_player_volume_status",
                info: "apm_player_info",
                status: "apm_player_status",
                statusWarningCls: "warning",
                statusAlertCls: "alert",
                playtime: "apm_player_playtime",
                playlist: "apm_playlist",
                playlistNowPlayingCls: "nowplaying",
                sponsorOverlayActiveCls: "preroll-active",
                sponsorOverlayInactiveCls: "preroll-inactive",
                sponsorTimer: "apm_sponsor_overlay_time",
                sharingTools: "apm_sharing_tools",
                sharingTabControls: "apm_sharing_tab_controls",
                sharingTabCls: "apm_sharing_tab",
                sharingTabSharing: "apm_sharing_share",
                sharingTabDownload: "apm_sharing_download",
                sharingTabEmbed: "apm_sharing_embed",
                sharingTabLink: "apm_sharing_link"
            }
        };

        this.controls = {
            /**
             * registers jQuery events, listens for interactions w/ skin + inits jQuery sliders, etc
             */
            init : function () {
                player_ui.controls.seeker.init();
                player_ui.controls.info.init();
                player_ui.controls.volume.init();
                player_ui.controls.volumeStatus.init();
                player_ui.controls.pause.init();
                player_ui.controls.play.init();
                player_ui.controls.tools.init();
            },
            play : {
                init : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.play).click(function () {
                        APMPlayer.play(player_ui.playlist.current(), player_ui.main.settings);
                    });
                }
            },
            pause : {
                init : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.pause).click(function () {
                        APMPlayer.pause();   // note, this will force an unload of playable in APMPlayer internally
                    });                      // if it's type === LIVE_AUDIO (conserves BW)
                }
            },
            seeker : {
                status : 'NORMAL',  //or USER_SLIDING
                init : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).slider({
                        disabled: true,
                        range: "min",
                        start: function (event, ui) {
                            player_ui.controls.seeker.status = 'USER_SLIDING';
                        },
                        stop: function (event, ui) {
                            player_ui.events.onSeek(ui.value / 100);
                            player_ui.controls.seeker.status = 'NORMAL';
                        },
                        slide: function (event, ui) {
                            player_ui.controls.seeker.status = 'USER_SLIDING';
                            var current_playable = player_ui.playlist.current();
                            current_playable.position = (ui.value / 100) * current_playable.duration;
                            player_ui.controls.playtime.render(current_playable);
                        }
                    });
                },
                update : function (playable) {
                    if (player_ui.controls.seeker.status === 'NORMAL') {   //don't slide if user_sliding
                        var percent = 100 * playable.percent_played;
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).slider('value', percent);
                    }
                    if(playable.percent_loaded <= 1) {
                        var percent_num = 100 * (playable.percent_loaded);
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.seekerLoading).width(percent_num + '%');
                    }
                },
                enable : function () {
                    if (player_ui.playlist.current().type !== APMPlayer.mediaTypes.LIVE_AUDIO) {
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).slider('enable');
                    }
                },
                disable : function () {
                    if (player_ui.playlist.current().type === APMPlayer.mediaTypes.LIVE_AUDIO) {
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).slider('disable');
                    }
                },
                reset : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).slider('value', 0);
                },
                configure : function (playable) {
                    player_ui.controls.seeker.reset();
                    if(playable.type === APMPlayer.mediaTypes.LIVE_AUDIO) {
                        player_ui.controls.seeker.disable();
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).addClass(player_ui.skin.css.liveStreamingCls);
                    } else {
                        if(playable.duration > 0) {
                            player_ui.controls.seeker.enable();
                        }
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).removeClass(player_ui.skin.css.liveStreamingCls);
                    }
                }
            },
            playtime : {
                convertToTime : function (miliseconds) {
                    var myTime = new Date(miliseconds),
                        hour = myTime.getUTCHours(),
                        min = myTime.getUTCMinutes(),
                        sec = myTime.getUTCSeconds(),
                        strHour = hour,
                        strMin = (strHour > 0 && min < 10) ? '0' + min : min,
                        strSec = (sec < 10) ? '0' + sec : sec;

                    return ((strHour > 0) ? strHour + ':' : '') + (strMin + ':') + (strSec);
                },
                render : function (playable) {
                    var time_display;
                    if (playable.duration > 0) {
                        time_display = player_ui.controls.playtime.convertToTime(playable.position) + ' / ' + player_ui.controls.playtime.convertToTime(playable.duration);
                    } else {
                        time_display = player_ui.controls.playtime.convertToTime(playable.position);
                    }
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.playtime).text(time_display);
                }
            },
            volume : {
                init : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeBar).slider({
                        range: 'min',
                        orientation: 'vertical',
                        value : player_ui.main.settings.volume * 100,
                        stop : function (event, ui) {
                            APMPlayer.setVolume(ui.value / 100);
                            if (ui.value > 0) {
                                if (player_ui.main.settings.muted) {
                                    APMPlayer.unmute();
                                    player_ui.controls.volumeStatus.renderUnmuted();
                                    player_ui.main.settings.muted = false;
                                }
                            }
                        }
                    });

                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeWrapper).hover(function(){
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeBarWrapper).show();
                    },
                    function(){
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeBarWrapper).fadeOut(500);
                    });
                },
                renderMuted : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeBar).slider('value', 0);
                },
                renderUnmuted : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeBar).slider('value', player_ui.main.settings.volume * 100);
                }
            },
            volumeStatus : {
                init : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeStatus).click(function () {
                        if (player_ui.main.settings.muted) {
                            APMPlayer.unmute();
                            player_ui.main.settings.muted = false;
                            player_ui.controls.volume.renderUnmuted();
                            player_ui.controls.volumeStatus.renderUnmuted();
                        } else {
                            APMPlayer.mute();
                            player_ui.main.settings.muted = true;
                            player_ui.controls.volume.renderMuted();
                            player_ui.controls.volumeStatus.renderMuted();
                        }
                    });
                },
                renderMuted : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeStatus).addClass(player_ui.skin.css.volumeMutedCls);
                },
                renderUnmuted : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.volumeStatus).removeClass(player_ui.skin.css.volumeMutedCls);
                }
            },
            info : {
                init : function () {
                    if (player_ui.args.hasOwnProperty('onMetadata')) {   //bind custom event handler, if passed through $.args
                        player_ui.events.onMetadata = player_ui.args.onMetadata;
                    }
                }
            },
            status : {
                displayWarning : function (html_snippet) {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).html(html_snippet);
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).addClass(player_ui.skin.css.statusWarningCls);
                },
                displayAlert : function (html_snippet) {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).html(html_snippet);
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).addClass(player_ui.skin.css.statusAlertCls);
                },
                clearAll : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).removeClass(player_ui.skin.css.statusAlertCls);
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).removeClass(player_ui.skin.css.statusWarningCls);
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.status).html('');
                }
            },
            tools : {
                init : function () {
                    if (player_ui.args.hasOwnProperty('tools')
                            && player_ui.args.tools.hasOwnProperty('config')) {
                        player_ui.controls.tools.config = player_ui.args.tools.config;
                    }

                    player_ui.controls.tools.config();
                },
                config : function () {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' .' + player_ui.skin.css.sharingTabCls).hide();
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' .' + player_ui.skin.css.sharingTabCls + ':first').show();
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' ul#' + player_ui.skin.css.sharingTabControls + ' li:first').addClass('active');
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' ul#' + player_ui.skin.css.sharingTabControls + ' li a').click(function() {
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' ul#' + player_ui.skin.css.sharingTabControls + ' li').removeClass('active');
                        $(this).parent().addClass('active');
                        var currentTab = $(this).attr('href');
                        $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' .' + player_ui.skin.css.sharingTabCls).hide();
                        $(currentTab).show();

                        return false;
                    });
                },
                renderDownload : function (playable) {
                    var snippet = '';
                    if(playable.downloadable === true
                            && player_ui.playlist.current().type === APMPlayer.mediaTypes.AUDIO) {
                        snippet = '<a href="' + APMPlayer.base_path + 'util/download.php?uri=' + playable.http_file_path +'">file download</a>';
                    } else {
                        snippet = 'sorry, this item is not downloadable.';
                    }

                    $(player_ui.parent_id + ' #' + player_ui.skin.css.sharingTools + ' #' + player_ui.skin.css.sharingTabDownload).html(snippet);
                }
            }
        };

        /**
         * player_ui.events
         * contains all handlers + registers listeners for UI and back-end library
         * essentially the brokers communication as a controller between display and playback mechanism
         */
        this.events = {
            init : function () {
                APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY, player_ui.events.onPlayerReady);
                APMPlayer.events.addListener(APMPlayer.events.type.PLAYING, player_ui.events.onPlaying);
                APMPlayer.events.addListener(APMPlayer.events.type.PAUSED, player_ui.events.onPaused);
                APMPlayer.events.addListener(APMPlayer.events.type.METADATA, player_ui.events.onMetadata);
                APMPlayer.events.addListener(APMPlayer.events.type.BUFFER_START, player_ui.events.onBufferStart);
                APMPlayer.events.addListener(APMPlayer.events.type.BUFFER_END, player_ui.events.onBufferEnd);
                APMPlayer.events.addListener(APMPlayer.events.type.POSITION_UPDATE, player_ui.events.onPositionUpdate);
                APMPlayer.events.addListener(APMPlayer.events.type.FINISHED, player_ui.events.onFinished);
                APMPlayer.events.addListener(APMPlayer.events.type.UNLOADED, player_ui.events.onUnloaded);
                APMPlayer.events.addListener(APMPlayer.events.type.VOLUME_UPDATED, player_ui.events.onVolumeUpdated);
                APMPlayer.events.addListener(APMPlayer.events.type.CONNECTION_LOST, player_ui.events.onConnectionLost);
                APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_FAILURE, player_ui.events.onFailure);
                APMPlayer.events.addListener(APMPlayer.events.type.MISSING_FILE, player_ui.events.onMissingFile);
            },
            onPlayerReady : function () {
                player_ui.main.isReady = true;
                if (player_ui.main.canAutoPlay()) {
                    APMPlayer.play(player_ui.playlist.current(), player_ui.main.settings);
                } else {
                    var current_playable = player_ui.playlist.current();
                    if(current_playable !== null) {
                        player_ui.events.onMetadata(current_playable);
                    }
                }
            },
            onPlaying : function (playable) {
                player_ui.controls.seeker.enable();
                player_ui.controls.status.clearAll();
                $(player_ui.parent_id + ' #' + player_ui.skin.css.play).hide();
                $(player_ui.parent_id + ' #' + player_ui.skin.css.pause).show();

                player_ui.playlist.addNowPlaying(playable);
            },
            onPaused : function (playable) {
                $(player_ui.parent_id + ' #' + player_ui.skin.css.play).show();
                $(player_ui.parent_id + ' #' + player_ui.skin.css.pause).hide();

                if (playable.type === APMPlayer.mediaTypes.LIVE_AUDIO) {
                    player_ui.controls.seeker.reset();
                }
            },
            onFinished : function () {
                player_ui.controls.seeker.disable();
                if (player_ui.playlist.hasNext()) {
                    player_ui.playlist.next();
                } else {
                    APMPlayer.unload();
                }
            },
            onPositionUpdate : function (playable) {
                player_ui.controls.seeker.update(playable);

                if(player_ui.controls.seeker.status !== 'USER_SLIDING') {
                    player_ui.controls.playtime.render(playable);
                }
            },
            onSeek : function (percent_decimal) {
                if (APMPlayer.state.current() !== APMPlayer.state.type.STOPPED) {
                    APMPlayer.seek(percent_decimal);
                } else {
                    var current_playable = player_ui.playlist.current();  //manually set if stopped
                    if (current_playable.duration > 0) {
                        current_playable.percent_played = percent_decimal;
                        current_playable.position = current_playable.duration * percent_decimal;
                        player_ui.controls.playtime.render(current_playable);
                    }
                }
            },
            onUnloaded : function (playable) {
                player_ui.controls.seeker.reset();
                player_ui.controls.playtime.render(playable);
                $(player_ui.parent_id + ' #' + player_ui.skin.css.play).show();
                $(player_ui.parent_id + ' #' + player_ui.skin.css.pause).hide();
            },
            onBufferStart : function () {
                if(APMPlayer.state.current() === APMPlayer.state.type.PLAYING) {
                    $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).addClass(player_ui.skin.css.seekerBufferingCls);
                }
            },
            onBufferEnd : function () {
                $(player_ui.parent_id + ' #' + player_ui.skin.css.seeker).removeClass(player_ui.skin.css.seekerBufferingCls);
            },
            onFetchMetadata : function (response) {
                //APMG-specific metadata API callback would normally appear here.
                //instead, this is here as a place-holder so this version works if this setting is enabled.

                APMPlayer.debug.log('events.onFetchMetadata() pass-through hit for  \'' + response.identifier + '\'', APMPlayer.debug.type.info, 'APMPlayerUI');

                var current_playable = player_ui.playlist.current();
                if (response.identifier === current_playable.identifier) {
                    player_ui.events.onMetadata(current_playable);               //set common display window
                    player_ui.controls.tools.renderDownload(current_playable);   //make sure download link is correct

                    if (current_playable.duration > 0) {
                        player_ui.controls.playtime.render(current_playable);    //set time

                        if(current_playable.isFlashStreamable()) {               //make scrubbable (but only if not prog-download)
                            player_ui.controls.seeker.enable();

                            if(current_playable.position > 0) {                  //in this situation, the current position was defaulted to start somewhere mid-track.  be sure percent_played is set appropriately.
                                current_playable.percent_played = current_playable.position / current_playable.duration;
                            }
                            player_ui.controls.seeker.update(current_playable);
                        }
                    }

                    player_ui.main.updateAutoPlay(current_playable);
                    if (player_ui.main.canAutoPlay()) {
                        APMPlayer.play(player_ui.playlist.current(), player_ui.main.settings);
                    }
                }
            },
            onMetadata : function () {},  //typically overridden on fn.init()
            onFailure : function () {
                var playable = player_ui.playlist.current();
                var snippet = '<p>We\'re sorry, but your browser is not able to play the stream.  Please try one of these options:  <br /><br />1) Install or enable <a href="http://get.adobe.com/flashplayer/" target="_blank">Adobe Flash Player</a> <br />2) Use a browser that supports HTML5 and MP3 audio, such as <a href="http://www.google.com/chrome/" target="_blank">Chrome</a>, <a href="http://www.apple.com/safari/download/" target="_blank">Safari</a>, or <a href="http://www.microsoft.com/ie9" target="_blank">Internet Explorer 9</a>';

                //strange-case.  if we're dealing with Safari on Windows7, quicktime is required for HTML5  (yuck!)  this catches that condition.
                if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
                    snippet = '<p>We\'re sorry, but your browser is not able to play the stream.  Please try one of these options:  <br /><br />1) Install or enable <a href="http://get.adobe.com/flashplayer/" target="_blank">Adobe Flash Player</a> <br />2) Install <a href="http://www.apple.com/quicktime/download/" target="_blank">Quicktime</a> for HTML5 support for Safari on Windows (requires reboot) <br />2b) Use a different browser that natively supports HTML5 and MP3 audio, such as <a href="http://www.google.com/chrome/" target="_blank">Chrome</a> or <a href="http://www.microsoft.com/ie9" target="_blank">Internet Explorer 9</a>';
                }

                if (playable.downloadable === true
                        && playable.http_file_path !== '') {

                    if (playable.type === APMPlayer.mediaTypes.AUDIO) {
                        snippet += '<br />3) <a href="' + APMPlayer.base_path + 'util/download.php?uri=' + playable.http_file_path + '">download the audio</a>';
                    } else if (playable.type === APMPlayer.mediaTypes.LIVE_AUDIO) {
                        snippet += '<br />3) <a href="' + playable.http_file_path + '">Stream the audio using a third-party player (eg. iTunes)</a>';
                    }
                }
                snippet += "</p>";

                player_ui.controls.status.displayWarning(snippet);
            },
            onVolumeUpdated : function (eventData) {
                player_ui.main.settings.volume = eventData.percent_decimal;
            },
            onConnectionLost : function () {
                APMPlayer.unload();
                var snippet = "<p>Your network connection has changed or has been lost.<br /><br />Please check your connection, then click play to resume.";
                player_ui.controls.status.displayAlert(snippet);
            },
            onMissingFile : function (playable) {
                //display error message for missing file.
                //unfortunately, most missing file errors are actually a problem w/ a network connection and rarely are actual missing files.
                //the error output has been adjusted to reflect and offer better feedback.
                var snippet = '<p>We\'re sorry, an error has occurred and your audio cannot be played at this time. <br /><br />Often, this error is a result of a poor or missing internet connection.  Please check your internet connection, then click play to resume.';
                player_ui.controls.status.displayWarning(snippet);
                player_ui.underwriting.removeOverlay();
            }
        };

        /**
         * playlist
         * note, UI will always maintain an internal playist, regardless of appearance of playlist.
         * used internally, even if only one playable.
         */
        this.playlist = APMPlayerFactory.getPlaylist();
        player_ui.playlist.onUpdate = function (playable) {};
        player_ui.playlist.init = function () {
            if (player_ui.args.hasOwnProperty('onPlaylistUpdate')) {
                player_ui.playlist.onUpdate = player_ui.args.onPlaylistUpdate;
            }
            if (player_ui.args.hasOwnProperty('playables')) {
                $.each(player_ui.args.playables, function (index, item) {
                    player_ui.playlist.addPlayable(item);
                });
            }
        };
        player_ui.playlist.addPlayable = function (item) {
            var playable = APMPlayerFactory.getPlayable(item);
            if (playable.isValid()) {
                player_ui.playlist.add(playable);
                player_ui.playlist.onUpdate(playable);

                if (player_ui.main.settings.fetchMetadata === true) {
                    if (playable.isCustomScheme('apm_audio')) {               //only look-up custom APM media items
                        player_ui.main.fetchMetadata(playable);
                    } else {
                        player_ui.main.updateAutoPlay(playable);
                    }
                }

            } else {
                APMPlayer.debug.log('sorry, there was a problem with the parameters passed and a valid playable could not be created.', APMPlayer.debug.type.warn, 'APMPlayerUI');
            }
        };
        player_ui.playlist.gotoItem = function (identifer) {
            if(APMPlayer.state.current() === APMPlayer.state.type.STOPPED
                    || player_ui.playlist.current().identifier !== identifer) {
                player_ui.controls.seeker.disable();
                player_ui.playlist.goto(identifer);
            }
        };
        player_ui.playlist.addNowPlaying = function (playable) {
            $('li[ id = \'' + playable.identifier + '\']').addClass(player_ui.skin.css.playlistNowPlayingCls);
        };
        player_ui.playlist.removeNowPlaying = function (playable) {
            $(player_ui.parent_id + ' #' + player_ui.skin.css.playlist + ' li[ id = \'' + playable.identifier + '\']').removeClass(player_ui.skin.css.playlistNowPlayingCls);
        };
        player_ui.playlist.onCurrentChange = function (previous_playable) {
            if (previous_playable !== null) {   //only null on first item added to playlist.
                player_ui.playlist.removeNowPlaying(previous_playable);
                APMPlayer.play(player_ui.playlist.current(), player_ui.main.settings);
            }
            var current_playable = player_ui.playlist.current();
            player_ui.controls.seeker.configure(current_playable);
            player_ui.controls.tools.renderDownload(current_playable);

            if (current_playable.duration > 0) {
                player_ui.controls.playtime.render(current_playable);
            }
        };
        player_ui.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, player_ui.playlist.onCurrentChange);


        player_ui.init();    //always init on construct


    };  //end APMPlayerUI


    /**
     * @name $.fn.apmplayer_ui
     * @class
     *
     * @description main integration point between jQuery, APMPlayerUI, and {@link APMPlayer}.
     * The $.fn.apmplayer_ui is tested and compliant with all versions of jQuery >= v1.4
     *
     * @param {Object} args object literal used to instantiate APMPlayerUI
     * @param {Object} args.settings object literal containing initial values to set on APMPlayer initialization.
     * @param {Number} args.settings.volume sets volume on initialization.  (eg. volume : 0.5)
     * @param {Boolean} args.settings.autoplay autoplays current {@link Playable} in {@link Playlist} after library init completes. (default : false)
     * @param {Boolean} args.settings.fetchMetadata retrieves and sets additional metadata for each {@link Playable}.  Note that this will only override a value in {@link Playable} if it is currently not set.  Values passed in when adding a {@link Playable} will take precedence.  (default : true)
     * @param {Array} args.playables an array of {@link Playable} objects.
     * @param {Function} args.onPlaylistUpdate() a method that will fire when Events.type.PLAYLIST_CURRENT_CHANGE is fired, or the playlist is updated. (see {@link Events}).
     * @param {Function} args.onMetadata() a method that will fire when Events.type.METADATA is fired. (see {@link Events}).
     *
     * @example
     * //note: see CustomSchemes for this example
     * $('#apm_media_wrapper').apmplayer_ui({
     *    playables : [
     *        {
     *            identifier: 'apm_audio:/performance_today/2012/04/24/pt2_20120424_128.mp3'
     *        }
     *    ]
     * });
     *
     * @example
     * $('#apm_media_wrapper').apmplayer_ui({
     *    playables : [
     *        {
     *           identifier: 'my audio',
     *           type: 'audio',
     *           description: 'more info about my audio',
     *           flash_server_url: 'rtmp://server/',
     *           flash_file_path: 'mp3:path/file.mp3',
     *           http_file_path: 'http://server/file.mp3'
     *        }
     *    ]
     * });
     *
     *
     * @example
     * $('#apm_media_wrapper').apmplayer_ui({
     *    settings : {
     *        volume : 0.8,
     *        autoplay : true
     *    },
     *    playables : [
     *       {
     *          identifier: 'apm_live_audio:/mpr_current',
     *          description: 'live streaming from 89.3',
     *          program: '89.3 the Current',
     *          host: 'Mark Wheat',
     *          date: 'March 24, 2012',
     *          detail: 'during this hour...',
     *          image_sm: 'http://mpr.org/images/current.gif'
     *       },
     *       {
     *           identifier: 'apm_audio:/performance_today/2012/04/24/pt2_20120424_128.mp3',
     *           program: 'on Being',
     *           downloadable: false
     *       }
     *    ],
     *    onPlaylistUpdate : function (playable) {
     *       // implement
     *    },
     *    onMetadata : function (playable) {
     *       // implement
     *    }
     * });
     */
    $.fn.apmplayer_ui = function (args) {

        //check dependencies
        if (typeof APMPlayer === 'undefined'
                || typeof soundManager === 'undefined') {
            $.error('apmplayer_ui ERROR.  1 or more dependent libraries missing.  exiting.');
            return null;
        }

        var jq_element = this,  //hold reference to jQuery $(this)
            methods = {
                /**
                 * @name addPlayable
                 *
                 * @description adds a {@link Playable}, if valid, to {@link Playlist}.
                 * @example $('#player_container_div').apmplayer_ui('addPlayable', playable);
                 * @methodOf $.fn.apmplayer_ui
                 */
                addPlayable : function (item) {
                    if (typeof window.apmplayer_ui !== 'undefined') {
                        window.apmplayer_ui.playlist.addPlayable(item);
                    } else {
                        APMPlayer.debug.log('you must first initialize apmplayer_ui before calling methods on it.', APMPlayer.debug.type.error, 'APMPlayerUI');
                    }
                },
                /**
                 * @name gotoPlaylistItem
                 *
                 * @description changes position in {@link Playlist} to the {@link Playable} that matches the passed identifier, and begins playing the item.
                 * @example $('#player_container_div').apmplayer_ui('gotoPlaylistItem', identifier);
                 * @methodOf $.fn.apmplayer_ui
                 */
                gotoPlaylistItem : function (identifier) {
                    if (typeof window.apmplayer_ui !== 'undefined') {
                        window.apmplayer_ui.playlist.gotoItem(identifier);
                    } else {
                        APMPlayer.debug.log('you must first initialize apmplayer_ui before calling methods on it.', APMPlayer.debug.type.error, 'APMPlayerUI');
                    }
                }
            };

        if (methods[args]) {
            return methods[args].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof args === 'object' || !args) {
            if (typeof window.apmplayer_ui === 'undefined') {
                window.apmplayer_ui = new APMPlayerUI(jq_element, args);
                APMPlayer.debug.log('instantiated apmplayer_ui', APMPlayer.debug.type.info, 'APMPlayerUI');
            } else {
                APMPlayer.debug.log('sorry, only one player UI instance is currently supported.', APMPlayer.debug.type.error, 'APMPlayerUI');
            }
        } else {
            APMPlayer.debug.log('Method ' +  args + ' does not exist on jQuery.apmplayer_ui', APMPlayer.debug.type.error, 'APMPlayerUI');
        }
    };
}(jQuery));
