const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const uploads = require('../middleware/multer');

const productRouter = require('express').Router();

productRouter.post('/createProduct', uploads.array('productImages', 5), createProduct);

productRouter.patch('/register', uploads.array('productImages', 5), updateProduct);

productRouter.get('/register', uploads.array('productImages', 5), deleteProduct);

module.exports = productRouter