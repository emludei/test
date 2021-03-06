$(document).ready(function() {
     $('.comment_send_form').submit(function(event) {
        var form_data = $(this).serializeArray();
        var url_for_query = $(this).attr('action');
        
        var on_success = function(data, status) {
            if (data.success) {
                postComment(data);
            }
        }

        form_data.push({name: 'object_id', value: $(this).attr('id')});
        ajaxQueryComment(form_data, url_for_query, on_success);
        resetForm($(this));

        return false;
     });
    
    $('#comments').on('click', '.comment_reply', function(event) {
        var form = $('.comment_send_form');
        var comment = $(this).closest('.comment_li');
        
        addParentIfNotExist(form, comment.attr('id'));
        form.appendTo(comment.find('> .comment_data .reply_form_position'));
        event.preventDefault();
    });

    $('#comments').on('click', '.remove_comment', function(event) {
        var comment = $(this).closest('.comment_li');
        var data ={
            comment_id: parseInt(comment.attr('id')),
            csrfmiddlewaretoken: $.cookie('csrftoken')
        };

        var query_url = $(this).attr('action');

        var on_success = function(data, status) {
            if (data.success) {
                var comment = $('#comments').find('#' + data.comment_id);
                comment.find('> .comment_data').replaceWith(data.comment);
            }
        };

        ajaxQueryComment(data, query_url, on_success);

        event.preventDefault();
    });

    $('#comments').on('click', '.remove_comment_tree', function(event) {
        var comment = $(this).closest('.comment_li');
        var data = {
            parent_id: comment.attr('id'),
            csrfmiddlewaretoken: $.cookie('csrftoken')
        };

        var query_url = $(this).attr('action');

        var on_success = function(data, status) {
            if (data.success) {
                var parent = $('#comments').find('#' + data.parent_id);
                var replace_data = $(data.replace_data).children().unwrap();
                var temp = parent.next();

                while (temp.length) {
                    var id = parseInt(temp.attr('id'))

                    if (data.list_id.indexOf(id) > 0) {
                        temp.remove();
                        temp = parent.next();
                    }
                    else {
                        temp = temp.next()
                    }
                }
                parent.replaceWith(replace_data);
            }
        };

        ajaxQueryComment(data, query_url, on_success);
        event.preventDefault();
    });

    function ajaxQueryComment(data, query_url, on_success) {
        $.ajax({
            url: query_url,
            type: 'POST',
            dataType: 'json',
            data: $.param(data),
            success: on_success
        });
    }

    function postComment(data) {
        var comment_section = $('#comments');
        var comments_count = $('.comments_count');

        if (data.parent) {
            var parent_comment = comment_section.find('#' + data.parent);
            var ul_for_append = getUlForAppendComment(parent_comment);

            ul_for_append.append(data.comment)
        }
        else {
            comment_section.append('<ul>' + data.comment +'</ul>');
        }

        comments_count.text(parseInt(comments_count.text()) + 1);
    }

    function getUlForAppendComment(comment) {
        var ul_condidate = comment.find('> ul');
        
        if (ul_condidate.length) {
            return ul_condidate;
        }
        else {
            var max_depth = parseInt($('#comments').attr('max-depth'));
            var current_depth = parseInt(comment.attr('depth'));

            if (max_depth > current_depth) {

                var ul = document.createElement('ul');
                comment.append(ul);

                return comment.find('> ul');
            }
            else {
                return comment.closest('ul');
            }
        }
    }

    function addParentIfNotExist(form, id) {
        var parent_input = form.find('input[name=parent]');
        
        if (parent_input.length) {
            parent_input.val(id);
        }
        else {
            var parent = document.createElement('input');            
            parent.type = 'hidden';
            parent.name = 'parent';
            parent.value = id;

            form.append(parent);
        }
    }

    function resetForm(form) {
        $(form[0].elements['parent']).val('');
        $(form[0].elements['comment']).val('');
        form.appendTo($('#comment_form_original_position'));
    }

});
