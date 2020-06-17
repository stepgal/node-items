
const ES = require("elasticsearch");
const logger = require("./logger");
const { $set } = require("./variables");

const defaultConfigs = {
    requestTimeout: 4000
};

const elasticItemsClient = new ES.Client({
    hosts: "http://18.222.24.29:9200",
    ...defaultConfigs
});

const statuses = {};
const isConnectionsEstablished = () =>
    statuses.ITEMS;

/*
* App Connection
* */
const connect = (connection) => {
    /* check ES Connection */
    connection.ping({ requestTimeout: 10000 }, err => {
        if (err) {
            setTimeout(() => connect(connection), 5000);
            return logger.log("error", err);
        }
        // eslint-disable-next-line security/detect-object-injection
        statuses["ITEMS"] = true;
        $set("ElasticConnectionsStatus", isConnectionsEstablished() ? "connected" : "connecting");
        logger.log("info", "Connected to Elasticsearch \t- Host: " + process.env.ELASTIC_ITEMS_HOST);
    });
};

connect(elasticItemsClient);

module.exports = {
    elasticItemsConnection: {
        client: elasticItemsClient,
        index: process.env.ELASTIC_ITEMS_INDEX
    }
};
