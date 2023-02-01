textSlashNToBr = (text) => text.replaceAll('\n', '<br>');

textSpaceEncode = (text) => text.replaceAll('&nbsp;', ' ');

let $actions = $('.comment > .dots');
let $allTabs = $('.comment-edit');

function dotsClickEvent() {
    $actions.on('click',e => {
        let $tabDel = $(e.currentTarget).parent().children(':first');
        $tabDel.css('width', $tabDel.hasClass('opacity0') ? '10rem' : '0');
        $tabDel.toggleClass('opacity0');
    });
}

function tabsClickEvent() {
    $allTabs.on('click', e => {
        let $currComment = $(e.currentTarget).parent();
        let currCommentId = $currComment.children('input').val();

        $.ajax({
            type: 'GET',
            url: `/delete_comment/${currCommentId}/`,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },

            success: response => {
                if (response.removed)
                    $currComment.remove();
                else
                    alertProcess(false, 'There was an error deleting the comment.', $('#user-page'));
            },

            error: response => {
                alertProcess(false, 'There was an error deleting the comment.', $('#user-page'));
            }

        });
    });
}
function dateToday() {
    let today = new Date();
    let month = today.toLocaleString('default', { month: 'short' });
    month = month.charAt(0).toUpperCase() + month.slice(1);
    let day = String(today.getDate()).padStart(2, '0');
    let year = today.getFullYear();

    return `${month} ${day}, ${year}`;
}

let $newComment = $('#write-comment > div[contenteditable="plaintext-only"]');
let $commentButton = $('#write-comment .btn');
let $comments = $('#comments');

let date = '';
let comment = '';
let slashComment = '';

$(document).ready(() => {
    dotsClickEvent();
    tabsClickEvent();

    $commentButton.click(() => {
        slashComment = $newComment.html();
    
        date = dateToday();
        if (slashComment !== '')
            comment = textSlashNToBr(slashComment);

        if (!/^\s*$/g.test(textSpaceEncode(slashComment))) {
            $.ajax({
                data: JSON.stringify({comment: slashComment}),
                type: 'POST',
                url: $('#write-comment .btn').attr('post-url'),
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRFToken": getCookie("csrftoken"),
                },

                success: request => {
                    if (request.posted) {

                        let commentStructure = `
                        <div class="comment box">
                            <div class="comment-edit btn btn-border translate opacity0"><div>Delete comment</div></div>
                            <div class="dots">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <input type="hidden" value="${request.id}">
                            <div>
                                <h3 class="main-text"><a class="discreet" href="/user/${username}/"></a></h3>
                                <h4 class="minor-text"><a class="discreet" href="/user/${username}/">${username}</a></h4>
                            </div>
                            <p>${comment}</p>
                            <h4 class="minor-text date">${date}</h4>
                            <a class="comment-img" href="/user/${username}/"><img class="frame" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"></a>
                        </div>`;

                        $comments.html(commentStructure + $comments.html());
                        $('#comments > .comment:first-of-type > div > h3 > a').text(profileName);
                        $newComment.html('');

                        $actions = $('.comment > .dots');
                        $allTabs = $('.comment-edit');
                        dotsClickEvent();
                        tabsClickEvent();
                    } else {
                        alertProcess(false, 'There was an error adding your comment.', $('#user-page'));
                    }
                },

                error: response => {
                    alertProcess(false, 'There was an error adding your comment.', $('#user-page'));
                }
            });
        }
    });
});

