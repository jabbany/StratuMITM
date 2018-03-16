# Case Study: Redirect Miner Tax

Certain miners impose mining Taxes or DevFees to recoup developer effort hours.
Usually, this means a percentage (1-2% usually) of your mining goes to a 
different pool designated by the mining software author. 

Depending on how it is implemented, this usually does not equate to that % of 
your hashing rate. Instead, it commonly indicates % of donated accepted shares
(i.e. 1 out of 100 shares will be for the dev). This means the % of hashrate 
used can easily exceed the fee rate.

While we remain neutral on DevFees, users may wish to support the author of such
tools through other means such as a one-time donation. By redirecting fees, 
users can use their own preferred method to support the developers.

## Identifying
One common way DevFees are implemented is that the mining software connects to
both the primary pool and devpool simultaneously and switches between pools 
randomly.

You can identify this behavior by looking at TCP connections. This can be done 
on linux through `netstat -anp --tcp`. Below is an example of a hypothetical 
miner SMITMiner:

````
[user@rig]$ netstat -anp --tcp | grep "\\./smitminer"
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
tcp        0      0 LOCAL_IP:43000         DEVPOOL_IP:6666          ESTABLISHED PID/./smitminer        
tcp        0      0 LOCAL_IP:43001         PRIMARYPOOL_IP:6666      ESTABLISHED PID/./smitminer     
````

Here the mining software connected to two Stratum servers: 
`DEVPOOL` and `PRIMARYPOOL` at port `6666`. To redirect fees, we would need to 
capture connections to `DEVPOOL`.

## Redirecting Traffic
To MITM the `DEVPOOL` Stratum connection, we need to do some background research.
First, we want to make sure that `DEVPOOL` is running on a normal TCP connection
and does not negotiate TLS with the miner (see TLS section if it does). We also
want to know if the miner remembers the pool based on IP or DNS hostname. 

This can be done by capturing live traffic through Wireshark etc. and grabbing
connections to and from `DEVPOOL_IP`. In our case, `smitminer` randomly selects
a `DEVPOOL` based on an internal list and connects to it through DNS requests.

### DNS Redirection via Hosts File
It's super easy to redirect DNS-based hosts. We can modify `/etc/hosts` to stop 
resolving the `DEVPOOL` and instead resolve it to a server of our choice, like
`localhost`.

After some testing, we found the pools that `smitminer` uses and add them to 
our hosts file:

````
127.0.0.1   coin.devpool.org coin-us.devpool.org coin-asia.devpool.org
````

(Note: If you're lazy and suspect that the miner is using DNS redirection, it
also works to just redirect ALL known pools. In this case, consider popular 
pools like `coinmine`, `flypool` and `nanopool`.)

#### ... But I Also Mine on that Pool!
In that case your StratuMITM would capture your own mining connection and 
rewrite that too. This is no big issue: It's ok for StratuMITM to capture your 
primary pool connection. After all, you're redirecting to yourself anyways.

Do keep in mind that if this is the case, your config MUST use an IP address for
the remote host (to not use hosts) as otherwise you would be connecting to 
yourself infinitely and everything will crash and burn.

### iptables Redirection
(TBD)

### NAT Capture/Local DNS Server
If you control the local NAT or DNS server, you can also set up redirection on 
those servers to a StratuMITM server on your network. This is a little bit
more involved and depends on your network configuration.

For example, if you own a router that allows a local DNS lookup table, you can
add static records of each pool to the table with the address of a local 
StratuMTIM instance.

Let's say you run StratuMITM on `192.168.0.100`, then you would add records:

````
coin.devpool.org        192.168.0.100
coin-us.devpool.org     192.168.0.100
coin-asia.devpool.org   192.168.0.100
````

to your router's local DNS table. This will cause the router to resolve to your
StratuMITM machine. This is useful if you're on a site with many rigs, since 
all the rigs will benefit from the redirection.

NAT setups can also capture traffic that doesn't go through DNS but setup will
vary based on your NAT. The gist is to set up traffic forwarding from the 
`DEVPOOL_IP` to your StratuMITM server's IP. 

