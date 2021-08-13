import Libp2p from "libp2p";
import TCP from "libp2p-tcp";
import { NOISE } from "libp2p-noise";
import MPLEX from "libp2p-mplex";

import { multiaddr } from "multiaddr";

(async () => {
  try {
    const node = await Libp2p.create({
      addresses: {
        listen: ["/ip4/0.0.0.0/tcp/0"],
      },
      modules: {
        transport: [TCP],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
      },
    });

    await node.start();

    console.log("listening on addresses:");
    console.log({ mutiaddrs: node.multiaddrs });

    node.multiaddrs.forEach((addr) => {
      console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`);
    });

    if (process.argv.length >= 3) {
      const ma = multiaddr(process.argv[2]);
      console.log(`pinging remote peer at ${process.argv[2]}`);
      const latency = await node.ping(ma);
      console.log(`pinged ${process.argv[2]} in ${latency}ms`);
    } else {
      console.log("no remote peer address given, skipping ping");
    }

    const stop = async () => {
      // stop libp2p
      await node.stop();
      console.log("libp2p has stopped");
      process.exit(0);
    };

    process.on("SIGTERM", stop);
    process.on("SIGINT", stop);
  } catch (error) {
    console.log(error);
  }
})();
