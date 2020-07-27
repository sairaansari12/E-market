const config = require('config');
const routes = require('express').Router();
const jwt = require('jsonwebtoken');
 sequelize = require('sequelize');
 commonNotification=require('../controllers/api/common/notifications.controller')


//ALL MODELS

 global.PRODUCTS = db.models.products
 CATEGORY = db.models.categories
 CART = db.models.cart
 COUPAN = db.models.coupan
 FAVOURITES = db.models.favourites
 ADDRESS = db.models.address
 BANNERS = db.models.banners
 ORDERS=db.models.orders
 SUBORDERS=db.models.suborders
 SCHEDULE = db.models.schedule
 USERS =db.models.users
 COMPANY = db.models.companies
 DOCUMENT = db.models.document
 FAQ = db.models.faq
 BANNER = db.models.banners
 PAYMENT = db.models.payment
 EMPLOYEE = db.models.employees
 NOTIFICATION = db.models.notifications
 ASSIGNMENT = db.models.assignedEmployees
 CANCELREASON = db.models.cancelReasons
 COMPANYRATING = db.models.companyRatings
 USERTYPE=db.models.userType
 ROLETYPE=db.models.roleTypes
 BUSINESSTYPE=db.models.businessType
 PRODUCTSPEC=db.models.productSpecifications
 RECOMMENDED=db.models.recommendedProduct
 SHIPMENT=db.models.shipment
 RATINGS=db.models.ratings
 WISHLIST=db.models.wishlist
SIZECHARTS = db.models.sizehcharts
 



//const authCtrl       = require('../controllers/authController');
const responseHelper = require('../helpers/responseHelper');
const cronJobCtrl = require('../controllers/cronJobController');
const authCtrl = require('../controllers/api/authController');
const profileCtrl = require('../controllers/api/profile.controller');
const addressCtrl = require('../controllers/api/address.controller');
const serviceCtrl = require('../controllers/api/service.controller');
const ordersCtrl = require('../controllers/api/orders.controller');
const cartCtrl = require('../controllers/api/cart.controller');
const favtCtrl = require('../controllers/api/favourite.controller');
const coupanCtrl = require('../controllers/api/coupan.controller');
const ratingCtrl = require('../controllers/api/rating.controller');
const notifCtrl = require('../controllers/api/notification.controller');
const othrCtrl = require('../controllers/api/others.controller');
const wishCtrl = require('../controllers/api/wishlist.controller');


const scheduleCtrl = require('../controllers/api/schedule.controller');
const companyRoutes   = require('./dashboardRoutes');
const deliveryRoutes   = require('./deliveryRoutes');
const adminRoutes   = require('./superAdminRoutes');

const chroneRoutes   = require('../controllers/cronJobController');
const realTimeTrackingController  = require('../controllers/RealTimeTracking');



////// ================== middleware to set custom message on unauthorized token ================//////
routes.use("/mobile/auth",authCtrl)


/*
  Authentication Routes
*/


routes.use("/mobile/profile",profileCtrl)

///ADDRESS MANAGEMENT
routes.use("/mobile/address",addressCtrl)

//Services 

routes.use("/mobile/services/",serviceCtrl)

//CART MANAGEMENT

routes.use("/mobile/cart/",cartCtrl)


//FAVOURITES MANAGEMENT

routes.use("/mobile/favourite/",favtCtrl)


//WISHLIST MANAGEMENT

routes.use("/mobile/wishlist/",wishCtrl)



//COUPANS MANAGEMENT

routes.use("/mobile/coupan/",coupanCtrl)

//ORDERS MANAGEMENT

routes.use("/mobile/orders/",ordersCtrl)


//SCHEDULE MANAGEMENT

routes.use("/mobile/schedule/",scheduleCtrl)

//RATING MANAFGEMENT

routes.use("/mobile/rating/",ratingCtrl)



//OTHERS MANAFGEMENT

routes.use("/mobile/",othrCtrl)




//NOTIFICATOIPON


routes.use("/mobile/notification/",notifCtrl)

//DSHBOARD DROUTES
routes.use('/company',companyRoutes);


//Delivery DROUTES
routes.use('/delivery',deliveryRoutes);



//Admin DROUTES
routes.use('/admin',adminRoutes);


//If No URL found
routes.use((req, res, next) => {

  return responseHelper.error(res, 'Please again check the url,this path is not specified2', 404);
});




module.exports = routes;