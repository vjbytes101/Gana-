$(document).ready(function() {

    $(".addSongButton").click((x)=>{
        var $target = $(x.currentTarget);
        var songName = $target.data() || {};
        songName = songName.songname;
        var postUrl = "/addsongtouser?songName=" + songName;
        $.post(postUrl, (e)=>{
            $target.addClass('hide');
        });
    });

});