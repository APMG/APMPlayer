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

//used throughout Playlist test
var fixture;

module("APMPlayerFactory::Playlist", {

    setup: function() {

        fixture = this;

        fixture.playlist = APMPlayerFactory.getPlaylist();

        fixture.apm_static_playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getAPMStaticAudioObj());
        fixture.basic_static_playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getBasicStaticAudioObj());
        fixture.apm_live_playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getKCMPLiveAudioObj());
    },
    teardown: function() {

        fixture.playlist = null;
        fixture.apm_static_playable = null;
        fixture.basic_static_playable = null;
        fixture.apm_live_playable = null;
    }
});


test("test playlist playable added", function() {
    var result = fixture.playlist.add(fixture.apm_static_playable);
    strictEqual ( result, true, 'expect true for successful playlist adds' );
});


test("test bad playlist playable added", function() {

    var nonPlayable = {
        identifier: 'apm_audio:minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3',
        flash_server_url : 'rtmp://archivemedia.cloudnet.com/mynewserver',
        flash_file_path : 'mp3:override',
        http_file_path : 'http://204.93.222.85:80/override',
        buffer_time : 10
    };
    var result = fixture.playlist.add(nonPlayable);
    strictEqual ( result, false, 'playlist should return false if an object other than type "Playable" is added' );
});


test("test current()", function() {
    strictEqual ( fixture.playlist.current(), null, 'current() should return null on init');
    fixture.playlist.add(fixture.apm_static_playable);

    strictEqual ( fixture.playlist.current().identifier, fixture.apm_static_playable.identifier, 'identifer of added item should match current playable');

    fixture.playlist.add(fixture.apm_live_playable);
    strictEqual ( fixture.playlist.current().identifier, fixture.apm_static_playable.identifier, 'current playable should remain as first item added');
});


test("test item()", function() {

    fixture.playlist.add(fixture.apm_static_playable);
    fixture.playlist.add(fixture.basic_static_playable);
    fixture.playlist.add(fixture.apm_live_playable);

    deepEqual ( fixture.playlist.item(fixture.apm_static_playable.identifier), fixture.apm_static_playable, 'item should always return matching item, regardless of current()');
    deepEqual ( fixture.playlist.item(fixture.apm_live_playable.identifier), fixture.apm_live_playable, 'item should always return matching item, regardless of current()');
    deepEqual ( fixture.playlist.item(fixture.basic_static_playable.identifier), fixture.basic_static_playable, 'item should always return matching item, regardless of current()');
    strictEqual ( fixture.playlist.item('identifer not in playlist'), null, 'no item should be returned' );
});


asyncTest("test goto()", 6, function() {

    var passed_first_add = false;
    fixture.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        if (passed_first_add === false) {
            ok(true, 'PLAYLIST_CURRENT_CHANGE event fired once on first add.');
            deepEqual ( prev_playable, null, 'prev playable should be null the first time');
            passed_first_add = true;
        }
    });

    fixture.playlist.add(fixture.apm_static_playable);
    fixture.playlist.add(fixture.basic_static_playable);
    fixture.playlist.add(fixture.apm_live_playable);

    fixture.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        ok(true, 'PLAYLIST_CURRENT_CHANGE event fired');
        deepEqual ( prev_playable, fixture.apm_static_playable, 'prev playable should be apm_static_playable');
        deepEqual ( fixture.basic_static_playable, fixture.playlist.current(), 'current item should now be basic_static_playable');
    });

    notStrictEqual ( fixture.playlist.current().identifier, fixture.basic_static_playable.identifier, 'check current item is not basic_static_playable' );

    fixture.playlist.goto(fixture.basic_static_playable.identifier);

    setTimeout(function() {
        start();
    }, 250);
});


test("test hasNext()", function() {

    fixture.playlist.add(fixture.apm_static_playable);
    strictEqual ( fixture.playlist.hasNext(), false, 'no next item w/ one playable in list' );

    fixture.playlist.add(fixture.basic_static_playable);
    strictEqual ( fixture.playlist.hasNext(), true, 'hasNext() if another item in playlist' );

    fixture.playlist.next();
    strictEqual ( fixture.playlist.hasNext(), false, 'no next item if at last item in playlist' );
});


test("test remove()", function() {

    fixture.playlist.add(fixture.apm_static_playable);
    fixture.playlist.add(fixture.basic_static_playable);
    fixture.playlist.add(fixture.apm_live_playable);

    strictEqual ( fixture.playlist.remove(fixture.apm_static_playable.identifier), false, 'attempt to remove current item should return false' );
    strictEqual ( fixture.playlist.remove(fixture.apm_live_playable.identifier), true, 'should successfully remove apm_live_playable' );
    strictEqual ( fixture.playlist._count(), 2, 'only 2 items should remain' );

    fixture.playlist.next();
    strictEqual ( fixture.playlist.remove(fixture.apm_static_playable.identifier), true, 'after advancing pointer, first item should be removed' );
    strictEqual ( fixture.playlist._count(), 1, 'only 1 item should remain' );

    fixture.playlist.add(fixture.apm_live_playable);  //add removed items (now in different order)
    fixture.playlist.add(fixture.apm_static_playable);
    deepEqual ( fixture.playlist.current(), fixture.basic_static_playable, 'current item should still be basic_static_playable');

    fixture.playlist.next();
    deepEqual ( fixture.playlist.current(), fixture.apm_live_playable, 'current item should now be apm_live_playable');
    strictEqual ( fixture.playlist.remove(fixture.apm_static_playable.identifier), true, 'third item, apm_static_playable should be removed' );
    strictEqual ( fixture.playlist._count(), 2, 'only 2 items should remain' );
});


