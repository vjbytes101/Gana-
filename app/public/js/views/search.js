$(document).ready(function() {
    var ajaxres = "";
    $('#search-btn1').click(function(){
        var key = $("input[name='search']").val();
        var trHTML = '';
        var atHTML = '';
        $("#searchres").html('') ;
        /*$.get("/search-query?key="+key, function(data, status){
            alert("Data: " + data );
        });*/
        if(key.length>0){
            $.ajax({
                url: "/search-query",
                type: "get", //send it through get method
                data: { 
                    key: key
                },
                success: function(response) {
                    var lenSongS,lenAb,lenTk,lenAt,lenPl = 'false';
                    ajaxres = response;
                    if(response){
                        if(response.SongSearch){
                            if(response.SongSearch.length>0){
                                lenSongS = 'true';
                            } 
                        }
                        if(response.AlbumSearch){
                            if(response.AlbumSearch.length>0){
                                lenAb = 'true';
                            } 
                        }
                        if(response.TrackSearch){
                            if(response.TrackSearch.length>0){
                                lenTk = 'true';
                            } 
                        }
                        if(response.ArtistSearch){
                            if(response.ArtistSearch.length>0){
                                lenAt = 'true';
                                atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Artist Name</th>'
                                $.each(response.ArtistSearch, function (key,value) {
                                    atHTML += 
                                    '<tr><td><a href="'+ value.aid +'">' + value.aname + 
                                    '</a></td></tr>'; 
                                });
                                atHTML += '</table></div>';
                                $('#artist').append(atHTML);
                            } 
                        }
                        if(response.PlayListSearch){
                            if(response.PlayListSearch.length>0){
                                lenPl = 'true';
                            } 
                        }
                    }
                    if(lenSongS == 'true'){
                        trHTML += '<div id="nav"><a href="#searchres">Top Result</a>&nbsp;&nbsp;&nbsp;&nbsp;';
                        if(lenAt == 'true'){
                            trHTML += '<a href="#" id="artist">Artist</a>&nbsp;&nbsp;&nbsp;&nbsp;';
                        }
                        if(lenTk == 'true'){
                            trHTML += '<a href="#box3">Tracks</a>&nbsp;&nbsp;&nbsp;&nbsp;';
                        }
                        if(lenAb == 'true'){
                            trHTML += '<a href="#box4">Album</a>&nbsp;&nbsp;&nbsp;&nbsp;';
                        }
                        if(lenPl == 'true'){
                            trHTML += '<a href="#box5">PlayList</a>&nbsp;&nbsp;&nbsp;&nbsp;';
                        }
                        trHTML += '</div>';
                        trHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table"> <tr><th align="center">Title</th><th align="center">Duration</th><th align="center">Artist Name</th>'
                        $.each(response.SongSearch, function (key,value) {
                            trHTML += 
                            '<tr><td>' + value.stitle + 
                            '</td><td>' + value.sduration + 
                            '</td><td>' + value.aname + 
                            '</td></tr>';     
                        });
                        trHTML += '</table></div>';
                        $('#searchres').append(trHTML);
                        //$("#res").html(response) ;
                    }else{
                        alert("No result found in database. Please try again with different keyword");
                    }
                },
                error: function(xhr) {
                    alert(xhr);
                }
            });
            $('#artist').click(function(){
                alert(1);
            });
        }else{
            alert("Please enter keyword to search.");
        }
    });
function check()
{
    $("#searchres").html('') ;
}
});