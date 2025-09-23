const productModel = require('../models/product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs')

exports.createProduct = async (req, res) => {
    try {
        const {productName} = req.body;
        const files = req.files;
        let response;
        let list = [];
        let babylist = {}

        if (files && files.length > 0) {
            for (const file of files) {
                response = await cloudinary.uploader.upload(file.path);
                babylist = {
                    publicId: response.public._id,
                    imageUrl: response.secure_url
                };
                list.push(babyList);
                fs.unlinkSync(file.path)
            }
        };

        const products = new productModel({
            productName,
            productImage: list
        })

        await products.save();
        res.status(201).json({
            message: 'Product created successfully',
            data: products
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.messsage
        })
    }
}

// exports.update = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const product = await productModel.findByIdAndUpdate (id);

//         if (!product) {
//             return res.status()
//         }

//     } catch (error) {
//         res.status(500).json({
//             message: 'Internal server error',
//             error: error.message
//         })
//     }
// }


exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updates = req.body;
        Object.assign(user, updates);

        await user.save();
        res.status(200).json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const {id} = req.body._id;
        const product = await productModel.findById(id);

        if(!product) {
            return res.status(404).json('Product not found')
        };

        await productModel.findByIdAndDelete(product._id);
        res.status(200).json('Product updated successfully')

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}