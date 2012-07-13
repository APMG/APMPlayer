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

//used throughout Events test
var fixture;

module("APMPlayer::Events", {

    setup: function() {

        fixture = this;

        //the same Events() class is used throughout APMPlayer.
        //Playlist has a publicly accessible version of it outside of APMPlayerFactory
        //so is used here for Events() module testing

        fixture.events = APMPlayerFactory.getPlaylist().events;
    },
    teardown: function() {

        fixture.events = null;
    }
});


asyncTest("test basic event trigger", 1, function() {

    fixture.events.addListener('my listener', function () {
        ok(true, 'my listener event fired');
    });

    fixture.events.trigger('my listener');

    setTimeout(function() {
        start();
    }, 250);
});


asyncTest("test multiple events with same name", 2, function() {

    fixture.events.addListener(fixture.events.type.AUDIO_LIB_READY, function () {
        ok(true, 'AUDIO_LIB_READY event fired 1');
    });

    fixture.events.addListener(fixture.events.type.AUDIO_LIB_READY, function () {
        ok(true, 'AUDIO_LIB_READY event fired 2');
    });

    fixture.events.trigger(fixture.events.type.AUDIO_LIB_READY);

    setTimeout(function() {
        start();
    }, 250);
});


asyncTest("test event trigger with data", 2, function() {

    var testArgs = {
        test : 'test',
        another : 'variable'
    };

    fixture.events.addListener('my listener', function (data) {
        ok(true, 'my listener event fired');
        deepEqual ( data, testArgs, 'testArgs object should be passed through');
    });

    fixture.events.trigger('my listener', testArgs);

    setTimeout(function() {
        start();
    }, 250);
});

test("test expected event types", function() {

    var expectedEventTypes = {
        AUDIO_LIB_READY : 'AUDIO_LIB_READY',
        MEDIA_READY : 'MEDIA_READY',
        PLAYER_READY : 'PLAYER_READY',
        PLAYER_FAILURE : 'PLAYER_FAILURE',
        CONNECTION_LOST : 'CONNECTION_LOST',
        MISSING_FILE : 'MISSING_FILE',
        PLAYLIST_CURRENT_CHANGE : 'PLAYLIST_CURRENT_CHANGE',
        POSITION_UPDATE : 'POSITION_UPDATE',
        PLAYING : 'PLAYING',
        PAUSED : 'PAUSED',
        FINISHED : 'FINISHED',
        UNLOADED : 'UNLOADED',
        BUFFER_START : 'BUFFER_START',
        BUFFER_END : 'BUFFER_END',
        METADATA : 'METADATA',
        VOLUME_UPDATED : 'VOLUME_UPDATED'
    };

    deepEqual ( fixture.events.type, expectedEventTypes, 'expecting these exact events to exist' );
});
