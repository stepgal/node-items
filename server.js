const { elasticItemsConnection } = require("./elastic");
const logger = require("./logger");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
require("dns");
require("dnscache")({ "enable": true, "ttl": 300, "cachesize": 1000 });
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const { itemDelete, getItemsAll, getItemsByUserId, setItemByUserId } = require("./mongoServer");

const app = express();

if (process.env.NODE_ENV === "DEVELOPMENT") {
    app.use(morgan("dev"));
}

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec, false, { docExpansion: "none" }));

async function addElasticSearchItem (id, title, description) {
    const elasticConnection = elasticItemsConnection;
    const isExists = await elasticConnection.client.indices.exists({ index: process.env.ELASTIC_ITEMS_INDEX });
    if (!isExists) {
        await elasticConnection.client.indices.create({
            index: process.env.ELASTIC_ITEMS_INDEX
        }, function (err, resp, status) {
            if (err) {
                logger.log("error", err);
            } else {
                logger.log("info", resp);
            }
        });
    }
    await elasticConnection.client.index({
        index: process.env.ELASTIC_ITEMS_INDEX,
        type: process.env.ELASTIC_ITEMS_TYPE,
        body: {
            "id": id,
            "title": title,
            "description": description
        }
    }, function (err, resp, status) {
        logger.log("error", err);
    });
}
async function deleteElasticSearchItem (id) {
    const elasticConnection = elasticItemsConnection;
    await elasticConnection.client.deleteByQuery({
        index: process.env.ELASTIC_ITEMS_INDEX,
        type: process.env.ELASTIC_ITEMS_TYPE,
        body: {
            query: {
                match: { id: id }
            }
        }
    }, function (error, response) {
        logger.log("error", error);
    });
}

/**
 * @swagger
 * /items/insert/{userId}/{title}/{description}/{cost}:
 *   get:
 *     tags:
 *       - Add/Delete Item
 *     summary: Add New Item
 *     description: 'Adding new item to database'
 *     operationId: getSystemData
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful operation
 *         schema:
 *            $ref: '#/definitions/response'
 *
 *       '400':
 *         description: Missed Parameter(s)
 *         schema:
 *            $ref: '#/definitions/responseError'
 *
 *       '404':
 *         description: Wrong URL
 *         schema:
 *            $ref: '#/definitions/responseError'
 */
app.get("/items/insert/:userId/:title/:description/:cost", async (req, res) => {
    const { userId, title, description, cost } = req.params;
    if (!userId || title || !description || !cost)
        return res.status(400).json(
        {
            "status": "FAILED",
            "message": "Missed Parameter(s)"
        }).send();
    const item = await setItemByUserId(userId, title, description, cost);
    await addElasticSearchItem(item._id, title, description);
    return res.status(200).json(
        {
            "status": "OK",
            item: item || []
        });
});

/**
 * @swagger
 * /items/delete/{itemId}:
 *   get:
 *     tags:
 *       - Add/Delete Item
 *     summary: Delete Item
 *     description: 'Delete item from database'
 *     operationId: getSystemData
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful operation
 *
 *       '400':
 *         description: Missed Parameter(s)
 *         schema:
 *            $ref: '#/definitions/responseError'
 *
 *       '404':
 *         description: Wrong URL
 *         schema:
 *            $ref: '#/definitions/responseError'
 */
app.get("/items/delete/:itemId", async (req, res) => {
    const { itemId } = req.params;
    if (!itemId)
        return res.status(400).json(
            {
                "status": "FAILED",
                "message": "Missed Parameter"
            }).send();
    await itemDelete(itemId);
    await deleteElasticSearchItem(itemId);
    return res.json(
        {
            "status": "OK",
            "message": "Item deleted"
        });
});

/**
 * @swagger
 * /items/all:
 *   get:
 *     tags:
 *       - Get Items
 *     summary: Get All Items
 *     description: 'Return all items from database'
 *     operationId: getSystemData
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful operation
 *         schema:
 *            $ref: '#/definitions/response'
 *
 *       '404':
 *         description: Wrong URL
 *         schema:
 *            $ref: '#/definitions/responseError'
 */
app.get("/items/all", async (req, res) => {
    const items = await getItemsAll();
    return res.json(
        {
            "status": "OK",
            items: items || []
        });
});

/**
 * @swagger
 * /items/{userId}:
 *   get:
 *     tags:
 *       - Get Items
 *     summary: Get Items by userId
 *     description: 'Get Items by userId from database'
 *     operationId: getSystemData
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful operation
 *         schema:
 *            $ref: '#/definitions/response'
 *
 *       '400':
 *         description: Missed Parameter(s)
 *         schema:
 *            $ref: '#/definitions/responseError'
 *
 *       '404':
 *         description: Wrong URL
 *         schema:
 *            $ref: '#/definitions/responseError'
 */
app.get("/items/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId)
        return res.status(400).json(
        {
            "status": "FAILED",
            "message": "Missed Parameter"
        }).send();

    const items = await getItemsByUserId(userId);
    return res.json(
        {
            "status": "OK",
            items: items || []
        });
});

app.use("/", async (req, res) => {
    res.status(404).send({
        "message": "Bad request"
    });
});

app.listen(process.env.SERVER_PORT || 3002);
