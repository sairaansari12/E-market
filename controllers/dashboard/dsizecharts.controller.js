const express = require('express');
const app     = express();
const moment = require('moment');
const { QueryTypes, Sequelize } = require('sequelize');
const hashPassword = require('../../helpers/hashPassword');
const db = require('../../db/db');
const { adminAuth } = require('../../middleware/auth');
const COMPANY= db.models.companies
const USER = db.models.users
const ORDERS= db.models.orders
const SUBORDERS=db.models.suborders
const Op = require('sequelize').Op;

ORDERS.hasMany(SUBORDERS,{foreignKey: 'orderId'});
ORDERS.hasOne(PAYMENT,{foreignKey: 'orderId'})
SUBORDERS.hasMany(PAYMENT,{foreign_key: 'orderId'});


app.get('/add',adminAuth, async (req, res, next) => {

    const categories = await CATEGORY.findAll({ order: [['createdAt', 'DESC']] });

    return res.render('admin/sizecharts/addsizechart.ejs',{categories});

});

module.exports = app;
