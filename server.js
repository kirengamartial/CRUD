const express = require('express')
const mongoose = require('mongoose')
const Product = require('./models/productModel')
const methodOverride = require('method-override')
require('dotenv').config()

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
mongoose.connect(process.env.DBURL)
.then(() =>{
    console.log('db is connected')
    app.listen(3000)
})
.catch(err =>{
    console.log(err)
})

app.get('/',(req, res) =>{
    Product.find()
    .then(result =>{
        res.render('index', {products: result})
    })
    .catch(err =>{
        console.log(err)
    })
})

app.get('/create', (req, res) => {
    res.render('create')
})
app.post('/create', (req, res) => {
const data = {
    productName: req.body.productName,
    price: req.body.price,
    description: req.body.description
}
const product = new Product(data)
product.save()
.then(() =>{
    res.redirect('/')
})
.catch(err => {
    console.log(err)
})
})
app.get('/update/:id', (req, res) => {
    Product.findById(req.params.id)
    .then(result => {
        res.render('update', {product: result})
    })
})

app.delete('/delete/:id', (req, res) => {
    const productId = req.params.id
    Product.findByIdAndDelete(productId)
    .then(() => {
        res.redirect('/')
    })
    .catch(err => {
        console.log(err)
    })
})
app.put('/update/:id', async (req, res) => {
    const productId = req.params.id;
    const updatedData = {
        productName: req.body.productName,
        price: req.body.price,
        description: req.body.description
    };

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Update only the fields that are provided in the request
        if (updatedData.productName) {
            product.productName = updatedData.productName;
        }
        if (updatedData.price) {
            product.price = updatedData.price;
        }
        if (updatedData.description) {
            product.description = updatedData.description;
        }

        await product.save();
        res.redirect('/');
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Handle validation errors
            return res.status(400).send('Validation Error: ' + error.message);
        }

        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});
