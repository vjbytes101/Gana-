$(document).ready(function() {
    $('#createpl').click(function(){
        var key = $("input[name='name']").val();
        var type = $( "#pltype-tf option:selected" ).text();
        var Qtype = 'insert';
        if(key.length>0){
            $.ajax({
                url: "/createplaylist",
                type: "post", 
                data: { 
                    key: key,
                    type:type,
                    Qtype:Qtype,
                    urlKey:''
                },
                success: function(data,response) {
                    alert("Playlist created successfully");
                    window.location.href = '/addplaylist';
                },
                error: function(xhr) {
                    alert(xhr);
                }
            });
        }else{
            alert("Please enter name of playlist.");
        }
    });
    $('#updatepl').click(function(){
        var key = $("input[name='name']").val();
        var Qtype = 'update';
        var type = $( "#pltype-tf option:selected" ).text();
        var urlKey = getSearchParams("key");
        if(key.length>0){
            $.ajax({
                url: "/createplaylist",
                type: "post", 
                data: { 
                    key: key,
                    type:type,
                    Qtype:Qtype,
                    urlKey:urlKey
                },
                success: function(data,response) {
                    alert("Playlist updated successfully");
                    window.location.href = '/addplaylist';
                },
                error: function(xhr) {
                    alert(xhr);
                }
            });
        }else{
            alert("Please enter name of playlist.");
        }
    });
    $('.del').click(function(){
        var pid = $(this).attr("id");
        $.ajax({
            url: "/addplaylist",
            type: "post", 
            data: { 
                key: pid
            },
            success: function(data,response) {
                alert("Playlist deleted successfully");
                window.location.href = '/addplaylist';
            },
            error: function(xhr) {
                alert(xhr);
            }
        });
     });
    function getSearchParams(k){
        var p={};
        location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
        return k?p[k]:p;
    }
});