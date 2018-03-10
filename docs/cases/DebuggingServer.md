# Case Study: StratuMITM as a Protocol Debugger
This is really easy, just use the following config to set StratuMITM into 
forward mode.

## Forward to Single Remote
This is actually exactly the configuration in `config.sample.json`.
````
{
  "ports": [8008, 3333, 1333, 6666],
  "rewriter": "./lib/rewrite/forward.js",
  "params": {
    "log": "all",
    "remote": {
      "host": "192.99.37.89",
      "port": 8008,
      "retry": 0
    }
  }
}
````

It mimics `192.99.37.89` for all clients. You can change this to another server
of your choice.

When `params.log` is `all`, every message sent in the TCP connection is logged
so you can see what is actually being sent. This is very helpful in creating 
your own rewriters.

## Dynamic Forward
Dynamic forward is a weird mode that uses the `mining.subscribe` paramters to
figure out what the client is trying to connect to. Not all miners send the 
same information so this is not reliable. 

````
{
  "ports": [8008, 3333, 1333, 6666],
  "rewriter": "./lib/rewrite/forward.dynamic.js",
  "params": {
    "log": "all"
  }
}
````

If connecting to the server failed, StratuMITM will behave like a blackhole.