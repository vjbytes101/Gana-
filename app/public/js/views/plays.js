$(document).ready(function() {
    $('.js-play-song').click((event) => {
        if (event.target) {
            var data = $(event.target).data();
            if (data.trackid) {
                $('.spotify-player').html('<iframe src="https://open.spotify.com/embed?uri=spotify:track:' + data.trackid + '" width="300" height="80" frameborder="0" allowtransparency="true"></iframe>')
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
        if(data.aid){
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
        if(data.aid){
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

    $('.btn-clk').click(function(){
        var sid = $(this).attr('id');
        var pidc = getSearchParams("val");
        var keyV = getSearchParams("key");
        $('#plname').html('');
        if(keyV =='pidc'|| keyV =='pid'){
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

    function getSearchParams(k){
        var p={};
        location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
        return k?p[k]:p;
    }
});