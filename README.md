# StratuMITM
A forwarding proxy designed to MITM the Stratum Mining Protocol. This project
is designed to help debug Stratum implementations and view the messages being 
sent.

## How does it work?
StratuMITM is a run as a local Stratum bypass proxy. The idea is that instead 
of contacting a remote Stratum server, you can have (or force) your miner 
instance's to contact the local Stratum proxy instead. StratuMITM then allows 
you to modify (rewrite) and redirect traffic.

## Why would I want it?
StratuMITM lets you redirect local Stratum messages to a remote server and 
allows you to "unpack" messages and "repack" them with different information
such as mining credentials. This can coerce a program relying on instructions
passed to it through Stratum to do other things (i.e. encourage a miner to mine
for a different pool and/or a different account than it is configured to).

If you don't have access to the local server's miner configuration (i.e. which 
Stratum pool it connects to and configured user credentials) but you do have 
access to the local OS configuration or manage the local network, you may want
to use StratuMITM to edit the mining settings "over the air". It's useful if 
you get "taxed" by your mining software - instead of submitting the mining tax 
/ devfee, you get to use it at your own discretion.

While StratuMITM could be used nefariously (i.e. coercing a server behind a NAT
you operate to produce results for you - aka stealing shares) we certainly don't
recommend using it for that purpose. **Never MITM connections from hosts you do 
not own.**

For details on some specific use case samples, read the items in 
[docs/cases/](docs/cases/).

### What about TLS?
Some details are in the docs, but the tl;dr is: If the client/miner does not do
certificate pinning (it's not caught on much yet), then you can just as easily 
MITM the TLS connection. If it does, then this project will not help you.

## Licensing
StratuMITM code is released to the public domain meaning there are no 
restrictions on its use. In cases where that is not possible, this code is 
licensed under the Unlicense. See [License](LICENSE.md) for details.

Note: Certain configurations of StratuMITM could be used for nefarious purposes.
The authors offer no warranty and are not liable for any damages (see license
for details).

## Donate 
You can donate to the project at the following addresses:

- ZEC: t1eba1MCGKcViRTztUGqVUiuN2utQ71Sy1V
- ETH: 0x663c603f20b883ccf86e56390fd0966f71c9fdc2
- BTC: 1A2t2vAM9VZ4VbTp2i75e6j2DwoSaruyCh

Or by mining for these addresses on any of the popular pools.

Donations are completely voluntary and will support future development and 
resolving issues. This software does not contain any DevFees and is written in 
JavaScript so you can audit that it actually does not.


