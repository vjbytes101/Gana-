$(document).ready(function() {
    $('#createpl').click(function(){
        var key = $("input[name='name']").val();
        var type = $( "#pltype-tf option:selected" ).text();
        if(key.length>0){
            $.ajax({
                url: "/createplaylist",
                type: "post", 
                data: { 
                    key: key,
                    type:type
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
});