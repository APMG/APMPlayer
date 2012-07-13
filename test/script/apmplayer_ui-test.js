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

module("apmplayer_ui", {
});

test("check APMPlayerFactory instantiated", function() {
    strictEqual ( typeof APMPlayerFactory !== 'undefined', true, 'APMPlayerFactory defined' );
});

test("check APMPlayer instantiated", function() {
    strictEqual ( typeof APMPlayer !== 'undefined', true, 'APMPlayer defined' );
});

test("check apmplayer_ui instantiated", function() {
    strictEqual ( typeof $.fn.apmplayer_ui !== 'undefined', true, 'apmplayer_ui defined' );
});


asyncTest("addPlayable() + gotoPlaylistItem() ", 18, function() {

    var live_stream_playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getKCMPLiveAudioObj());

    var unloaded_count = 0;
    APMPlayer.events.addListener(APMPlayer.events.type.UNLOADED, function () {
        unloaded_count += 1;
        if(unloaded_count === 1) {
            ok(true, 'UNLOADED event fired #' + unloaded_count + " (expecting 3 total).  Play after live stream pause was requested (should trigger unload).");
            APMPlayer.play(live_stream_playable);
        } else {
            ok(true, 'UNLOADED event fired #' + unloaded_count + " (expecting 3 total).");
        }
    });

    var pos_update = false;
    APMPlayer.events.addListener(APMPlayer.events.type.POSITION_UPDATE, function () {
        if(pos_update === false) {           //since this fires repeatedly, make sure it fires at least once
            ok(true, 'POSITION_UPDATE event fired');
            pos_update = true;
        }
    });

    APMPlayer.events.addListener(APMPlayer.events.type.VOLUME_UPDATED, function () {
        ok(true, 'VOLUME_UPDATED event fired');
    });

    var metadata_update = 0;
    APMPlayer.events.addListener(APMPlayer.events.type.METADATA, function (playable) {
        if(metadata_update === 0) {           //since this could potentially fire multiple times, it should for-sure happen twice.  once on play, and once after playback begins
            ok(true, 'METADATA event fired');
            strictEqual( playable.identifier, live_stream_playable.identifier, 'METADATA: items should match' );
        } else if (metadata_update === 1) {
            ok(true, 'METADATA event fired');
            strictEqual( playable.identifier, live_stream_playable.identifier, 'METADATA: items should match' );
        }
        metadata_update++;
    });

    var buff_start = false;
    APMPlayer.events.addListener(APMPlayer.events.type.BUFFER_START, function () {
        if(buff_start === false) {           //since this may fire several times, make sure it fires at least once
            ok(true, 'BUFFER_START event fired');
            buff_start = true;
        }
    });

    var buff_end = false;
    APMPlayer.events.addListener(APMPlayer.events.type.BUFFER_END, function () {
        if(buff_end === false) {           //since this may fire several times, make sure it fires at least once
            ok(true, 'BUFFER_END event fired');
            buff_end = true;
            APMPlayer.pause();  //pause stream after buffer ends
        }
    });

    var playing_count = 0;
    APMPlayer.events.addListener(APMPlayer.events.type.PLAYING, function () {
        playing_count += 1;
        ok(true, 'PLAYING event fired #'+playing_count + " (expecting 2 total)");
        if (playing_count === 1) {
            APMPlayer.setVolume(0.0);  //mute on first pass
        }
    });

    var playlist_change_count = 0;
    window.apmplayer_ui.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        playlist_change_count += 1;
        if(playlist_change_count === 1) {
            ok(true, 'PLAYLIST_CURRENT_CHANGE fired #' + playlist_change_count + ' (expecting 2 total).');
            strictEqual ( prev_playable, null, 'prev playable should be null the first time' );
            $('#apm_player_container').apmplayer_ui('gotoPlaylistItem', live_stream_playable.identifier);
        } else {
            ok(true, 'PLAYLIST_CURRENT_CHANGE fired #' + playlist_change_count + ' (expecting 2 total).');
            strictEqual ( prev_playable.identifier, live_stream_playable.identifier, 'prev playable should be the same as live_stream_playable' );
        }
    });

    APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY,  function () {
        ok(true, 'PLAYER_READY event fired');
        $('#apm_player_container').apmplayer_ui('addPlayable', live_stream_playable);
    });

    setTimeout(function() {
        APMPlayer.unload();     //stop stream after 4 seconds of playing
    }, 5000);

    setTimeout(function() {
        start();
    }, 6000);

});



