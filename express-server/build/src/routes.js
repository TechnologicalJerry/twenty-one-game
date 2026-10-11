"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var product_controller_1 = require("./controller/product.controller");
var session_controller_1 = require("./controller/session.controller");
var user_controller_1 = require("./controller/user.controller");
var requireUser_1 = __importDefault(require("./middleware/requireUser"));
var validateResource_1 = __importDefault(require("./middleware/validateResource"));
var rateLimiter_1 = require("./middleware/rateLimiter");
var product_schema_1 = require("./schema/product.schema");
var session_schema_1 = require("./schema/session.schema");
var user_schema_1 = require("./schema/user.schema");
function routes(app) {
    /**
     * @openapi
     * /healthcheck:
     *  get:
     *     tags:
     *     - Healthcheck
     *     description: Responds if the app is up and running
     *     responses:
     *       200:
     *         description: App is up and running
     */
    app.get("/healthcheck", function (req, res) { return res.sendStatus(200); });
    /**
     * @openapi
     * '/api/users':
     *  post:
     *     tags:
     *     - User
     *     summary: Register a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *              $ref: '#/components/schemas/CreateUserInput'
     *     responses:
     *      200:
     *        description: Success
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/CreateUserResponse'
     *      409:
     *        description: Conflict
     *      400:
     *        description: Bad request
     */
    app.post("/api/users", [rateLimiter_1.authLimiter, (0, validateResource_1.default)(user_schema_1.createUserSchema)], user_controller_1.createUserHandler);
    /**
     * @openapi
     * '/api/sessions':
     *  get:
     *    tags:
     *    - Session
     *    summary: Get all sessions
     *    responses:
     *      200:
     *        description: Get all sessions for current user
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/GetSessionResponse'
     *      403:
     *        description: Forbidden
     *  post:
     *    tags:
     *    - Session
     *    summary: Create a session
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/CreateSessionInput'
     *    responses:
     *      200:
     *        description: Session created
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/CreateSessionResponse'
     *      401:
     *        description: Unauthorized
     *  delete:
     *    tags:
     *    - Session
     *    summary: Delete a session
     *    responses:
     *      200:
     *        description: Session deleted
     *      403:
     *        description: Forbidden
     */
    app.post("/api/sessions", [rateLimiter_1.authLimiter, (0, validateResource_1.default)(session_schema_1.createSessionSchema)], session_controller_1.createUserSessionHandler);
    app.get("/api/sessions", requireUser_1.default, session_controller_1.getUserSessionsHandler);
    app.delete("/api/sessions", requireUser_1.default, session_controller_1.deleteSessionHandler);
    /**
     * @openapi
     * '/api/products':
     *  post:
     *     tags:
     *     - Products
     *     summary: Create a new product
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schema/Product'
     *     responses:
     *       200:
     *         description: Product created
     *         content:
     *          application/json:
     *           schema:
     *              $ref: '#/components/schema/productResponse'
     *           example:
     *             "user": "642a0de05f16e6dad68efdad"
     *             "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens"
     *             "description": "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go."
     *             "price": 879.99
     *             "image": "https://i.imgur.com/QlRphfQ.jpg"
     *             "_id": "642a1cfcc1bec76d8a2e7ac2"
     *             "productId": "product_xxqm8z3eho"
     *             "createdAt": "2023-04-03T00:25:32.189Z"
     *             "updatedAt": "2023-04-03T00:25:32.189Z"
     *             "__v": 0
     */
    app.post("/api/products", [requireUser_1.default, (0, validateResource_1.default)(product_schema_1.createProductSchema)], product_controller_1.createProductHandler);
    /**
     * @openapi
     * '/api/products/{productId}':
     *  get:
     *     tags:
     *     - Products
     *     summary: Get a single product by the productId
     *     parameters:
     *      - name: productId
     *        in: path
     *        description: The id of the product
     *        required: true
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *          application/json:
     *           schema:
     *              $ref: '#/components/schema/productResponse'
     *       404:
     *         description: Product not found
     *  put:
     *     tags:
     *     - Products
     *     summary: Update a single product
     *     parameters:
     *      - name: productId
     *        in: path
     *        description: The id of the product
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schema/Product'
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *          application/json:
     *           schema:
     *              $ref: '#/components/schema/productResponse'
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Product not found
     *  delete:
     *     tags:
     *     - Products
     *     summary: Delete a single product
     *     parameters:
     *      - name: productId
     *        in: path
     *        description: The id of the product
     *        required: true
     *     responses:
     *       200:
     *         description: Product deleted
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Product not found
     */
    app.put("/api/products/:productId", [requireUser_1.default, (0, validateResource_1.default)(product_schema_1.updateProductSchema)], product_controller_1.updateProductHandler);
    app.get("/api/products/:productId", (0, validateResource_1.default)(product_schema_1.getProductSchema), product_controller_1.getProductHandler);
    app.delete("/api/products/:productId", [requireUser_1.default, (0, validateResource_1.default)(product_schema_1.deleteProductSchema)], product_controller_1.deleteProductHandler);
}
exports.default = routes;