## Setup StratuMITM
Next, you want to configure StratuMITM to capture the connection and rewrite 
the messages. Use the following template to get StratuMITM into credential 
rewrite mode:

````JSON
{
  "ports": [8008, 3333, 1333, 6666],
  "rewriter": "./lib/rewrite/rewrite.credentials.js",
  "params": {
    "log": ["events:connection"],
    "remote": {
      "host": "zec-us-west1.nanopool.org",
      "port": 6666,
      "retry": 0
    },
    "credentials": {
      "user": "t1eba1MCGKcViRTztUGqVUiuN2utQ71Sy1V.donation",
      "pass": "x"
    }
  }
}
````

(See [rewrite_credentials.sample.json](../config/rewrite_credentials.sample.json) 
for most recent version)

Note that we are binding to ports `8008, 3333, 1333, 6666`. This list needs to 
contain ALL ports on all the potential `DEVPOOL` pools to properly capture the 
connection. These are a few common ones, but please do check the ones for your
intended pool.

You should change the `remote.host` and `remote.port` parameters to match the 
pool you want to redirect to and configure `credentials` to be the `credentials`
of your account. (Of course, if you keep these default settings, you will be 
donating to this project so feel free to do that too, wink wink)

We will refer to `remote.host`, `remote.port` as `CAPTUREPOOL` and 
`credentials.user` as `CAPTUREUSER`.

## Start StratuMITM
Start StratuMITM like so

    node server.js
    
You should see the following output:

````
[*rt=8008] Listening on 8008
[*rt=3333] Listening on 3333
[*rt=1333] Listening on 1333
[*rt=6666] Listening on 6666
````

This means that we are successfully waiting at these ports for the connection.

## Start the Miner
Start your miner:

    ./smitminer --pool primarypool.org --port 6666 --user blah --pass x

After a while, you should see the following on your StratuMITM server output:

````
[rw=cred.*b5e7a75.rewrite] Rewrite subscribe client AgentID:SMIT 1.0.0
[rw=cred.*b5e7a75.rewrite] Rewrite subscribe server from DEVPOOL:6666 to CAPTUREPOOL
[rw=cred.*b5e7a75.rewrite] Replace credentials U:DEVUSER P:DEVPASS with config ones.
````

This means that we have successfully intercepted the `mining.subscribe` and 
`mining.authorize` messages. If you don't see this, you may have missed a 
`DEVPOOL` or your redirection may not be working. Go back to the Identifying 
step to look at what `SMITMiner` is connecting to.

Note: The default behavior of StratuMITM is to change the AgentID from 
`SMIT 1.0.0` (in this example) to `StratuMITM/Rewrite 0.1` to hide which miner 
you're using. If you don't want to do this or want to change it to another 
agent id, you would need to edit the rewriter file. Don't worry though, because
we release the source!

At this point the miner will believe that it is connected to the `DEVPOOL` but 
in reality, it is taking commands from the `CAPTUREPOOL`.

## Captured Submissions
After a while, you may begin to see these messages pop up:

````
[rw=cred.*b5e7a75.rewrite] Replace share owner U:DEVUSER with U:CAPTUREUSER
[rw=cred.*b5e7a75.shares] SUBMIT M#100
[rw=cred.*b5e7a75.shares] ACCEPTED M#100
````

Each of these represents an accepted share from the captured connection. If your
miner shows DevFees, this might show up as:

````
INFO XX:XX:XX: DevFee Accepted share
````

If it doesn't... well now you know when it's sending shares (and how many).

## Logging and Other stuff
You may have noticed that this gives rise to some interesting features like a 
unified way to log rigs' share submissions/hashrates and redirect the logger
to a logging server (instead of stdout). 

Please read those case descriptions to learn how to do that 
[here](UnifiedStatsServer.md).

## TLS
If the miner uses TLS, then setup is a little more complicated. You want to put
StratuMITM behind a TLS negotiator like `stunnel`. If no certificate pinning is 
used, the miner will happily negotiate the tunnel and everything is the same
as the unencrypted case.

Things are a bit more complicated if the miner uses certificate pinning on the
`DEVPOOL`. However, one can usually block the pool altogether and force the 
miner to downgrade to an alternate pool without TLS protection.
