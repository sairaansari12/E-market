
const express = require('express');
const app = express();
const Op = require('sequelize').Op;
var dateFormat = require('dateformat');
var moment = require('moment')



//Relations
SUBORDERS.belongsTo(PRODUCTS,{foreignKey: 'serviceId'})
SUBORDERS.belongsTo(ADDRESS,{foreignKey: 'addressId'})
SUBORDERS.belongsTo(COMPANY,{foreignKey: 'companyId'})
RATINGS.belongsTo(USER,{foreignKey: 'userId'})
RATINGS.belongsTo(PRODUCTS,{foreignKey: 'serviceId'})
SUBORDERS.belongsTo(CANCELREASON,{foreignKey: 'cancellationReason'})
ORDERS.hasMany(SUBORDERS,{foreignKey: 'orderId'})




app.post('/create',checkAuth,async (req, res, next) => {
  const params = req.body;
  var days=['sun','mon','tue','wed','thu','fri','sat']

var promoCodeApplied=""
  let responseNull=  commonMethods.checkParameterMissing([params.serviceDateTime])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
  
  try{
		const findData = await PAYMENT.findOne({where: {userId: req.id,transactionStatus: 2},order: [
      ['createdAt','DESC']
    ],})  
      
     if(findData)
{
  ORDERS.destroy({where:{id: findData.dataValues.orderId}})
  SUBORDERS.destroy({where:{orderId: findData.dataValues.orderId}})
  PAYMENT.destroy({where:{orderId: findData.dataValues.orderId}})


}
   


   //else{
      var date1=new Date(params.serviceDateTime)
      var dayCount=days[date1.getDay()]

    var cartData = await CART.findAll({ where :{ userId : req.id }});

    //console.log()
    if(cartData && cartData.length>0) 
   {


  //  console.log(">>>>>>>>>>>>>",cartData)
    var countDataq = await CART.findOne({
      attributes: ['id','promoCode','userId',
        [sequelize.fn('sum', sequelize.col('orderPrice')), 'totalSum'],
        [sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity'],

      ],
  
    where :{userId : req.id
     
    }
});




cartData=JSON.parse(JSON.stringify(cartData))
countDataq=JSON.parse(JSON.stringify(countDataq))

// if(parseInt(slotsBookingsAlowed)==0)
// //if(parseInt(countDataq.slotsBookingsAlowed)>0)
// return responseHelper.post(res, appstrings.all_slots_full, null, 400);



var orderPrice=countDataq.totalSum
var discountPrice=0
var serviceCharges=(params.serviceCharges && params.serviceCharges!="") ? params.serviceCharges :0
var totalPrice=parseFloat(orderPrice)+parseFloat(serviceCharges)


// Write APPLY PROMO CODE HERE//

const coupanDetails = await COUPAN.findOne({
  attributes: ['id','code','discount'],
   where: {
     code: cartData[0].promoCode,
     status :1

   }
 });

 if(coupanDetails)
 {
   
   let per   = parseFloat(coupanDetails.dataValues.discount);
   discountPrice = (totalPrice/100)*per;        // Get Percentage Amount
   totalPrice  = totalPrice - discountPrice;  //Payable Amount
   promoCodeApplied=coupanDetails.dataValues.code
 }


 //const cOrderData=null
    const cOrderData = await ORDERS.create({
	
      serviceDateTime: params.serviceDateTime,
      orderPrice :orderPrice ,
      serviceCharges :serviceCharges,
      offerPrice: discountPrice,
      promoCode: promoCodeApplied,
      totalOrderPrice:totalPrice,
      userId: req.id

    })  
      
      if(cOrderData) 
      {

        subOrdersEntry(cartData,cOrderData.dataValues.id,req.id,params.serviceDateTime,async function(data,error)
        {

  if(data)
  
  {
    paymentEntry(req.id,cOrderData.dataValues.id,totalPrice)
     sendNotification(req,params,totalPrice,cOrderData.dataValues.id)
     updateUserTye(req.id)
    return responseHelper.post(res, appstrings.order_success, cOrderData);}
    else  return responseHelper.post(res, error, null,400);
 
         })

 }
 else return responseHelper.post(res, appstrings.oops_something, null,400);





}
else return responseHelper.post(res, appstrings.no_item_cart,null, 204);




 }
catch (e) {
  console.log(e)
  return responseHelper.error(res, e.message, 400);
}
  
}) 

async function sendNotification(req,params,totalPrice,orderId)
{
  
   
var userData=await USER.findOne({where:{id:req.id}});
var countryCode="",phoneNumber=""
if(userData &&userData.dataValues)
{
phoneNumber=userData.dataValues.phoneNumber
countryCode=userData.dataValues.countryCode

}



 var notifUserData={title:appstrings.order_placed+" "+commonMethods.formatAMPM(new Date(params.serviceDateTime)),
      description:appstrings.order_placed +" " +commonMethods.formatAMPM(new Date(params.serviceDateTime)) + " Rs : "+totalPrice,
      userId:req.id,
      orderId:orderId,
      role:3}

 var notifPushUserData={title:appstrings.order_placed+" "+commonMethods.formatAMPM(new Date(params.serviceDateTime)),
      description:appstrings.order_placed +" " +commonMethods.formatAMPM(new Date(params.serviceDateTime)) + " Rs : "+totalPrice,
      token:userData.dataValues.deviceToken, 
      orderId:orderId,
           platform:userData.dataValues.platform,notificationType:"ORDER_PLACED",status:0,
}

 commonNotification.insertNotification(notifUserData)   
 commonNotification.sendNotification(notifPushUserData)   

}

async function updateUserTye(userId)
{
  var type=1
 ORDERS.findAll({attributes:[ `id`, `orderNo`, `serviceDateTime`, `orderPrice`, `promoCode`, `offerPrice`, `serviceCharges`, `totalOrderPrice`, `userId`, `createdAt`, `updatedAt`],where:{userId:userId}}).then(data=>
 {
if(data && (data.length>0 && data.length<6)) type=2 
if(data && (data.length>=6 && data.length<15)) type=3 

USER.update({userType:type},{where:{id:userId}})

 }).catch(err=>{
console.log(err)
 })
 


}

app.post('/status',checkAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
    

     var userData = await ORDERS.findOne({
       where: {
         id: params.id }
     });
     
     
     if(userData)
     {
     
if(params.status=="5" && userData.dataValues.trackStatus<3 )
return responseHelper.post(res, appstrings.job_not_completed,null,400);


  const updatedResponse = await ORDERS.update({
       progressStatus: params.status,

     },
     {
       where : {
       id: userData.dataValues.id
     }
     });
     
     if(updatedResponse)
           {
  if(params.status==5)
  {
    userData=JSON.parse(JSON.stringify(userData))
            var findData=await USER.findOne({where:{id:userData.userId}});
       var notifPushUserData={title:userData.orderNo +appstrings.order_mark_complete+ ' on ' +commonMethods.formatAMPM(new Date),
            description:userData.orderNo +appstrings.order_mark_complete + ' on ' +commonMethods.formatAMPM(new Date),
            token:findData.dataValues.deviceToken,  
                platform:findData.dataValues.platform,
                userId :userData.userId, role :3,
                notificationType:"ORDER_STATUS",status:5,
      }
      
commonNotification.insertNotification(notifPushUserData)   
 commonNotification.sendNotification(notifPushUserData)
    }
         return responseHelper.post(res, appstrings.success,null);
           }
           else{
             return responseHelper.post(res, appstrings.oops_something,400);
  
           }
     
     }

     else{
      return responseHelper.post(res, appstrings.no_record,204);

    }

       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});

