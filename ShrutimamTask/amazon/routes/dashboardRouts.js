const express = require("express");
const { route } = require("./userRouts");
const productController = require("../controllers/product");
const userController = require("../controllers/user");
const bodyParser = require('body-parser');
const querystring = require('querystring');
const { query } = require("express");

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: true });

router.use(express.json());

router.get('/', async(req, res) => {
    if (req.query.id == undefined) {
        res.redirect("/user/login");
    }
    const data = await productController.getProducts();
    const email = await userController.idToEmail(req.query.id);
    res.render("dashboard", { data: data, email: email, id: req.query.id });
});


router.get('/addProduct', async(req, res) => {
    if (req.query.message) {
        res.render("addProduct", { message: req.query.message, id: req.query.id });
    } else {
        res.render("addProduct", { message: null, id: req.query.id });
    }
});

router.post('/addProduct', urlencodedParser, async(req, res) => {
    const result = await productController.addProduct(req.body);
    if (result === "error") {
        const query = querystring.stringify({
            email: req.body.userEmail,
            message: "error occured pls try again..."
        });
        res.redirect("/dashboard/addProduct?" + query);
    } else {
        const query = querystring.stringify({
            id: req.body.id
        });
        res.redirect("/dashboard?" + query);
    }
});

router.get('/editProduct', async(req, res) => {
    const userProducts = await productController.getUserProducts(req.query.id);
    if (userProducts.length == 0) {
        const query = querystring.stringify({
            id: req.query.id,
            message: "You didn't added any product pls add product..."
        });
        res.redirect("/dashboard/addProduct?" + query);
    } else {
        const email = await userController.idToEmail(req.query.id);
        res.render("editProduct", { data: userProducts, id: req.query.id, email: email });
    }
});
router.post("/editProduct", urlencodedParser, (req, res) => {
    res.render("editProductForm", { values: req.body });
});

router.post("/editProduct/form", urlencodedParser, async(req, res) => {
    const result = await productController.editProduct(req.body);
    if (result != "error") {
        const query = querystring.stringify({
            id: req.body.id
        });
        res.redirect("/dashboard?" + query);
    }
});

router.post("/deletetProduct", urlencodedParser, async(req, res) => {
    const result = await productController.deleteProduct(req.body);
    if (result != "error") {
        const query = querystring.stringify({
            id: req.body.id
        });
        res.redirect("/dashboard?" + query);
    }
});

router.post("/purchase/form", urlencodedParser, async(req, res) => {
    res.render("purchase", req.body);
});

router.post("/purchase", urlencodedParser, async(req, res) => {
    const result = await productController.productPurchase(req.body);
    if (result != "error") {
        const query = querystring.stringify({
            id: req.body.id
        });
        res.redirect("/dashboard?" + query);
    }
});


router.get("/history", async(req, res) => {
    const purcheses = await productController.getHistory(req.query.id);
    res.render("history", { id: req.query.id, data: purcheses });
});

module.exports = router;