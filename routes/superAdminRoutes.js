const express                     = require('express');
const router                      = express.Router();

const authController              = require('../controllers/super/superauth.controller');
const usersController              = require('../controllers/super/superusers.controller');
const serviceController              = require('../controllers/super/superservice.controller');
const categoryController              = require('../controllers/super/supercategory.controller');
const subserviceCtrl              = require('../controllers/super/supersubservice.controller');
const ordersCtrl              = require('../controllers/super/superorders.controller');
const coupanCtrl              = require('../controllers/super/supercoupan.controller');
const empCtrl              = require('../controllers/super/superemployees.controller');
const scheduleCtrl              = require('../controllers/super/superschedule.controller');
const subCatCtrl              = require('../controllers/super/supersubcategory.controller');
const ratingCtrl              = require('../controllers/super/superratings.controller');
const profileCtrl              = require('../controllers/super/superprofile.controller');
const documentCtrl              = require('../controllers/super/superdocument.controller');
const faqCtrl              = require('../controllers/super/superfaq.controller');
const bannerCtrl              = require('../controllers/super/superbanner.controller');
const cancellationCtrl              = require('../controllers/super/supercancellation.controller');
const paymentCtrl              = require('../controllers/super/superpayment.controller');
const notificationCtrl              = require('../controllers/super/supernotification.controller');
const usertypeCtrl              = require('../controllers/super/superuserType.controller');
const roletypeCtrl              = require('../controllers/super/superroleType.controller');
const companyCtrl              = require('../controllers/super/supercompany.controller');
const chatCtrl              = require('../controllers/super/superchat.controller');



router.use('/',authController);
router.use('/users/',usersController);
router.use('/category/',categoryController);
router.use('/subcategory/',subCatCtrl);
router.use('/service/',serviceController);
//router.use('/subservice/',subserviceCtrl);
router.use('/orders/',ordersCtrl);
router.use('/coupans/',coupanCtrl);
router.use('/employees/',empCtrl);
router.use('/schedule/',scheduleCtrl);
router.use('/ratings/',ratingCtrl);
router.use('/profile/',profileCtrl);
router.use('/document/',documentCtrl);
router.use('/faq/',faqCtrl);
router.use('/banner/',bannerCtrl);
router.use('/payment/',paymentCtrl);
router.use('/notification/',notificationCtrl);
router.use('/cancellation/',cancellationCtrl);
router.use('/usertype/',usertypeCtrl);
router.use('/roletype/',roletypeCtrl);
router.use('/company/',companyCtrl);
router.use('/chat/',chatCtrl);


router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;