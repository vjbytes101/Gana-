$(document).ready(function() {
    $('.js-play-song').click((event) => {
        if (event.target) {
            var data = $(event.target).data();
            if (data.trackid) {
                $('.spotify-player').html('<iframe src="https://open.spotify.com/embed?uri=spotify:track:' + data.trackid + '" width="300" height="80" frameborder="0" allowtransparency="true"></iframe>')
                var sid = data.trackid;
                var pid = data.pid;
                var abid = data.abid;
                $.ajax({
                    url: '/addToPlay',
                    type: 'post',
                    data:{
                        sid:sid,
                        pid:pid,
                        abid:abid
                    },
                    success: function(data) {
                        console.log("Play updated sucessfully");
                    },
                    error: function(jqXHR) {
                        console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                    }
                });
            }
        }
    });

    $('.js-rating').click((event) => {
        if (event.target) {
            var $inputElement = $(event.target).parent() && $(event.target).parent().siblings();
            var data = $inputElement.data();
            var val = $inputElement.val();
            if (data.trackid && val) {
                $.ajax({
                    url: '/rating',
                    type: 'POST',
                    data: { sid: data.trackid, rating: val},
                    success: function(data) {
                        console.log("rating saved");
                    },
                    error: function(jqXHR) {
                        console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                    }
                });
            }
        }
    });

    $('#artist-like').click(()=>{
        var data = $('#artist-like').data();
        var like = $('#artist-like').text() == "Like" ? 1 : 0;
        if(data && data.aid){
            $.ajax({
                url: '/like-artist',
                type: 'POST',
                data: { aid: data.aid, like: like },
                success: function (data) {
                    $('#artist-like').text(data);
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }
    });

    function updateLikeStatus(){
        var data = $('#artist-like').data();
        if(data && data.aid){
            $.ajax({
                url: '/check-like',
                type: 'POST',
                data: { aid: data.aid },
                success: function (data) {
                    if(data.length){
                        $('#artist-like').text('Unlike');
                    } else {
                        $('#artist-like').text('Like');
                    }
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }
    }
    updateLikeStatus();

    $('#user-follow').click(()=>{
        var data = $('#user-follow').data();
        var follow = $('#user-follow').text() == "Follow" ? 1 : 0;
        if(data && data.pid){
            $.ajax({
                url: '/follow-user',
                type: 'POST',
                data: { pid: data.pid, follow: follow },
                success: function (data) {
                    $('#user-follow').text(data);
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }
    });

    function updateFollowStatus(){
        var data = $('#user-follow').data();
        if(data && data.pid){
            $.ajax({
                url: '/check-Follow',
                type: 'POST',
                data: { pid: data.pid },
                success: function (data) {
                    if(data.length){
                        $('#user-follow').text('Unfollow');
                    } else {
                        $('#user-follow').text('Follow');
                    }
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }
    }
    updateFollowStatus();

    $('.btn-clk,.btn-clk1').click(function(){
        var sid = $(this).attr('id');
        var pidc = getSearchParams("val");
        var keyV = getSearchParams("key");
        $('#plname').html('');
        if(keyV =='pidc'){
            $.ajax({
                url: '/addmyPl',
                type: 'post',
                data:{
                    sid:sid,
                    pid:pidc,
                    keyV:'pidc'
                },
                success: function(data) {
                    console.log("PlayList removed sucessfully");
                    location.reload();
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }else{
            $.ajax({
                url: '/getmyPl',
                type: 'get',
                success: function(data) {
                    console.log("get PlayList");
                    $('#plname').append($('<option>', { 
                        value: 'Select Playlist',
                        text : 'Select Playlist',
                        id: 'Select Playlist'
                    }));
                    $.each(data, function (i, item) {
                        $('#plname').append($('<option>', { 
                            value: sid,
                            text : item.ptitle,
                            id: item.pid,
                            keyV:''
                        }));
                    });
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }
    });

    $('#subPl').click(function(){
        var selectedVal = $('#plname :selected').text();
        var sid = $('#plname :selected').val();
        var pid = $('option:selected').attr('id');
        if(selectedVal != 'Select Playlist'){
            $.ajax({
                url: '/addmyPl',
                type: 'post',
                data:{
                    sid:sid,
                    pid:pid,
                    keyV:''
                },
                success: function(data) {
                    console.log("PlayList added sucessfully");
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                }
            });
        }
    });
    var keyParamter = getSearchParams('key');
    if(keyParamter == 'pid'){
        $(".btn-clk1").hide();
        $(".btn-clk").show();  
        
    }else if(keyParamter == 'pidc'){
        $(".btn-clk1").show();
        $(".btn-clk").hide(); 
    }
    function getSearchParams(k){
        var p={};
        location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
        return k?p[k]:p;
    }

    function fillSimilarArtist(){
        var data = $('#similar-artist').data('data');
        if(data && data.length){
            var atHTML = '';
            atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Similar Artist</th>'
            $.each(data, function (key,value) {
                atHTML +='<tr><td><a href="/plays?key=aid&val='+ value.aid +'">' + value.aname + '</a></td></tr>'; 
            });
            atHTML += '</table></div>';
            $('#artistres').html(atHTML);
        }
    }
    fillSimilarArtist();

    function fillSimilarAlbum(){
        var data = $('#similar-album').data('data');
        if(data && data.length){
            var atHTML = '';
            atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Album Name</th>'
            $.each(data, function (key,value) {
                atHTML += '<tr><td><a href="/plays?key=abid&val='+ value.abid +'">' + value.abtitle + '</a></td></tr>'; 
            });
            atHTML += '</table></div>';
            $('#albumres').html(atHTML);
        }
    }
    fillSimilarAlbum();

    function fillSimilarPlaylist(){
        var data = $('#similar-playlist').data('data');
        if(data && data.length){
            var atHTML = '';
            atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Play List Name</th>'
            $.each(data, function (key,value) {
                atHTML += '<tr><td><a href="/plays?key=pid&val='+ value.pid +'">' + value.ptitle + '</a></td></tr>'; 
            });
            atHTML += '</table></div>';
            $('#playlistres').html(atHTML);
        }
    }
    fillSimilarPlaylist();
});