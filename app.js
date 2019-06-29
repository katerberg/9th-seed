const {onChat, say} = require('./src/tmiClient');
const {getModResponse} = require('./src/messages/modMessages');
const {getUnpermissionedResponse} = require('./src/messages/unpermissionedMessages');

onChat((_channel, user, message, self) => {
  try {
    if (self) {
      return;
    }

    say(getModResponse(message, user));
    say(getUnpermissionedResponse(message, user));
  } catch (e) {
    console.log(e);
    console.error('Something went wrong trying to parse the message'); // eslint-disable-line no-console
    console.log(e.message); // eslint-disable-line no-console
  }
});
