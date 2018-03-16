# Case Study: StratuMITM as a full Stratum Dev Server
StratuMITM has a really flexible rewrite function to the extent that a full
Stratum service can be implemented in a rewriter. This is not intended to be
production ready (since it's not designed to be efficient or safe), but you
can test out local configurations and play around with fancy Stratum service
designs!

Now, most of what a Stratum server does is coordinate workers. This is
different for each kind of cryptocurrency and thus our dev server doesn't
implement any particular algorithm. You should configure it to send the correct
paramters for your hash algorithm.

## Using the `server.dev.js` Rewriter
(TBD)