// https://docs.djangoproject.com/en/3.2/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * 
 * @param {boolean} good 
 * @param {string} text
 * @param {jQuery} $main
 */
function alertProcess(good, text, $main) {
    let idLastTO = setTimeout(() => {}, 0);

    while (idLastTO--)
        clearTimeout(idLastTO);

    $('.success').remove();
    $('.error').remove();

    if (good)
        $main.append(`<div class="success"><div>${text}<div class="x-btn green-x">x</div></div></div>`);
    else
        $main.append(`<div class="error"><div>${text}<div class="x-btn">x</div></div></div>`);

    function removeBanners(time) {
        setTimeout(() => {
            $('.success').css('opacity', '0');
            $('.error').css('opacity', '0');

            setTimeout(() => {
                $('.success').remove();
                $('.error').remove();
            }, 50);
        }, time);
    }

    removeBanners(5000);

    $('.x-btn').click(() => {
        removeBanners(10);
    });
}

function toNewId($var, str) {
    return str + '_' + $var.attr('id');
}

function $idSelector(id) {
    return $('#' + id);
}
