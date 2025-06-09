const Product = require("../../models/Product");
const axios = require('axios');
const { hash } = require("bcryptjs");
const FormData = require('form-data');
const py_url = process.env.PYTHON_SERVER_URL;

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh", page = 1 } = req.query;
    

    const limit = 40;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;

        break;
      case "price-hightolow":
        sort.price = -1;

        break;
      case "title-atoz":
        sort.title = 1;

        break;

      case "title-ztoa":
        sort.title = -1;

        break;

      default:
        sort.price = 1;
        break;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);    
    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Product.countDocuments(filters);

    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);
      
    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalPages: totalPages,
        currentPage: pageNumber,
        productsPerPage: limitNumber,
        hasNextPage: totalPages > pageNumber,
        hasPrevPage: pageNumber > 1,
      }
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductsWithImage = async (req, res) => {
  try {    
    if (!req.file) {
      return res.status(400).json({ error: 'Please Upload the image first!' });
    }
    // 1. Forward image to Python server
    const pythonForm = new FormData();
    pythonForm.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const pythonResponse = await axios.post(py_url+'/api/search', pythonForm, {
      headers: pythonForm.getHeaders()
    });

    // 2. Get product IDs from Python response
    const productIds = pythonResponse.data.similar_images;

    // 3. Populate products from MongoDB
    const products = await Product.find({
      '_id': { $in: productIds }
    });

    // 4. Send populated products to frontend
    res.json(products);

  } catch (error) {
    // console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


module.exports = { getFilteredProducts, getProductDetails, getProductsWithImage };
