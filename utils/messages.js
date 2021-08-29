const moment = require('moment');

function formatMessage(username, messageText){
    return {
        username,
        messageText,
        time: moment().format("h:mm a")
    }
}

module.exports = formatMessage;