app.post('/paymentStatus',checkAuth,async(req,res,next) => { 
    
  var params=req.body
  var paymentState=0
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.orderId,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
    if(params.status=="1") {paymentState=1
      CART.destroy({where:{userId: req.id}})
    }

     const userData = await PAYMENT.findOne({
       where: {
         orderId: params.orderId,
         userId: req.id,
        }
     });
     
     
     if(userData)
     {
     

   
  const updatedResponse = await PAYMENT.update({
    userId: req.id,
    orderId:params.orderId ,
    transactionStatus:params.status ,
    paymentMode:params.paymentMode ,
    transactionId:params.transactionId ,
    paymentState:paymentState,
    updatedAt: new Date()

     },
     {
       where : {
       id: userData.dataValues.id
     }
     });
     
     if(updatedResponse)return responseHelper.post(res, appstrings.success,null);
     return responseHelper.post(res, appstrings.oops_something,400);
  
          
     
     }

     else{

var orderData=await ORDERS.findOne({
  where: {
    id: params.orderId,
   }
});

      const createdResponse = await PAYMENT.create({
        userId: req.id,
        orderId:params.orderId ,
        transactionStatus:params.status,
        paymentMode:params.paymentMode,
        transactionId:params.transactionId,
        paymentState:paymentState,
        amount:params.amount

    
         });
         if(createdResponse)return responseHelper.post(res, appstrings.success,null);
         return responseHelper.post(res, appstrings.oops_something,400);
    
        }
       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


function paymentEntry(userId,orderId,amount)
{

  try{
   PAYMENT.create({
    
    userId: userId,
    orderId:orderId ,
    amount:amount

   
    })  
  }
  catch(e)
  {console.log(e)}



}


 async function subtractBookingsCount(id,size,quantity)
{

var data=await PRODUCTSPEC.findOne({where:{id:id}})



if(data && data.dataValues.stockQunatity)

{

  var stockQunatity=JSON.parse(data.dataValues.stockQunatity)
  console.log(">>>>>>>>>>>>>>",stockQunatity.length)
for(var t=0;t<stockQunatity.length;t++)
  {


if(stockQunatity[t].id==size)   
{
var quantity=parseInt(stockQunatity[t].stock)-parseInt(quantity)
stockQunatity[t].stock=quantity.toString()
}  

  }


  //console.log("SLOTS are>>>>",JSON.stringify(slotdata))
  PRODUCTSPEC.update({stockQunatity : JSON.stringify(stockQunatity)}, {where :{id:id}})
}

}


async function subOrdersEntry(orderData,id,userId,serviceDateTime,callback)
{
  try{
  for(var t=0;t<orderData.length;t++)
  {
   

    console.log("<<<<<<<<<<<<<<<<<",orderData[t].estimateDelivery)
    await SUBORDERS.create({
    
      serviceId: orderData[t].serviceId,
      quantity: orderData[t].quantity,
      addressId: orderData[t].addressId,
      companyId: orderData[t].companyId,
      serviceCharges: orderData[t].serviceCharges,
      size: orderData[t].size,
      color: orderData[t].color,
      estimateDelivery: orderData[t].estimateDelivery,
      orderId :id ,
      userId :userId 

     
      })  

      subtractBookingsCount(orderData[t].color,orderData[t].size,orderData[t].quantity)
     


      var userData=await USER.findOne({where:{id:userId}});
      var countryCode="",phoneNumber=""
      if(userData &&userData.dataValues)
      {
      phoneNumber=userData.dataValues.phoneNumber
      countryCode=userData.dataValues.countryCode
      
      }

      var notifData={title:appstrings.new_order_title+" "+commonMethods.formatAMPM(new Date(serviceDateTime)),
      description:appstrings.new_order_description +" " +commonMethods.formatAMPM(new Date(serviceDateTime)) + " Contact : +"+countryCode+" "+phoneNumber,
      userId: orderData[t].companyId,
      orderId:id,
      role:2}

    commonNotification.insertNotification(notifData)   





      if(t==orderData.length-1)
      callback("Success",null)
  }

}
catch(error)
{
callback(null,error.message)

}
}

app.get('/list',checkAuth,async (req, res) => {
   
    var params=req.query
    var progressStatus =  ['0','1','2','3','4','5']

    var page =1
    var limit =20
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.progressStatus && params.progressStatus!="")  progressStatus=params.progressStatus.split(",")


    //console.log(">>>>>>>>",progressStatus)
 
    var offset=(page-1)*limit

   
    try {
      var user = await ORDERS.findAll({
        attributes:['id','orderNo','serviceDateTime','orderPrice','promoCode','offerPrice','serviceCharges','totalOrderPrice','createdAt',
       ],
      where :{userId : req.id},
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,
       
      include: [
        {model: SUBORDERS ,
          where:{progressStatus: { [Op.or]: progressStatus}},
          attributes: ['id','serviceId','quantity','color','size','progressStatus','trackStatus'],
        include: [{
          model: PRODUCTS,
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','brandName'],
          required: false
        },
        {model: CANCELREASON , attributes: ['reason']},
        {model: COMPANY , attributes: ['address1LatLong']},
        {model: ADDRESS , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,

      
      ],
      required:true
} ,
      
      
       
    ],


      });
user=JSON.parse(JSON.stringify(user))
      for(var t=0;t<user.length;t++)
      {

  var orderDate=new Date(user[t].createdAt)
var today=new Date()
var diffMins = diff_mins(today,orderDate); // milliseconds between now & Christmas

console.log("diffMins>>>>",diffMins)
if( diffMins<30 && user[t].progressStatus<5)  user[t].cancellable=true 
else  user[t].cancellable=false
 


// if(user[t].company && user[t].company.address1LatLong!=null)      user[t].companyAddress=JSON.parse(user[t].company.address1LatLong)
// else  user[t].companyAddress=""
// delete  user[t]['company'];


}
      
        return responseHelper.post(res,appstrings.detail,user);
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });


app.get('/detail/:orderId',checkAuth,async (req, res) => {
  var orderId=req.params.orderId
  
  let responseNull=  commonMethods.checkParameterMissing([orderId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
    try {
      const orderData = await ORDERS.findOne({
        attributes:['id','orderNo','serviceDateTime','orderPrice','serviceCharges','promoCode','offerPrice','totalOrderPrice','userId','createdAt'],
      where :{id :orderId},      
      include: [
     
        {model: SUBORDERS , attributes: ['id','serviceId','quantity','color','size','serviceCharges','progressStatus','trackStatus','cancellationReason','otherReason','estimateDelivery'],
        include: [{
          model: PRODUCTS,
          attributes: ['id','name','description','icon','thumbnail','type','price','offer','offerName','brandName'],
          include:[{
            model: PRODUCTSPEC,
            attributes:['id','productImages','productColor','stockQunatity'],
            required: false,
         }],
          required: false
        },
        {model: CANCELREASON , attributes: ['reason']},
        {model: ADDRESS , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,

        {
          model: COMPANY,
          attributes:['id','companyName','logo1'],
           include:[{model:DOCUMENT ,attributes:['aboutus']}]
       },
      
      ]        
 
        
    } ,

    {model: ASSIGNMENT , attributes: ['id','jobStatus'],
    where:{jobStatus :1},
    required: false,
    include: [{
      model: EMPLOYEE,
      attributes: ['id','firstName','lastName','countryCode','phoneNumber','image'],
      required: false
    }]
    }
      
      ]

      });
     if(orderData) 
     
     {



    // var distance=
    
      return responseHelper.post(res,appstrings.detail,orderData);


     }
      else return responseHelper.post(res,appstrings.no_record,null,204);
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });


  app.get('/getCancelReasons',checkAuth,async (req, res) => {
   
    console.log(">>>>>>>>>>",req.parentCompany)
    try {
      var findData = await CANCELREASON.findAll({
      where :{companyId: req.parentCompany,
       status :1,
       type:1
      },
      order: [
        ['createdAt', 'DESC']]});
       
    if(findData.length>0)
        return responseHelper.post(res,appstrings.detail,findData);
        else
        return responseHelper.post(res,appstrings.no_record,null,204);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });



  app.post('/cancel',checkAuth,async (req, res, next) => {
    const params = req.body;
  
  
    let responseNull=  commonMethods.checkParameterMissing([params.orderId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    
    try{
      const orderData = await ORDERS.findOne({
        attributes:['id','userId','createdAt',],
      where: {
        id: params.orderId,
        userId: req.id
        
      }
      })  
        
      if(orderData)
     {
  console.log(orderData.dataValues)

var orderDate=new Date(orderData.dataValues.createdAt)
var today=new Date()
var diffMins = diff_mins(today,orderDate);
console.log("diff>>>>>>>>>>",diffMins)
if(diffMins>30)
return responseHelper.post(res, appstrings.order_not_cancel, null,400);


else
{
 
  const subData = await SUBORDERS.findAll({
   where:{ orderId: orderData.dataValues.id}
  });
 

for(var k=0;k<subData.length;k++)
{
var dataTrack=subData[k].trackStatus
const magenicIndex = dataTrack.findIndex(vendor => vendor.status === '2');

if(magenicIndex>=0) dataTrack.splice(magenicIndex,1)
dataTrack.push({"status":"2","data":(new Date())})
  
  const updatedResponse = await SUBORDERS.update({
    progressStatus: 2,
    trackStatus: JSON.stringify(dataTrack),
    cancellationReason:params.cancellationReason,
    otherReason:params.otherReason

  },
  {
    where : {
    id:subData[k].id
  }
  });
  if(k==subData.length-1)
   {
  if(updatedResponse) 
  return responseHelper.post(res, appstrings.cancel_success, null);
  else return responseHelper.post(res, appstrings.oops_something, null,400);
   }
}
       
return responseHelper.post(res, appstrings.cancel_success, null);

  
  }
}

  else return responseHelper.post(res, appstrings.no_record, null,204);


   }
  catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }
    
  })
  


     function diff_mins(dt2, dt1) 
 {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff*60));
  
 }
     
module.exports = app;



//Edit User Profile
