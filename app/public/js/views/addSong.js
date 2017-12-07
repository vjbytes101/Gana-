$(document).ready(function() {

    $('#account-form').ajaxForm({
        success: function(responseText, status, xhr, $form) {
            if (status == 'success') $('.modal-alert').modal('show');
        },
        error: function(e) {
            if (e.responseText == 'email-taken') {
                // av.showInvalidEmail();
            } else if (e.responseText == 'username-taken') {
                // av.showInvalidUserName();
            }
        }
    });
    $('#name-tf').focus();

});