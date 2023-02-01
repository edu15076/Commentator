let $editAbout = $('#about .edit-pen');
let $cancelBtn = $('#about > div > div:first-of-type');
let $saveBtn = $('#about > div > div:last-of-type');
let $aboutText = $('#about p');
let previousText = '';


$editAbout.click(() => {
    previousText = $aboutText.html();

    $aboutText.attr('contenteditable', 'plaintext-only');
    $aboutText.focus();
    $('#about > div').removeClass('display-none');
    $editAbout.addClass('display-none');

    let cloneAs = [];

    let links = document.querySelectorAll('#about p > a');

    for (let i = 0; i < links.length; i++) {
        cloneAs.push($(links[i]).html());
        $(links[i]).replaceWith(cloneAs[i]);
    }
});


function fixAbout() {
    $aboutText.removeAttr('contenteditable');
    $('#about > div').addClass('display-none');
    $editAbout.removeClass('display-none');
}


$cancelBtn.click(() => { 
    $aboutText.html(previousText);
    fixAbout();
});


let $editUser = $('#edit-user');
let $saveUserChg = $('#save-user-edit');
let $cancelUserChg = $('#cancel-user-edit');

let $nameInput = $('#edit-user > div:first-of-type > input');
let $showEmailInput = $('#edit-user > div:nth-of-type(2)  input');
let $gitHubInput = $('#edit-user > div:nth-of-type(3) > input');

let gitHubOriginal = $gitHubInput.val();
let showEmailOriginal = $showEmailInput.prop('checked');


$('#main-name .edit-pen').click(() => {
    $editUser.removeClass('display-none');
    $('#main-name .edit-pen').addClass('display-none');
    $('#delete-maybe').css('margin-top', '23rem');
});


$cancelUserChg.click(() => {
    $editUser.addClass('display-none');
    $('#main-name .edit-pen').removeClass('display-none');
    $('#delete-maybe').css('margin-top', '1.5rem');
    
    $gitHubInput.val(gitHubOriginal);
    $showEmailInput.prop('checked', showEmailOriginal);
    $nameInput.val(profileName);
});


$('#delete-maybe').click(() => {
    $('#delete-sure').removeClass('display-none');
});


$('#delete-sure > div > div').click(() => {
    $('#delete-sure').addClass('display-none');
});


function checkUserChanges(callback) {
    let valErr = 'github-url-err';

    function checkName() {
        if ($nameInput.val() === '')
                $nameInput.addClass('error-field');
            else
                $nameInput.removeClass('error-field');

            if (!$('.error-field').length)
                callback();
    }

    function checkUserGithub(callback) {    
        $.ajax({
            type: "GET",
            url: "/validate_github/",
            data: $editUser.serialize(),
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
    
            success: response => {
                if (response.valid !== '') {
                    $gitHubInput.addClass('error-field');
                    $('#' + valErr).remove();
                    $gitHubInput.after(`<small id="${valErr}" class="small-error">${response.valid}</small>`);
                } else {
                    $gitHubInput.removeClass('error-field');
                    $('#' + valErr).remove();
                }
    
                if (response.url !== '')
                    $gitHubInput.val(response.url);
    
                callback();
            }
        });
    }

    if ($gitHubInput.val() !== '') {
        checkUserGithub(checkName);
    } else {
        $gitHubInput.removeClass('error-field');
        $('#' + valErr).remove();
        checkName();
    }
}


$(document).ready(() => {
    $saveBtn.click(() => {
        fixAbout();

        $.ajax({
            type: "POST",
            url: "/user/self/att_bio/",
            data: JSON.stringify({bio: $aboutText.html()}),
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": getCookie("csrftoken"),
            },

            success: response => {
                alertProcess(true, 'Changes made successfully.', $('#user-page'));
            },
            error: response => {
                alertProcess(false, 'There was an error applying the changes.', $('#user-page'));
            }
        });
    });


    $saveUserChg.click(() => {
        
        checkUserChanges(() => {
            $.ajax({
                data: JSON.stringify({
                    name: $nameInput.val(),
                    show_email: $showEmailInput.prop('checked'),
                    github: $gitHubInput.val(),
                }),
        
                type: 'POST',
                url: '/user/self/att_info/',
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
        
                success: response => {
                    if (response.posted) {
                        alertProcess(true, 'Changes made successfully.', $('#user-page'));
                        $editUser.addClass('display-none');
                        $('#main-name .edit-pen').removeClass('display-none');
                        $('#delete-maybe').css('margin-top', '1.5rem');


                        if ($showEmailInput.prop('checked') !== showEmailOriginal) {
                            if ($showEmailInput.prop('checked')) {
                                $('#accounts > a:last-of-type').removeClass('display-none');
                                $('#accounts > a:last-of-type').attr('href', `mailto:${response.email}`);
                            } else {
                                $('#accounts > a:last-of-type').addClass('display-none');
                                $('#accounts > a:last-of-type').attr('href', '/');
                            }

                            showEmailOriginal = $showEmailInput.prop('checked');
                        }

                        if ($gitHubInput.val() !== gitHubOriginal) {
                            $('#accounts > a:first-of-type').attr('href', $gitHubInput.val());

                            if ($gitHubInput.val() !== '')
                                $('#accounts > a:first-of-type').removeClass('display-none');
                            else
                                $('#accounts > a:first-of-type').addClass('display-none');

                            gitHubOriginal = $gitHubInput.val();
                        }

                        if ($nameInput.val() !== profileName) {
                            profileName = $nameInput.val();
                            
                            let penImg = $('#main-name > h2 > img').clone().wrap('<p/>').parent().html();

                            $('#main-name > h2').text(profileName);
                            $('#main-name > h2').prepend(penImg);
                            $('#main-name > h2 > img').click(() => {
                                $editUser.removeClass('display-none');
                                $('#main-name .edit-pen').addClass('display-none');
                                $('#delete-maybe').css('margin-top', '23rem');
                            });
                            $('.logged > div > a:first-of-type').text(profileName);
                        }
                    } else
                        alertProcess(false, 'There was an error applying the changes.', $('#user-page'));
                },
                error: response => {
                    alertProcess(false, 'There was an error applying the changes.', $('#user-page'));
                }
            });

        });
    });

});

