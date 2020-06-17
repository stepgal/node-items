const mongoose = require("mongoose");
const logger = require("./logger");

const options = {
    useNewUrlParser: process.env.MONGO_DB_MAIN_USE_NEW_URL_PARSER || true,
    autoReconnect: process.env.MONGO_DB_MAIN_AUTO_RECONNECT || false,
    bufferMaxEntries: parseInt(process.env.MONGO_DB_MAIN_BUFFER_MAX_ENTRIES || 0),
    bufferCommands: process.env.MONGO_DB_MAIN_BUFFER_COMMAND || false,
    connectTimeoutMS: parseInt(process.env.MONGO_DB_MAIN_CONNECTION_TIMEOUT_MS || 20000),
    poolSize: parseInt(process.env.MONGO_DB_MAIN_POOL_SIZE || 50),
    useUnifiedTopology: true
};
if (process.env.MONGO_DB_MAIN_REPLICA_SET) {
    options.replicaSet = process.env.MONGO_DB_MAIN_REPLICA_SET;
    options.readPreference = process.env.MONGO_DB_MAIN_READ_PREFERENCE || "secondaryPreferred";
}

mongoose.connect(
    process.env.MONGO_DB_MAIN_HOST,
    options
);

mongoose.connection.on("disconnected", (err) => {
    logger.log("error", err);
    setTimeout(() => {
        logger.log("info", "Reconnecting");
        mongoose.connect(process.env.MONGO_DB_MAIN_HOST, options);
    }, 5000);
});
mongoose.connection.on("open", () => {
    logger.log("info", "Connected to MongoDB \t- Host: " + process.env.MONGO_DB_MAIN_HOST);
});

mongoose.connection.on("error", (err) => {
    logger.log("error", err);
});

/*
* Schemas
* */

const Schema = mongoose.Schema;
const itemSchema = new Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    cost: { type: Number, required: true }
}, {
    minimize: false,
    versionKey: false
});
const ItemModel = mongoose.connection.model("Items", itemSchema, "items");

module.exports = {
    async itemDelete (itemId) {
        return ItemModel.find({ _id: itemId }).remove().exec();
    },
    async getItemsAll () {
        return ItemModel.find(
            { },
            null,
            { lean: true }
        );
    },
    async getItemsByUserId (userId) {
        return ItemModel.find(
            { userId },
            null,
            { lean: true }
        );
    },
    async setItemByUserId (
        userId,
        title,
        description,
        cost) {
        return ItemModel.create({
            userId,
            title,
            description,
            cost
        });
    }
};
