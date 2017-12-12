$(document).ready(function() {
    var ajaxres = "";
    $('#topres').hide();
    $('#artist').hide();
    $('#track').hide();
    $('#album').hide();
    $('#playlist').hide();

    function getSearchParams(k) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == k) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    }

    function insertParam(key, value) {
        key = encodeURI(key);
        value = encodeURI(value);

        var kvp = document.location.search.substr(1).split('&');

        var i = kvp.length;
        var x;
        while (i--) {
            x = kvp[i].split('=');

            if (x[0] == key) {
                x[1] = value;
                kvp[i] = x.join('=');
                break;
            }
        }

        if (i < 0) { kvp[kvp.length] = [key, value].join('='); }

        //this will reload the page, it's likely better to store this until finished
        document.location.search = kvp.join('&');
    }

    function pageReload() {
        var q = getSearchParams('q');
        if (q) {
            search(q);
        }
    }
    pageReload();

    $('#search-btn1,#topres').click(function() {
        var key = $("input[name='search']").val() || getSearchParams('q');
        insertParam('q', key);
        search(key);
    });

    function search(key) {
        var trHTML = '';
        var atHTML = '';
        $("#searchres").html('');
        $('#artistres').html('');
        $('#trackres').html('');
        $('#albumres').html('');
        $('#plres').html('');
        if (key.length > 0) {
            $.ajax({
                url: "/search-query",
                type: "get", //send it through get method
                data: {
                    key: key
                },
                success: function(response) {
                    var lenSongS, lenAb, lenTk, lenAt, lenPl = 'false';
                    ajaxres = response;
                    if (response) {
                        if (response.SongSearch) {
                            if (response.SongSearch.length > 0) {
                                lenSongS = 'true';
                            }
                        }
                        if (response.AlbumSearch) {
                            if (response.AlbumSearch.length > 0) {
                                lenAb = 'true';
                            }
                        }
                        if (response.TrackSearch) {
                            if (response.TrackSearch.length > 0) {
                                lenTk = 'true';
                            }
                        }
                        if (response.ArtistSearch) {
                            if (response.ArtistSearch.length > 0) {
                                lenAt = 'true';
                            }
                        }
                        if (response.PlayListSearch) {
                            if (response.PlayListSearch.length > 0) {
                                lenPl = 'true';
                            }
                        }
                    }
                    if (lenSongS == 'true') {
                        $('#topres').show();
                        if (lenAt == 'true') {
                            $('#artist').show();
                        } else { $('#artist').hide(); }
                        if (lenTk == 'true') {
                            $('#track').show();
                        } else { $('#track').hide(); }
                        if (lenAb == 'true') {
                            $('#album').show();
                        } else { $('#album').hide(); }
                        if (lenPl == 'true') {
                            $('#playlist').show();
                        } else { $('#playlist').hide(); }
                        trHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table"> <tr><th align="center">Title</th><th align="center">Duration</th><th align="center">Artist Name</th>'
                        $.each(response.SongSearch, function(key, value) {
                            trHTML +=
                                '<tr><td><a href="/plays?key=sid&val=' + value.sid + '"id="' + value.sid + '">' + value.stitle +
                                '</a></td><td>' + value.sduration +
                                '</td><td>' + value.aname +
                                '</td></tr>';
                        });
                        trHTML += '</table></div>';
                        $('#searchres').html(trHTML);
                        //$("#res").html(response) ;
                    } else {
                        $('#topres').hide();
                        $('#artist').hide();
                        $('#track').hide();
                        $('#album').hide();
                        $('#playlist').hide();
                        alert("No result found in database. Please try again with different keyword");
                    }
                },
                error: function(xhr) {
                    alert(xhr);
                }
            });

        } else {
            alert("Please enter keyword to search.");
        }
    }
    $('#artist').click(function() {
        var atHTML = '';
        if (ajaxres) {
            if (ajaxres.ArtistSearch) {
                if (ajaxres.ArtistSearch.length > 0) {
                    lenAt = 'true';
                    atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Artist Name</th>'
                    $.each(ajaxres.ArtistSearch, function(key, value) {
                        atHTML +=
                            '<tr><td><a href="/plays?key=aid&val=' + value.aid + '">' + value.aname +
                            '</a></td></tr>';
                    });
                    atHTML += '</table></div>';
                    $('#searchres').html('');
                    $('#trackres').html('');
                    $('#albumres').html('');
                    $('#plres').html('');
                    $('#artistres').html(atHTML);
                }
            }
        }
    });
    $('#track').click(function() {
        var atHTML = '';
        if (ajaxres) {
            if (ajaxres.TrackSearch) {
                if (ajaxres.TrackSearch.length > 0) {
                    lenAt = 'true';
                    atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Track Name</th>'
                    $.each(ajaxres.TrackSearch, function(key, value) {
                        atHTML +=
                            '<tr><td><a href="/plays?key=tid&val=' + value.sid + '">' + value.stitle +
                            '</a></td></tr>';
                    });
                    atHTML += '</table></div>';
                    $('#searchres').html('');
                    $('#artistres').html('');
                    $('#albumres').html('');
                    $('#plres').html('');
                    $('#trackres').html(atHTML);
                }
            }
        }
    });
    $('#album').click(function() {
        var atHTML = '';
        if (ajaxres) {
            if (ajaxres.AlbumSearch) {
                if (ajaxres.AlbumSearch.length > 0) {
                    lenAt = 'true';
                    atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Album Name</th>'
                    $.each(ajaxres.AlbumSearch, function(key, value) {
                        atHTML +=
                            '<tr><td><a href="/plays?key=abid&val=' + value.abid + '">' + value.abtitle +
                            '</a></td></tr>';
                    });
                    atHTML += '</table></div>';
                    $('#searchres').html('');
                    $('#artistres').html('');
                    $('#plres').html('');
                    $('#trackres').html('');
                    $('#albumres').html(atHTML);
                }
            }
        }
    });
    $('#playlist').click(function() {
        var atHTML = '';
        if (ajaxres) {
            if (ajaxres.PlayListSearch) {
                if (ajaxres.PlayListSearch.length > 0) {
                    lenAt = 'true';
                    atHTML += '<div class="table-responsive"><table class="table table-striped" id="records_table1"> <th align="center">Play List Name</th>'
                    $.each(ajaxres.PlayListSearch, function(key, value) {
                        atHTML +=
                            '<tr><td><a href="/plays?key=pid&val=' + value.pid + '">' + value.ptitle +
                            '</a></td></tr>';
                    });
                    atHTML += '</table></div>';
                    $('#searchres').html('');
                    $('#artistres').html('');
                    $('#albumres').html('');
                    $('#trackres').html('');
                    $('#plres').html(atHTML);
                }
            }
        }
    });
});