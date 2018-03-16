# Case Study: StratuMITM as a Statistics Server
StratuMITM can be used as a passthrough stats server for various rigs. The gist
of the idea is to let each rig connect to the server in forwarding mode, and 
simply capture the `mining.submit` events. This is useful for potential farms 
that have many rigs running different miners or running miners without stats 
reporting.

## Using the `forward` Rewriter
To configure the `forward` rewriter, to enable statistics, use the following 
configuration for the rewriter params:

````JSON
{
  "params": {
    "log": "all",
    "remote": {
      "host": "192.99.37.89",
      "port": 8008,
      "retry": 0
    },
    "stats": {
      "enable": true,
      "captureShares": true
    }
  }
}
````

## Setting up a Remote Logger
(TBD)