# StratuMITM
A local MITM "bypass proxy" for the Stratum mining protocol. Redirect TCP pipes to the proxy and end mandatory taxes.

## How does it work?
StratuMITM is a run as a local Stratum bypass proxy. The idea is that instead of contacting a remote Stratum server,
your instance's TCP stream can be coerced to contact the local Stratum proxy. StratuMITM then allows you to modify and
redirect traffic to a different pool.

## Why would I want it?
If you don't have access to the local server's miner configuration (which Stratum pool it connects to and what user
account/pass the shares get sent to) but you do have access to the local server's OS configuration, you may want to use
StratuMITM to edit the mining settings "over the air".

StratuMITM lets you redirect downstream messages from a different server and can "unpack" results messages and "repack"
them with different mining credentials. This can coerce a miner to mine for a different pool using a different account
and is very useful if you get "taxed" by your mining software - instead of submitting the mining tax, you keep it for
yourself.

While StratuMITM could be used nefariously (i.e. coercing a server behind a NAT you operate to produce results for you)
we don't recommend using it for that.

## What about TLS?
In many cases when you have local control over the configuration, you can just redirect the TCP connection to negotiate
a TLS connection against the local server. If the miner does not perform certificate pinning, it won't know that
StratuMITM is present despite the TLS connection negotiating normally.

If your local miner uses certificate pinning, maybe consider using a tool that does not put that much effort into trying
to tax you.

## Licensing
StratuMITM code is released to the public domain meaning there are no restrictions on its use. In cases where that is
not possible, this code is licensed under the Unlicense. See [License](LICENSE.md) for details.
