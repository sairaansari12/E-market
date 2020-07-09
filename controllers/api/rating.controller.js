const express = require('express');
const app = express();
const db = require('../../db/db');
const moment   = require('moment');

const Sequelize       = require('sequelize');
const Op             = require('sequelize').Op;


//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////

SUBORDERS.belongsTo(ORDERS,{foreignKey: 'orderId'})
SUBORDERS.belongsTo(USERS,{foreignKey: 'userId'})

//////////////////////////// Get Promo List API ////////////////
// app.get('/myReviews', checkAuth,async (req, res, next) => {
//   try{
//     const subData = await RATINGS.findAll({
//       attributes: ['id','rating','review','reviewImages'],
//       where: {
//         userId: req.id,
//         rating:  {[Op.not]: '0'},
//       },
//       include: [
//         {
//         model: PRODUCTS,
//         attributes: ['id','name','icon','thumbnail'],
//         required: true
//         },
//        {
//           model: ORDERS,
//           attributes: ['id','createdAt','serviceDateTime'],
//           required: true
        
      
//       }],
//       order: [['createdAt', 'DESC']]

//     })
    
    
// if(subData && subData.length>0) return responseHelper.post(res, appstrings.success,subData)
//     else
//  return responseHelper.post(res, appstrings.no_record,null,204);

//   }
//   catch(e){
//     return responseHelper.error(res, e.message, 400);
//   }
// });


//SERVICE RATING
app.get('/serviceRatings', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.serviceId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    var where= {serviceId:  params.serviceId,
    rating:  {[Op.not]: '0'}}



    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)

    if(params.filterRating && params.filterRating!="") where.rating=parseFloat(params.filterRating)

    var offset=(page-1)*limit


    var subData = await RATINGS.findAll({
      attributes: ['id','rating','review','reviewImages','createdAt'],
    
      where: where,
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true
        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await commonMethods.getServiceAvgRating(params.serviceId)
    

let dataToSend={}
if(subData && subData.length>0) 
{
  dataToSend.avgRating=ratData.dataValues.totalRating
  dataToSend.data=subData

  return responseHelper.post(res, appstrings.success,dataToSend)
}
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});




///////// Add Coupan /////////////////////////
app.post('/addRating', checkAuth,async (req, res, next) => {
  try{
    const params    = req.body;
    //Get Coupan Details
//console.log(req.files)
    let responseNull=  commonMethods.checkParameterMissing([params.rating,params.serviceId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  

 
var upload=[]
//console.log(">>>>>>>>>>>>>>>>",req.files['productImages#'+datatoUpdated[h].serviceId])
      if(req.files && req.files['images'])
      {
var fdata=req.files['images']

if(fdata.length && fdata.length>0)
{

for(var k=0;k<fdata.length;k++)
  {

       ImageFile = req.files['images'][k];    
  
         bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
          upload.push(bannerImage)
           ImageFile.mv(config.UPLOAD_DIRECTORY +"reviews/"+ bannerImage, function (err) {
              //upload file
              if (err)
              return responseHelper.error(res, err.meessage, 400);   
            });
  }
  
  
}

else{
  ImageFile = req.files['images'];    

  bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
   upload.push(bannerImage)
    ImageFile.mv(config.UPLOAD_DIRECTORY +"reviews/"+ bannerImage, function (err) {
       //upload file
       if (err)
       return responseHelper.error(res, err.meessage, 400);   
     });

  
}

      }
      var result=await RATINGS.create({
        rating:params.rating,
        review: params.review,
        serviceId:params.serviceId,
        userId:req.id,
        orderId:params.orderId,
        reviewImages:upload.toString(),
    
      })
    
  

      if(result)return responseHelper.post(res, appstrings.rating_added,null);
      else     return responseHelper.error(res, appstrings.oops_something, 400);

    
  }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }
});

///////// Add Coupan /////////////////////////
app.post('/addCompanyRating', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.companyId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  


  var findData=await COMPANYRATING.findOne({
    userId: req.id,
    companyId:data.companyId});

    if(findData)
    {
      return responseHelper.post(res, appstrings.already_exists,null,400);

    }
    else{
    
      await COMPANYRATING.create({
        rating: data.rating,
        review: data.review,
        userId:req.id,
        companyId:data.companyId
      });

      return responseHelper.post(res, appstrings.rating_added,null);
    }
    
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




module.exports = app;