const {onChat}  = require('./src/tmiClient');
const {getModResponse} = require('./src/messages/modMessages');
const {getUnpermissionedResponse} = require('./src/messages/unpermissionedMessages');

onChat((_channel, user, message, self) => {
  try {
    if (self) return;

    say(getModResponse(message, user));

    say(getUnpermissionedResponse(message));
  } catch (e) {
    console.error("Something went wrong trying to parse the message");
    console.log(e.message);
  }
});
