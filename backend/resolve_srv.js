import dns from 'dns/promises';

async function resolveAtlas() {
    try {
        const srvRecord = '_mongodb._tcp.multivendor.tk3zgp9.mongodb.net';
        const addresses = await dns.resolveSrv(srvRecord);
        console.log(JSON.stringify(addresses, null, 2));
    } catch (err) {
        console.error('Error resolving SRV record:', err.message);
        process.exit(1);
    }
}

resolveAtlas();
