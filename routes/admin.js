const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin')
const locals = require('../middleware/locals')

const adminController = require('../controllers/admin');

router.get('/products', locals, isAdmin, adminController.getProducts);

router.get('/add-product', locals, isAdmin, adminController.getAddProduct);

router.post('/add-product', isAdmin, adminController.postAddProduct);

router.get('/products/:productid', locals, isAdmin, adminController.getEditProduct);

router.post('/products', isAdmin, adminController.postEditProduct);

router.post('/delete-product', isAdmin, adminController.postDeleteProduct);

router.get('/add-category', locals, isAdmin, adminController.getAddCategory);

router.post('/add-category', isAdmin, adminController.postAddCategory);

router.get('/categories', locals, isAdmin, adminController.getCategories);

router.get('/categories/:categoryid', locals, isAdmin, adminController.getEditCategory);

router.post('/categories', isAdmin, adminController.postEditCategory);

router.post('/delete-category', isAdmin, adminController.postDeleteCategory);

module.exports = router;