import Libp2p from "libp2p";
// import TCP from "libp2p-tcp";
import WebSockets from "libp2p-websockets";
import { NOISE } from "libp2p-noise";
import MPLEX from "libp2p-mplex";
// import { multiaddr } from "multiaddr";
import Bootstrap from "libp2p-bootstrap";

const bootstrapMultiaddrs = [
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
];

(async () => {
  try {
    const node = await Libp2p.create({
      addresses: {
        listen: ["/ip4/0.0.0.0/tcp/0"],
      },
      modules: {
        transport: [WebSockets],
        connEncryption: [NOISE],
        streamMuxer: [MPLEX],
        peerDiscovery: [Bootstrap],
      },
      config: {
        peerDiscovery: {
          autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minConnections)
          // The `tag` property will be searched when creating the instance of your Peer Discovery service.
          // The associated object, will be passed to the service when it is instantiated.
          [Bootstrap.tag]: {
            enabled: true,
            list: bootstrapMultiaddrs, // provide array of multiaddrs
          },
        },
      },
    });

    await node.start();

    node.on("peer:discovery", (peer) => {
      console.log("Discovered %s", peer.id.toB58String()); // Log discovered peer
    });

    node.connectionManager.on("peer:connect", (connection) => {
      console.log("Connected to %s", connection.remotePeer.toB58String()); // Log connected peer
    });

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
