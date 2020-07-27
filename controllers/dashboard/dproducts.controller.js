const express = require('express');
const app     = express();
const moment = require('moment');
const { QueryTypes, Sequelize } = require('sequelize');
const hashPassword = require('../../helpers/hashPassword');
const { Validator } = require('node-input-validator');
const db = require('../../db/db');
const { adminAuth } = require('../../middleware/auth');
const SIZECHART = db.models.sizesChart;
const Products = db.models.products;
const Op = require('sequelize').Op;

app.get('/add', adminAuth, async(req,res, next)=>{

    const categories = await CATEGORY.findAll({
        where: {companyId: req.companyId}
    });

    return res.render('admin/products/addProduct.ejs',{categories});

});

app.post('/insert', adminAuth, async (req, res, next)=> {
    try{

        let body = req.body;

        const v = new Validator(body, {
            brandname: 'required',
            name: 'required',
            description: 'required',
            type: 'required',
            price: 'required',
            status: 'required'
        });
    
        const matched = await v.check();

        if(!matched){
            return res.json({
                status: 201,
                message: v.errors
            })
        }

        let icon = "";
        let thumbnail = "";

        if(req.files != null){

            if("icons" in req.files){

                let iconFile = req.files.icon;



                iconFile.mv('./public/images/'+ Date.now() +iconFile.name, function(err) {
                    if (err)
                        return res.status(500).send(err);   
                });

                icon = iconFile.name;

            }

            if("thumbnail" in req.files){

                let thumbnailFile = req.files.thumbnail;

                thumbnailFile.mv('./public/images/'+ Date.now() +thumbnailFile.name, function(err) {
                    if (err)
                        return res.status(500).send(err);  
                });

                 thumbnail = thumbnailFile.name;

            }

        }


        const insertProduct = await Products.create(
            {
                categoryId: body.category,
                brandName: body.brandname,
                name: body.name,
                description: body.description,
                icon: icon,
                thumbnail: thumbnail,
                type: body.type,
                price: body.price,
                status: body.status,
                companyId: '1a41762d-ca81-4900-986a-d52482e97cf2'
            }
        );

    return res.json({
        status: 200,
        message: "Product Added Successfully!"
    });

    }catch(e){
        return res.json({status: 400, message: e});
    }
});

app.get('/view', adminAuth, async(req, res, next)=>{

    const products = await Products.findAll({  order: [['createdAt', 'DESC']] });
    const categories = await CATEGORY.findAll({ order: [['createdAt', 'DESC']] });

    return res.render('admin/products/getproducts.ejs',{products,categories});
});

app.post('/edit/:id',adminAuth, async(req, res, next)=>{
    try{

        let id = req.params.id;
        let body = req.body;

        const selectProduct = await Products.findOne({
            where: {id: id}
        });

        let icon = selectProduct.icon;
        let thumbnail = selectProduct.thumbnail;

        if(req.files != null){

            if("icons" in req.files){

                let iconFile = req.files.icon;

                iconFile.mv('./public/images/'+ Date.now() +iconFile.name, function(err) {
                    if (err)
                        return res.status(500).send(err);   
                });

                icon = iconFile.name;

            }

            if("thumbnail" in req.files){

                let thumbnailFile = req.files.thumbnail;

                thumbnailFile.mv('./public/images/'+ Date.now() +thumbnailFile.name, function(err) {
                    if (err)
                        return res.status(500).send(err);  
                });

                thumbnail = thumbnailFile.name;

            }

        }

        const updateProduct = await Products.update(
            {
                categoryId: body.category,
                brandName: body.brandname,
                name: body.name,
                description: body.description,
                icon: icon,
                thumbnail: thumbnail,
                type: body.type,
                price: body.price,
                status: body.status
            },
            { where: { id: id } }
        );

    req.flash('successMessage',"Product Details Updated!")
    return res.redirect(adminpath+'products/view');

    }catch(e){
        return res.json({status: 400, message: e});
    }
});

app.get('/delete/:id', adminAuth, async(req, res, next)=>{
    let id = req.params.id;

    await Products.destroy({
        where: {
            id: id
        }
    });

    req.flash('successMessage',"Product Deleted!")
    return res.redirect(adminpath+'products/view');
})

module.exports = app;