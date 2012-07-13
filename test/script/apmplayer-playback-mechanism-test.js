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
var fixture;

module("APMPlayerFactory::PlaybackMechanism", {
     setup: function() {

        fixture = this;
        fixture.expected_types = {
            FLASH : 'FLASH',
            HTML5 : 'HTML5'
        };
        fixture.invalid_types = {
            REAL : 'REAL',
            WINAMP : 'WINAMP'
        };
        APMPlayer.mechanism.setSolutions([fixture.expected_types.FLASH, fixture.expected_types.HTML5]);
    },
    teardown: function() {
        APMPlayer.events.removeListeners();
        fixture.expected_types = null;
    }
});


test("test object set-up expected results", function() {

    deepEqual ( APMPlayer.mechanism.type, fixture.expected_types, 'expected_types should equal APMPlayer.mechanism.type ');

    var expected_solutions_array = [fixture.expected_types.FLASH, fixture.expected_types.HTML5];
    deepEqual ( APMPlayer.mechanism.solutions, expected_solutions_array, 'expected_solutions_array should equal APMPlayer.mechanism.solutions ');
});


test("test isValid()", function() {

    strictEqual ( true, APMPlayer.mechanism.isValid(fixture.expected_types.FLASH), 'FLASH is a valid type');
    strictEqual ( true, APMPlayer.mechanism.isValid(fixture.expected_types.HTML5), 'HTML5 is a valid type');
    strictEqual ( false, APMPlayer.mechanism.isValid(fixture.invalid_types.WINAMP), 'WINAMP is not a valid type');
});


test("test getCurrentSolution() + removeCurrentSolution() + setSolutions()", function() {

    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), fixture.expected_types.FLASH, 'FLASH is current default solution');
    strictEqual ( APMPlayer.mechanism.removeCurrentSolution(), true, 'should return true, success upon removing solution');
    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), fixture.expected_types.HTML5, 'HTML5 is current default solution');
    strictEqual ( APMPlayer.mechanism.removeCurrentSolution(), true, 'should return true, success upon removing solution');
    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), null, 'no current solutions, should return null');

    //test adding non-array, shouldn't be allowed
    var bad_new_solutions = fixture.expected_types.HTML5;
    strictEqual ( APMPlayer.mechanism.setSolutions(bad_new_solutions), false, 'non-array param passed, should return false');

    //test adding single item back to mechanism
    var new_solutions = [ fixture.expected_types.HTML5 ];
    strictEqual ( APMPlayer.mechanism.setSolutions(new_solutions), true, 'array passed, should work');
    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), fixture.expected_types.HTML5, 'HTML5 is current default solution');

    //test setting an array that includes invalid types.  those types should be removed from mix.
    var new_solutions_w_invalid = [ fixture.invalid_types.WINAMP, fixture.expected_types.FLASH, fixture.invalid_types.REAL, fixture.expected_types.HTML5 ];
    strictEqual ( APMPlayer.mechanism.setSolutions(new_solutions_w_invalid), true, 'array passed, should work');
    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), fixture.expected_types.FLASH, 'FLASH should be first, default solution, not WINAMP');
    strictEqual ( APMPlayer.mechanism.removeCurrentSolution(), true, 'should return true, success upon removing solution');
    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), fixture.expected_types.HTML5, 'HTML5 is current default solution');
    strictEqual ( APMPlayer.mechanism.removeCurrentSolution(), true, 'should return true, success upon removing solution');
    strictEqual ( APMPlayer.mechanism.getCurrentSolution(), null, 'no current solutions, should return null');
});


asyncTest("test player failure event on load()", 3, function() {

    var threeSecPlayable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.get3secondAPMStaticAudioObj());
    var result = APMPlayer.mechanism.setSolutions([]);

    strictEqual ( result, true, 'setSolutions of [] should return true');
    APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_FAILURE, function () {
        ok(true, 'PLAYER_FAILURE event fired');
    });

    APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY,  function () {
        ok(true, 'PLAYER_READY event fired');
        APMPlayer.play(threeSecPlayable);
    });

    setTimeout(function() {
        start();
    }, 1000);
});


asyncTest("test player failure event on reset()", 1, function() {

    var threeSecPlayable = APMPlayerFactory.getPlayable(APMPlayerTestSetup.get3secondAPMStaticAudioObj());


    APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_FAILURE, function () {
        ok(true, 'PLAYER_FAILURE event fired');
    });

    APMPlayer.reset([]);  //adding empty array (no playback mechanisms)

    setTimeout(function() {
        start();
    }, 1000);
});


