const express = require('express');
const app     = express();
const { Validator } = require('node-input-validator');
const moment = require('moment');
const { QueryTypes, Sequelize } = require('sequelize');
const hashPassword = require('../../helpers/hashPassword');
const db = require('../../db/db');
const { adminAuth } = require('../../middleware/auth');
const SIZECHART = db.models.sizesChart;
const Op = require('sequelize').Op;


app.get('/add',adminAuth, async (req, res, next) => {

    const categories = await CATEGORY.findAll({ order: [['createdAt', 'DESC']] });

    return res.render('admin/sizecharts/addsizechart.ejs',{categories});

});

app.post('/insert', async (req, res, next) => {

    try{

    const body = req.body;

    const v = new Validator(body, {
        title: 'required',
        sizename: 'required',
        category: 'required'
    });

    const matched = await v.check();

    console.log("errors are ",v.errors);
 
    if (!matched) {

      return res.json({
          status: 201,
          message: v.errors
      });

    }
  

    const add = await SIZECHART.create({
        sizeName: body.sizename,
        title: body.title,
        status: 1,
        categoryId: body.category
    });

    return res.json({
        status: 200,
        message: "Size Chart Added Successfully!"
    });


    }catch(e){
        return res.json({
            status: 400,
            message: e
        })
    }

});

app.get('/view', adminAuth ,async (req, res, next) => {

    const sizecharts = await SIZECHART.findAll({});

    return res.render('admin/sizecharts/sizechartListing.ejs',{sizecharts});

});

app.get('/delete/:sizeid', adminAuth, async (req, res , next)=>{

try{

const deleteSizeChart = await SIZECHART.destroy({
    where: {id: req.params.sizeid}
});

return res.json({
    status: 200,
    message: "Sizechart Deleted!"
});

}catch(e){
    return res.json({
        status: 400,
        message: e
    })
}

})

module.exports = app;
