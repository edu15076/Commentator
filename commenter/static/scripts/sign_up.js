function validateUsername(username) {
    return /^[\w@.+\-_]{1,150}$/g.test(username);
}

function emailError(e) {
    $.ajax({
        data: $('#sign-up').serialize(),
        url: '/validate_email/',

        success: response => {
            let $idEmail = $('#id_email');
            let emailRemoveError = true;
            let valErr = toNewId($idEmail, 'valerremail');
            let $valErr = $idSelector(valErr);
        
            if (response.email_not_valid) {
                $idEmail.addClass('error-field');
                if (!$valErr.length)
                    $idEmail.after(`<small id="${valErr}" class="small-error">Invalid email.</small>`);
                emailRemoveError = false;
            } else
                $valErr.remove();

            let inUseErr = toNewId($idEmail, 'inuseerremail');
            let $inUseErr = $idSelector(inUseErr);

            if (response.email_in_use) {
                $idEmail.addClass('error-field');
                if (!$inUseErr.length)
                    $idEmail.after(`<small id="${inUseErr}" class="small-error">Email already in use.</small>`);
            } else {
                if (emailRemoveError)
                    $idEmail.removeClass('error-field');
                $inUseErr.remove();
            }
        },

        error: response => {
            console.log('There was an error validating the Email.');
        }
    });
}

function usernameError(e) {
    let usernameRemoveError = true;
    let $idUsername = $('#id_username');

    if (!validateUsername($idUsername.val())) {
        $idUsername.addClass('error-field');
        $('#hint_id_username').addClass('small-error');
        usernameRemoveError = false;
    } else
        $('#hint_id_username').removeClass('small-error');

    $.ajax({
        data: $('#sign-up').serialize(),
        url: '/username_in_use/',
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },

        success: response => {
            let inUseErr = toNewId($idUsername, 'inuseerrusername');
            let $inUseErr = $idSelector(inUseErr);

            if (response.username_in_use) {
                $idUsername.addClass('error-field');
                if (!$inUseErr.length)
                    $idUsername.after(`<small id="${inUseErr}" class="small-error">Username already in use.</small>`);
            } else {
                if (usernameRemoveError)
                    $idUsername.removeClass('error-field');
                $inUseErr.remove();
            }
        },

        error: response => {
            console.log('There was an error validating the Username.');
        }
    });
}

function password2Error(e) {
    let $passwordField = $('#id_password1');
    let $password2Field = $('#id_password2');
    let fieldId = 'p_' + $password2Field.attr('id');
    let $newFieldId = $('#' + fieldId);
    
    if ($passwordField.val() !== $password2Field.val()) {
        $password2Field.addClass('error-field');

        if (!$newFieldId.length)
            $password2Field.after(`<small id="${fieldId}" class="small-error">Passwords don't match.</small>`);
    } else {
        $password2Field.removeClass('error-field');
        $newFieldId.remove();
    }
}

function passwordError(e) {

    $.ajax({
        type: 'POST',
        data: $('#sign-up').serialize(),
        url: '/validate_password/',
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },

        success: response => {
            let removeError = true;
            let $passwordField = $('#id_password1');

            if (response.invalid_password.find(str => str.includes('The password is too similar'))) {
                $('#hint_id_password1 ul li:first-of-type').addClass('small-error');
                $passwordField.addClass('error-field');
                removeError = false;
            } else
                $('#hint_id_password1 ul li:first-of-type').removeClass('small-error');
            
            if (response.invalid_password.includes('This password is too short. It must contain at least 8 characters.')) {
                $('#hint_id_password1 ul li:nth-of-type(2)').addClass('small-error');
                $passwordField.addClass('error-field');
                removeError = false;
            } else
                $('#hint_id_password1 ul li:nth-of-type(2)').removeClass('small-error');
            
            if (response.invalid_password.includes('This password is too common.')) {
                $('#hint_id_password1 ul li:nth-of-type(3)').addClass('small-error');
                $passwordField.addClass('error-field');
                removeError = false;
            } else
                $('#hint_id_password1 ul li:nth-of-type(3)').removeClass('small-error');
            
            if (response.invalid_password.includes('This password is entirely numeric.')) {
                $('#hint_id_password1 ul li:last-of-type').addClass('small-error');
                $passwordField.addClass('error-field');
                removeError = false;
            } else
                $('#hint_id_password1 ul li:last-of-type').removeClass('small-error');

            if (removeError)
                $passwordField.removeClass('error-field');
        },

        error: response => {
            console.log('Error validating password.');
        }
    });

    password2Error(e);
}

$(document).ready(() => {
    $('#sign-up #id_username').keyup(usernameError);
    $('#sign-up #id_username').blur(usernameError);
    
    $('#sign-up #id_email').keyup(emailError);
    $('#sign-up #id_email').blur(emailError);
    
    $('#sign-up #id_password1').keyup(passwordError);
    $('#sign-up #id_password1').blur(passwordError);
});


$('#sign-up #id_password2').keyup(password2Error);
$('#sign-up #id_password2').blur(password2Error);

$('#submit-id-submit').click(e => {
    let fields = document.querySelectorAll('#sign-up input:not(#submit-id-submit):not([type="hidden"])');

    for (let fieldEl of fields) {
        let $field = $(fieldEl);
        if ($field.val() === '') {
            $field.addClass('error-field');
            $field.addClass('submit-added-error-field');
        } else if ($field.hasClass('submit-added-error-field')) {
            $field.removeClass('error-field');
            $field.removeClass('submit-added-error-field');
        }
    }
    
    if ($('.error-field').length)
        e.preventDefault();
});
