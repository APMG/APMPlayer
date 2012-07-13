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
var APMPlayerTestSetup = (function () {

    return {  //public
        get3secondAPMStaticAudioObj : function () {
            return {
                identifier: 'apm_audio:/minnesota/archive_portal/apmplayer_test_128.mp3',
                title:'test title',
                description: 'test descr',
                date: 'test date'
            };
        },
        getAPMStaticAudioObj : function () {
            return {
                title:'Midday for Jan 2, 2012',
                description: 'Midday with Gary Eichten',
                identifier: 'apm_audio:/minnesota/news/programs/midday_2/2012/01/02/midday_hour_2_20120102_64.mp3'
            };
        },
        getCSFLiveAudioObj : function () {
            return  {
                title:'CSF live stream',
                description: 'test description',
                identifier: 'apm_live_audio:/csf'
            }
        },
        getKCMPLiveAudioObj : function () {
            return  {
                title:'89.3 The Current',
                description: 'Live streaming from 89.3',
                identifier: 'apm_live_audio:/mpr_current'
            }
        },
        getKNOWLiveAudioObj : function () {
            return  {
                identifier: 'apm_live_audio:/mpr_news',
                title: '91.1 KNOW'
            }
        },
        getBasicStaticAudioObj : function () {
            return {
                title:'test audio',
                description: 'my basic non-APM audio',
                other_field: 'test field',
                type: 'audio',
                identifier: 'my audio',
                flash_server_url: 'rtmp://server/',
                flash_file_path: 'mp3:path/file.mp3',
                http_file_path: 'http://server/file.mp3',
                buffer_time: 5
            }
        },
        getCustomSchemeMap : function () {
            return {
                custom_normal : {
                    flash_server_url  : 'rtmp://flashserver.org/music',
                    flash_file_prefix : 'mp3:ondemand',
                    http_file_prefix  : 'http://ondemand.org',
                    buffer_time : 3,
                    type : 'audio'
                },
                custom_normal_more : {
                    flash_server_url  : 'rtmp://flashserver.org/music',
                    flash_file_prefix : 'mp3:ondemand',
                    http_file_prefix  : 'http://ondemand.org',
                    title: 'this should be the title; from scheme definition',
                    position: 100,
                    duration: 2000,
                    buffer_time : 3,
                    type : 'audio'
                },
                custom_aliases : {
                    livestream : {
                        flash_server_url : 'rtmp://flashserver.org/news',
                        flash_file_path : 'news.stream',
                        http_file_path : 'http://test.publicradio.org:80/',
                        buffer_time : 6,
                        downloadable : false,
                        type : 'live_audio'
                    },
                    livestream_2 : {
                        flash_server_url : 'rtmp://flashserver.org/other',
                        flash_file_path : 'other.stream',
                        http_file_path : 'http://test.publicradio.org:80/',
                        downloadable : false,
                        type : 'live_audio'
                    }
                }
            }
        },
        getCustomSchemeNormalObj : function () {
            return  {
                identifier: 'custom_normal:/myfile/is/great.mp3'
            }
        },
        getCustomSchemeNormalMoreObj : function () {
            return  {
                identifier: 'custom_normal_more:/myfile/is/greater.mp3',
                downloadable: false,
                description: 'some description',
                title: 'passed in title',
                image_sm: 'small_image.png',
                image_lg: 'large_image.png'
            }
        },
        getCustomSchemeAliasLivestreamObj : function () {
            return  {
                identifier: 'custom_aliases:/livestream'
            }
        },
        getCustomSchemeAliasLivestreamNoBufferObj : function () {
            return  {
                identifier: 'custom_aliases:/livestream_2',
                downloadable : true,   //note this should be overridden by customScheme
                position : 5000
            }
        },
        getAPMSchemeMap : function () {
            return {
                apm_audio : {
                    flash_server_url  : 'rtmp://archivemedia.publicradio.org/music',
                    flash_file_prefix : 'mp3:ondemand',
                    http_file_prefix  : 'http://ondemand.publicradio.org',
                    buffer_time : 3,
                    type : 'audio'
                },
                apm_live_audio : {
                    mpr_news : {
                        flash_server_url : 'rtmp://archivemedia.publicradio.org/news',
                        flash_file_path : 'news.stream',
                        http_file_path : 'http://newsstream1.publicradio.org:80/',
                        buffer_time : 6,
                        type : 'live_audio'
                    },
                    mpr_current : {
                        flash_server_url : 'rtmp://archivemedia.publicradio.org/kcmp',
                        flash_file_path : 'kcmp.stream',
                        http_file_path : 'http://currentstream1.publicradio.org:80/',
                        buffer_time : 6,
                        type : 'live_audio'
                    },
                    csf : {
                        flash_server_url : 'rtmp://archivemedia.publicradio.org/csf',
                        flash_file_path : 'csf.stream',
                        http_file_path : 'http://204.93.222.85:80/csf-nopreroll',
                        buffer_time : 6,
                        type : 'live_audio'
                    },
                    wpbi : {
                        flash_server_url : 'rtmp://archivemedia.publicradio.org/wpbistream',
                        flash_file_path : 'wpbi.stream',
                        http_file_path : 'http://wpbistream1.lbdns-streamguys.com:80/wpbistream',
                        buffer_time : 6,
                        type : 'live_audio'
                    }
                }
            }
        }
    }
}());  //end APMPlayerTestSetup()
