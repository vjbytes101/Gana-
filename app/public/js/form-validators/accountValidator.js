function AccountValidator() {
    // build array maps of the form inputs & control groups //

    this.formFields = [$('#name-tf'), $('#user-tf'), $('#email-tf'), $('#city-tf'), $('#pass-tf')];
    this.controlGroups = [$('#name-cg'), $('#user-cg'), $('#email-cg'), $('#city-cg'), $('#pass-cg')];

    // bind the form-error modal window to this controller to display any errors //

    this.alert = $('.modal-form-errors');
    this.alert.modal({ show: false, keyboard: true, backdrop: true });

    this.validateName = function(s) {
        return s.length >= 3;
    }

    this.validateCity = function(s) {
        return s != 'Select City';
    }

    this.validatePassword = function(s) {
        // if user is logged in and hasn't changed their password, return ok
        if ($('#userId').val() && s === '') {
            return true;
        } else {
            return s.length >= 6;
        }
    }

    this.showErrors = function(a) {
        $('.modal-form-errors .modal-body p').text('Please correct the following problems :');
        var ul = $('.modal-form-errors .modal-body ul');
        ul.empty();
        for (var i = 0; i < a.length; i++) ul.append('<li>' + a[i] + '</li>');
        this.alert.modal('show');
    }

}

AccountValidator.prototype.showInvalidEmail = function() {
    this.controlGroups[2].addClass('error');
    this.showErrors(['That email address is already in use.']);
}

AccountValidator.prototype.showInvalidUserName = function() {
    this.controlGroups[1].addClass('error');
    this.showErrors(['That username is already in use.']);
}
AccountValidator.prototype.showInvalidInsertion = function() {
    this.controlGroups[1].addClass('error');
    this.showErrors(['Creation failed please try again.']);
}

AccountValidator.prototype.validateForm = function() {
    var e = [];
    for (var i = 0; i < this.controlGroups.length; i++) this.controlGroups[i].removeClass('error');
    
    if (this.validateName(this.formFields[0].val()) == false) {
        this.controlGroups[0].addClass('error');
        e.push('Please Enter Your Name');
    }
    if (this.validateName(this.formFields[1].val()) == false) {
        this.controlGroups[1].addClass('error');
        e.push('Please Choose A Username');
    }
    if (this.validateName(this.formFields[2].val()) == false) {
        this.controlGroups[2].addClass('error');
        e.push('Please enter email');
    }
    if (this.validateCity(this.formFields[3].val()) == false) {
        this.controlGroups[3].addClass('error');
        e.push('Please enter city');
    }
    if (this.validatePassword(this.formFields[4].val()) == false) {
        this.controlGroups[4].addClass('error');
        e.push('Password Should Be At Least 6 Characters');
    }
    if (e.length) this.showErrors(e);
    return e.length === 0;
}