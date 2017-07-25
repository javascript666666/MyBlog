//提交评论
$('#messageBtn').on('click', function() {
    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contentid: $('#contentId').val(),
            content: $('#messageContent').val()
        },
        success: function(responseData){
            $('#messageContent').val('');
            console.log(responseData.data.comments);
            renderComment(responseData.data.comments.reverse());
        }
    })
});

function renderComment(comments){
    var html = '';
    for (var i=0; i<comments.length; i++){
        html += '<div class="messageList" style="display: block;"> <div class="messageBox"> <p class="name clear"><span class="fl">' + comments[i].username + '</span><span class="fr">'+comments[i].postTime+'</span></p><p>'+comments[i].content+'</p> </div></div>'
    }
    $('.messageList').html(html);
}
