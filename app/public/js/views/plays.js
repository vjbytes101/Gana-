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

    // $('.js-rating').click((event) => {
    //     if (event.target) {
    //         var $inputElement = $(event.target).parent() && $(event.target).parent().siblings();
    //         var data = $inputElement.data();
    //         var val = $inputElement.val();
    //         if (data.trackid && val) {
    //             $.ajax({
    //                 url: '/rating',
    //                 type: 'POST',
    //                 data: { sid: data.trackid, rating: val},
    //                 success: function(data) {
    //                     console.log("rating saved");
    //                 },
    //                 error: function(jqXHR) {
    //                     console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
    //                 }
    //             });
    //         }
    //     }
    // });
});