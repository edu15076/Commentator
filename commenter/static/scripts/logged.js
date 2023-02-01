let profileName = '';
let username = '';

$(document).ready(() => {
    $.ajax({
        type: 'GET',
        url: '/is_sign/',
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },

        success: response => {
            if (response.logged) {
                profileName = response.name;
                username = response.username;
            }
        },

        error: response => {
            console.log('There was an error getting the User.');
        }
    });
});

addEventListener('click', e => {
    if (!$('.logged').length)
        return;

    let isZero = $('.logged > div').hasClass('zero');
    let imgClick = document.querySelector('.logged > img').contains(e.target);
    if (!isZero && (!document.querySelector('.logged > div').contains(e.target) || imgClick)) {
        
       $('.logged > div').addClass('zero');
       $('.logged > div p').addClass('display-none');
       $('.logged > div a').addClass('display-none');

    } else if (isZero && imgClick) {
        $('.logged > div').removeClass('zero');
        setTimeout(() => {
            $('.logged > div p').removeClass('display-none');
            $('.logged > div a').removeClass('display-none');
        }, 75);
    }
});
