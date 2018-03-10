# Case Study: StratuMITM as a Statistics Server
StratuMITM can be used as a passthrough stats server for various rigs. The gist
of the idea is to let each rig connect to the server in forwarding mode, and 
simply capture the `mining.submit` events. This is useful for potential farms 
that have many rigs running different miners or running miners without stats 
reporting.

## Using the `forward.stats` Rewriter
(TBD)

## Setting up a Remote Logger
(TBD)