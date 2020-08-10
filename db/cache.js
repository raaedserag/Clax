// Modules & Configurations
const { redisAzureKey,
    redisAzurelHost,
    redisLocalPort,
    redisSslPort,
    redisLocalHost } = require("../startup/config").cacheConfig()
const redis = require("redis");
const { promisify } = require("util")
let cache;

// Initialize Cache
module.exports.configureCache = () => {
    // Configure local or azure host according to mode
    if (process.env.NODE_ENV == "production")
        cache = redis.createClient(redisSslPort, redisAzurelHost,
            { auth_pass: redisAzureKey, tls: { servername: redisAzurelHost } });
    else
        cache = redis.createClient(redisLocalPort, redisLocalHost);

    // Error function
    cache.on("error", (err) => {
        throw new Error("Cache Error");
    })

    // Exporting asynchronous fns
    module.exports.GET = promisify(cache.get).bind(cache)
    module.exports.SET = promisify(cache.set).bind(cache)
}
