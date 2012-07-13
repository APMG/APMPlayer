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
module("APMPlayerFactory::Playable", {
});

test("APM-specific live audio playable", function() {

    var testObj = APMPlayerTestSetup.getCSFLiveAudioObj();
    var playable = APMPlayerFactory.getPlayable(testObj);

    strictEqual ( playable.flash_server_url, 'rtmp://archivemedia.publicradio.org/csf');
    strictEqual ( playable.flash_file_path, 'csf.stream');
    strictEqual ( playable.http_file_path, 'http://204.93.222.85:80/csf-nopreroll');
    strictEqual ( playable.identifier, testObj.identifier );
    strictEqual ( playable.title, testObj.title );
    strictEqual ( playable.description, testObj.description );
    strictEqual ( playable.buffer_time, 6 );  //buffer should be 6 for live audio
});


test("APM-specific static audio playable", function() {

    var testObj = APMPlayerTestSetup.getAPMStaticAudioObj();
    var playable = APMPlayerFactory.getPlayable(testObj);

    strictEqual ( playable.flash_server_url, 'rtmp://archivemedia.publicradio.org/music');
    strictEqual ( playable.flash_file_path, 'mp3:ondemand/minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3');
    strictEqual ( playable.http_file_path, 'http://ondemand.publicradio.org/minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3' );
    strictEqual ( playable.identifier, testObj.identifier );
    strictEqual ( playable.description, testObj.description );
});

test("APM-specific properties are not overridable", function() {

    var testObj = {
        identifier: 'apm_audio:/minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3',
        flash_server_url : 'rtmp://archivemedia.cloudnet.com/mynewserver',
        flash_file_path : 'mp3:override',
        http_file_path : 'http://204.93.222.85:80/override',
        buffer_time : 10
    };

    var playable = APMPlayerFactory.getPlayable(testObj);
    strictEqual ( playable.flash_server_url, 'rtmp://archivemedia.publicradio.org/music');
    strictEqual ( playable.flash_file_path, 'mp3:ondemand/minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3');
    strictEqual ( playable.http_file_path, 'http://ondemand.publicradio.org/minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3' );
    strictEqual ( playable.buffer_time, 3 );
    notStrictEqual ( playable.flash_server_url, testObj.flash_server_url);
    notStrictEqual ( playable.flash_file_path, testObj.flash_file_path);
    notStrictEqual ( playable.http_file_path, testObj.http_file_path);
    notStrictEqual ( playable.buffer_time, testObj.buffer_time);
});



test("Basic static audio playable", function() {

    var testObj = APMPlayerTestSetup.getBasicStaticAudioObj();
    var playable = APMPlayerFactory.getPlayable(testObj);

    strictEqual ( playable.flash_server_url, testObj.flash_server_url );
    strictEqual ( playable.flash_file_path, testObj.flash_file_path );
    strictEqual ( playable.http_file_path, testObj.http_file_path );
    strictEqual ( playable.identifier, testObj.identifier );
    strictEqual ( playable.type, testObj.type );
    strictEqual ( playable.buffer_time, 5 );   //buffer should be overridable for basic non-apm audio
    strictEqual ( playable.title, testObj.title );
    strictEqual ( playable.description, testObj.description );
    strictEqual ( playable.other_field, undefined );  //new fields not saved
    strictEqual ( playable.isValid(), true);
});



test("test reset(), position, percent_played", function() {

    var testObj = APMPlayerTestSetup.getBasicStaticAudioObj();
    var playable = APMPlayerFactory.getPlayable(testObj);

    strictEqual ( playable.position, 0, 'should default to 0');
    strictEqual ( playable.percent_played, 0, 'should default to 0' );

    playable.position = 5;
    playable.percent_played = 10;

    playable.reset();

    strictEqual ( playable.position, 0, 'should be back to 0');
    strictEqual ( playable.percent_played, 0, 'should be back to 0' );
});

test("test for invalid basic media playables", function() {

    var testObj = {
        type: 'audios',
        identifier: 'npr_audio/anon.npr-mp3/npr/fl/2011/12/20111209_fl_gbvcd.mp3',
        flash_server_url : 'rtmp://flash.npr.org/ondemand/',
        flash_file_path : 'mp3:anon.npr-mp3/npr/fl/2011/12/20111209_fl_gbvcd.mp3'
    };
    var testObj2 = {
        identifier: 'npr_audio/anon.npr-mp3/npr/fl/2011/12/20111209_fl_gbvcd.mp3',
        flash_server_url : 'rtmp://flash.npr.org/ondemand/',
        flash_file_path : 'mp3:anon.npr-mp3/npr/fl/2011/12/20111209_fl_gbvcd.mp3'
    };

    var playable = APMPlayerFactory.getPlayable(testObj2);
    strictEqual ( playable.isValid(), false);
});


test("test for bad playable creation", function() {

    var testObj = {
        flash_server_url : 'rtmp://archivemedia.cloudnet.com/mynewserver'
    };

    var playable = APMPlayerFactory.getPlayable(testObj);
    strictEqual ( playable.isValid(), false);
    strictEqual ( playable.flash_server_url, '', 'server_url should not be set if invalid playable');
});

test("test for bad apm-playable creation", function() {

    var testObj = {
        identifier: 'apm_audios:minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3'
    };

    var playable = APMPlayerFactory.getPlayable(testObj);
    strictEqual ( playable.isValid(), false);
});
