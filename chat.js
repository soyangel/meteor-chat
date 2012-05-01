Messages = new Meteor.Collection("messages");


if (Meteor.is_client) {

    Template.entry.events = {
        'keyup #entry': function(event) {
            if (event.keyCode == 13)
            {
                Meteor.call('addMessage', $('#nick').val(), $('#entry').val(), function (error, result) {
                    if (error)
                        alert(error);
                });
                $('#entry').val('');
            }
        }
    };

    Template.messages.messages = function() {
        return Messages.find();
    };

    Template.message.formatted_time= function() {
        var date = new Date(this.time);
        return date.toLocaleTimeString();
    };


    function finishMessageEdit(messageId, messageDiv)
    {
        var messageText = messageDiv.find('.text');

        Meteor.call('changeMessage', messageId, messageText.val(), function (error, result) {

            if (error)
            {
                alert(error);
            }
            else
            {
                messageText.replaceWith(function (){
                    return '<span class="text">' + $(this).val() + '</span>';
                });
                messageDiv.find('.edit').val('EDIT');
            }

        });
    }

    function startMessageEdit(messageId, messageDiv)
    {
        var messageText = messageDiv.find('.text');

        var messageInput = $('<input type="text" class="text" value="' + messageText.html() + '">');

        messageInput.keyup(function(event) {
            if (event.keyCode == 13)
            finishMessageEdit(messageId, messageDiv);
        });

        messageText.replaceWith(function (){
            return messageInput;
        });

        messageInput.focus();

        messageDiv.find('.edit').val('DONE');

    }


    Template.message.events = {
        'click .edit': function (event) {
            var messageDiv = $(event.target).parent();
            var messageText = messageDiv.find('.text');

            if (messageText.get(0).tagName == 'INPUT')
            {
                finishMessageEdit(this._id, messageDiv);
            }
            else
            {
                startMessageEdit(this._id, messageDiv);
            }

        }
    };

}

if (Meteor.is_server) {

    function disableClientMongo() {
        _.each(['messages'], function(collection) {
            _.each(['insert', 'update', 'remove'], function(method) {
                Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
            });
        });
    };

    Meteor.startup(function () {
        disableClientMongo();
    });

    Meteor.methods({
        addMessage: function(nick, message) {
            Messages.insert({nick:nick, message:message, time:Date.now()});
        },

        changeMessage: function(messageId, messageText) {
            Messages.update({_id:messageId}, {'$set':{message : messageText}});
        }
    });
}