test("test next()", function() {

    strictEqual ( fixture.playlist.next(), false, 'should return false w/ no playables in playlist' );

    fixture.playlist.add(fixture.apm_static_playable);


});

asyncTest("test next() -- one playable", 4, function() {

    strictEqual ( fixture.playlist.next(), false, 'should return false w/ no playables in playlist' );

    fixture.playlist.add(fixture.apm_static_playable);

    fixture.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        ok(true, 'PLAYLIST_CURRENT_CHANGE event fired');
        deepEqual ( prev_playable, fixture.apm_static_playable, 'prev playable should be apm_static_playable');
        deepEqual ( fixture.apm_static_playable, fixture.playlist.current(), 'current item should still be apm_static_playable');
    });

    fixture.playlist.next();

    setTimeout(function() {
        start();
    }, 250);
});


asyncTest("test next() -- more than one playable", 9, function() {

    fixture.playlist.add(fixture.apm_live_playable);
    fixture.playlist.add(fixture.apm_static_playable);
    fixture.playlist.add(fixture.basic_static_playable);

    var num_events_fired = 0;
    fixture.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        ok(true, 'PLAYLIST_CURRENT_CHANGE event fired');

        if(num_events_fired === 0) {
            num_events_fired++;

            deepEqual ( prev_playable, fixture.apm_live_playable, 'prev playable should be apm_live_playable');
            deepEqual ( fixture.apm_static_playable, fixture.playlist.current(), 'current item should now be apm_static_playable');

            fixture.playlist.next();
        } else if(num_events_fired === 1) {
            num_events_fired++;

            deepEqual ( prev_playable, fixture.apm_static_playable, 'prev playable should be apm_static_playable');
            deepEqual ( fixture.basic_static_playable, fixture.playlist.current(), 'current item should now be basic_static_playable');

            fixture.playlist.next();
        }  else if(num_events_fired === 2) {
            num_events_fired++;

            deepEqual ( prev_playable, fixture.basic_static_playable, 'prev playable should be basic_static_playable');
            deepEqual ( fixture.apm_live_playable, fixture.playlist.current(), 'current item should now be apm_live_playable');
        }

    });

    fixture.playlist.next();

    setTimeout(function() {
        start();
    }, 250);
});


asyncTest("test previous() -- one playable", 4, function() {

    strictEqual ( fixture.playlist.previous(), false, 'should return false w/ no playables in playlist' );

    fixture.playlist.add(fixture.apm_static_playable);

    fixture.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        ok(true, 'PLAYLIST_CURRENT_CHANGE event fired');
        deepEqual ( prev_playable, fixture.apm_static_playable, 'prev playable should be apm_static_playable');
        deepEqual ( fixture.apm_static_playable, fixture.playlist.current(), 'current item should still be apm_static_playable');
    });

    fixture.playlist.previous();

    setTimeout(function() {
        start();
    }, 250);
});


asyncTest("test previous() -- more than one playable", 9, function() {

    fixture.playlist.add(fixture.apm_live_playable);
    fixture.playlist.add(fixture.apm_static_playable);
    fixture.playlist.add(fixture.basic_static_playable);

    var num_events_fired = 0;
    fixture.playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function (prev_playable) {
        ok(true, 'PLAYLIST_CURRENT_CHANGE event fired');

        if(num_events_fired === 0) {
            num_events_fired++;

            deepEqual ( prev_playable, fixture.apm_live_playable, 'prev playable should be apm_live_playable');
            deepEqual ( fixture.basic_static_playable, fixture.playlist.current(), 'current item should now be basic_static_playable, the last item in playlist');

            fixture.playlist.previous();
        } else if(num_events_fired === 1) {
            num_events_fired++;

            deepEqual ( prev_playable, fixture.basic_static_playable, 'prev playable should be basic_static_playable');
            deepEqual ( fixture.apm_static_playable, fixture.playlist.current(), 'current item should now be apm_static_playable');

            fixture.playlist.previous();
        }  else if(num_events_fired === 2) {
            num_events_fired++;

            deepEqual ( prev_playable, fixture.apm_static_playable, 'prev playable should be apm_static_playable');
            deepEqual ( fixture.apm_live_playable, fixture.playlist.current(), 'current item should now be back to apm_live_playable');
        }

    });

    fixture.playlist.previous();

    setTimeout(function() {
        start();
    }, 250);
});
