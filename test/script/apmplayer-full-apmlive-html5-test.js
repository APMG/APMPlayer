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

module("APMPlayerFactory::APMPlayer", {
    setup: function() {
        APMPlayer.events.removeListeners();
    },
    teardown: function() {
        APMPlayer.events.removeListeners();
    }
});

test("check is defined", function() {
    strictEqual ( typeof APMPlayerFactory !== 'undefined', true, 'APMPlayerFactory defined' );
    strictEqual ( typeof APMPlayer !== 'undefined', true, 'APMPlayer defined' );
});

asyncTest("test reset() of lib", 1, function() {

    APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY,  function () {
        ok(true, 'PLAYER_READY event fired');
    });

    APMPlayer.reset([ APMPlayer.mechanism.type.HTML5 ]);

    setTimeout(function() {
        start();
    }, 1000);
});


asyncTest("test full live HTML5 playback functionality", 13, function() {
    APMPlayer.reset([ APMPlayer.mechanism.type.HTML5 ]);
    var live_stream_obj = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getKNOWLiveAudioObj());

    var unloaded_count = 0;
    APMPlayer.events.addListener(APMPlayer.events.type.UNLOADED, function () {
        unloaded_count += 1;
        if(unloaded_count === 1) {
            ok(true, 'UNLOADED event fired #' + unloaded_count + " (expecting 2 total).  Play after live stream pause was requested (should trigger unload).");
            APMPlayer.play(live_stream_obj);
        } else {
            ok(true, 'UNLOADED event fired #' + unloaded_count + " (expecting 2 total).");
        }
    });

    var pos_update = false;
    APMPlayer.events.addListener(APMPlayer.events.type.POSITION_UPDATE, function () {
        if(pos_update === false) {           //since this fires repeatedly, make sure it fires at least once
            ok(true, 'POSITION_UPDATE event fired');
            pos_update = true;

            APMPlayer.pause();  //pause stream after first position update
        }
    });

    APMPlayer.events.addListener(APMPlayer.events.type.VOLUME_UPDATED, function () {
        ok(true, 'VOLUME_UPDATED event fired');
    });

    var buff_start = false;
    APMPlayer.events.addListener(APMPlayer.events.type.BUFFER_START, function () {
        if(buff_start === false) {           //since this fires several times, make sure it fires at least once
            ok(true, 'BUFFER_START event fired');
            buff_start = true;
        }
    });

    var buff_end = false;
    APMPlayer.events.addListener(APMPlayer.events.type.BUFFER_END, function () {
        if(buff_end === false) {           //since this fires several times, make sure it fires at least once
            ok(true, 'BUFFER_END event fired');
            buff_end = true;

        }
    });


    var metadata_count = 0;
    APMPlayer.events.addListener(APMPlayer.events.type.METADATA, function (playable) {
        metadata_count += 1;
        ok(true, 'METADATA event fired #' + metadata_count + " (expecting 2 total)");
        deepEqual( live_stream_obj, playable, 'METADATA: playables should exactly match in HTML5 mode' );
    });


    var playing_count = 0;
    APMPlayer.events.addListener(APMPlayer.events.type.PLAYING, function () {
        if (playing_count === 0) {
            APMPlayer.setVolume(0.0);  //mute on first pass
        }
        playing_count += 1;
        ok(true, 'PLAYING event fired #'+playing_count + " (expecting 2 total)");
    });

    APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY,  function () {
        ok(true, 'PLAYER_READY event fired');
        APMPlayer.play(live_stream_obj);
    });

    setTimeout(function() {
        APMPlayer.unload();     //stop stream after 12 seconds of playing
    }, 12000);                  //current issue unknown w/ chrome HTML5 sluggishness to start streaming

    setTimeout(function() {
        start();
    }, 14000);
});
