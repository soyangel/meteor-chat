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

    Template.message.events = {
        'click .edit': function (event) {
            var messageDiv = $(event.target).parent();
            var message = messageDiv.find('.message');

            if (message.get(0).tagName == 'INPUT')
            {
                Meteor.call('changeMessage', this._id, message.val(), function (error, result) {

                    if (error)
                    {
                        alert(error);
                    }
                    else
                    {
                        message.replaceWith(function (){
                            return '<span class="message">' + $(this).html() + '</span>';
                        });
                        messageDiv.find('.edit').html('EDIT');
                    }

                });
            }
            else
            {
                message.replaceWith(function (){
                    return '<input type="text" class="message" value="' + $(this).html() + '">';
                });
                messageDiv.find('.edit').html('DONE');
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
