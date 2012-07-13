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
//used throughout test
var fixture;

module("APMPlayerFactory::CustomSchemes", {
    setup: function() {
        fixture = this;
        fixture.custom_schemes = APMPlayerFactory.getCustomSchemes();
    },
    teardown: function() {
        fixture.custom_schemes = null;
    }
});


test("basic tests", function() {
    var scheme_map = APMPlayerTestSetup.getCustomSchemeMap();
    fixture.custom_schemes.init(scheme_map);
    strictEqual ( fixture.custom_schemes.schemes.length, 3, 'schemes array should hold only the 3 top level schemes');
    deepEqual (  fixture.custom_schemes.scheme_map, scheme_map, 'scheme_map should be exactly equal');

    var emptyPlayable = APMPlayerFactory.getPlayable({});
    var expectedPlayableAttrs = [];
    for(var propertyName in emptyPlayable) {
        if(typeof emptyPlayable[propertyName] !== 'function') {
            expectedPlayableAttrs.push(propertyName);
        }
    }
    deepEqual ( fixture.custom_schemes.playable_attrs, expectedPlayableAttrs, 'Non-function playable attrs should exactly match');
    strictEqual ( fixture.custom_schemes.hasSchemes(), true, 'should return true when schemes array is populated.');
});

test("no schemes defined tests", function() {
    fixture.custom_schemes.init({});  //clearing schemes to test boundary of not using CustomSchemes

    deepEqual ( fixture.custom_schemes.scheme_map, {}, 'scheme_map should be empty object');
    strictEqual ( fixture.custom_schemes.schemes.length, 0, 'schemes should be length 0');

    strictEqual ( fixture.custom_schemes.hasSchemes(), false, 'should return false when schemes array is not populated.');
    strictEqual ( fixture.custom_schemes.isScheme('apm_audio:/test.mp3', 'apm_audio'), false, 'should return false, because no schemes defined.');
    strictEqual ( fixture.custom_schemes.isValid('apm_audio'), false, 'should return false regardless.');
});

test("basic logical tests", function() {

    var scheme_map = APMPlayerTestSetup.getCustomSchemeMap();
    fixture.custom_schemes.init(scheme_map);

    strictEqual ( fixture.custom_schemes.hasSchemes(), true, 'should return true when schemes array is populated.');
    strictEqual ( fixture.custom_schemes.isValid('custom_normal'), true, 'should return true for a valid scheme type');
    strictEqual ( fixture.custom_schemes.isValid('custom_normal2'), false, 'should return false for an invalid scheme type');

    var customNormalPlayable  = APMPlayerFactory.getPlayable( APMPlayerTestSetup.getCustomSchemeNormalObj() );
    strictEqual ( fixture.custom_schemes.isScheme(customNormalPlayable.identifier, 'custom_normal'), true, 'should return true, because it\'s a specific type and matches.');
    strictEqual ( fixture.custom_schemes.isScheme(customNormalPlayable.identifier, 'custom_normal_more'), false, 'should return false, because doesn\'t match.');
});

test("parse tests", function() {

    fixture.custom_schemes.init({});
    var result = fixture.custom_schemes.parse('custom_normal:/this_really_shouldnt_work/no.mp3');
    strictEqual ( result, null, 'result should always be null when no customSchemes are defined.');

    var scheme_map = APMPlayerTestSetup.getCustomSchemeMap();
    fixture.custom_schemes.init(scheme_map);

    var result = fixture.custom_schemes.parse('custom_normal:/this/should/be_parseable/yes.mp3');
    var expectedParseResult = {
      scheme: "custom_normal",
      path: "this/should/be_parseable/yes.mp3"
    };
    deepEqual ( result, expectedParseResult, 'results should match.');
});

test("basic playable tests", function() {

    var scheme_map = APMPlayerTestSetup.getCustomSchemeMap();
    fixture.custom_schemes.init(scheme_map);

    var playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getCustomSchemeNormalObj());
    strictEqual ( playable.flash_server_url, 'rtmp://flashserver.org/music');
    strictEqual ( playable.flash_file_path, 'mp3:ondemand/myfile/is/great.mp3');
    strictEqual ( playable.http_file_path, 'http://ondemand.org/myfile/is/great.mp3');
    strictEqual ( playable.buffer_time, 3 );
    strictEqual ( playable.downloadable, true );
    strictEqual ( playable.type, 'audio' );
});

test("basic playable override tests", function() {

    var scheme_map = APMPlayerTestSetup.getCustomSchemeMap();
    fixture.custom_schemes.init(scheme_map);

    var playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getCustomSchemeNormalMoreObj());
    strictEqual ( playable.flash_server_url, 'rtmp://flashserver.org/music');
    strictEqual ( playable.flash_file_path, 'mp3:ondemand/myfile/is/greater.mp3');
    strictEqual ( playable.http_file_path, 'http://ondemand.org/myfile/is/greater.mp3');
    strictEqual ( playable.description, 'some description' );
    strictEqual ( playable.title, 'this should be the title; from scheme definition' );
    strictEqual ( playable.image_sm, 'small_image.png' );
    strictEqual ( playable.image_sm, 'small_image.png' );
    strictEqual ( playable.position, 100);
    strictEqual ( playable.duration, 2000);
    strictEqual ( playable.buffer_time, 3);
    strictEqual ( playable.downloadable, false );
    strictEqual ( playable.type, 'audio' );
});

test("basic scheme alias tests", function() {

    var scheme_map = APMPlayerTestSetup.getCustomSchemeMap();
    fixture.custom_schemes.init(scheme_map);

    var playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getCustomSchemeAliasLivestreamObj());
    strictEqual ( playable.flash_server_url, 'rtmp://flashserver.org/news');
    strictEqual ( playable.flash_file_path, 'news.stream');
    strictEqual ( playable.http_file_path, 'http://test.publicradio.org:80/');
    strictEqual ( playable.position, 0);
    strictEqual ( playable.duration, 0);
    strictEqual ( playable.buffer_time, 6);
    strictEqual ( playable.downloadable, false );
    strictEqual ( playable.type, 'live_audio' );

    var playable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.getCustomSchemeAliasLivestreamNoBufferObj());
    strictEqual ( playable.flash_server_url, 'rtmp://flashserver.org/other');
    strictEqual ( playable.flash_file_path, 'other.stream');
    strictEqual ( playable.http_file_path, 'http://test.publicradio.org:80/');
    strictEqual ( playable.position, 5000);
    strictEqual ( playable.buffer_time, 3);
    strictEqual ( playable.downloadable, false );
    strictEqual ( playable.type, 'live_audio' );

});
