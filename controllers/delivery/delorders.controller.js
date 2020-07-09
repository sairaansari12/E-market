
const express = require('express');
const app = express();
const Op = require('sequelize').Op;

//Relations
SUBORDERS.belongsTo(PRODUCTS,{foreignKey: 'serviceId'})
ORDERS.belongsTo(db.models.address,{foreignKey: 'addressId'})
ASSIGNMENT.belongsTo(ORDERS,{foreignKey: 'orderId'})
ORDERS.hasMany(SUBORDERS,{foreignKey: 'orderId'})







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
     

   
  const updatedResponse = await ORDERS.update({
       trackStatus: params.status,

     },
     {
       where : {
       id: userData.dataValues.id
     }
     });
     
     if(updatedResponse)
           {

            if(params.status=="3")
            {
               ORDERS.update({progressStatus: params.status},{where : {id: userData.dataValues.id}});
            }


            if(params.status=="4")
            {
               ORDERS.update({progressStatus: 5},{where : {id: userData.dataValues.id}});

               userData=JSON.parse(JSON.stringify(userData))
               var findData=await USER.findOne({where:{id:userData.userId}});
             var notifPushUserData={title:userData.orderNo +appstrings.order_mark_complete+ ' on ' +commonMethods.formatAMPM(new Date),
               description:userData.orderNo +appstrings.order_mark_complete + ' on ' +commonMethods.formatAMPM(new Date),
               token:findData.dataValues.deviceToken,  
                   platform:findData.dataValues.platform,
                   userId :userData.userId, role :3,
                   orderId:userData.id,
                   notificationType:"ORDER_STATUS",status:params.status,
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


app.get('/list',checkAuth,async (req, res) => {
   
    var params=req.query
    var progressStatus =  ['0','1','2','3','4','5']
    var companyAddress=await COMPANY.findOne({attributes:['companyName','address1','address2','logo1','logo2'],where:{id:req.companyId}})

    var page =1
    var limit =20
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.progressStatus && params.progressStatus!="")  progressStatus=params.progressStatus.split(",")


    //console.log(">>>>>>>>",progressStatus)
 
    var offset=(page-1)*limit

   
    try {
      var user = await ORDERS.findAll({
      where :{companyId: req.companyId,
        progressStatus: { [Op.or]: progressStatus},

      },
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,
       
      include: [
        {model: ASSIGNMENT , attributes: ['id'], required:true, where:{empId:req.id,jobStatus :1} },
        {model: USERS , attributes: ['id','firstName','lastName','image','countryCode','phoneNumber'] } ,
        {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
        include: [{
          model: PRODUCTS,
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
          required: false
        }],
        required:true,
      },


       
    ],


      });
user=JSON.parse(JSON.stringify(user))

var currencySend=""
var currency =await commonMethods.getCurrency(req.companyId) 
if(currency && currency.dataValues && currency.dataValues.currency) currencySend=currency.dataValues.currency
else currencySend=CURRENCY    
  for(var t=0;t<user.length;t++)
      {
user[t].currency=currencySend
  var orderDate=new Date(user[t].createdAt)
var today=new Date()
var diffMins = diff_mins(today,orderDate); // milliseconds between now & Christmas

if( diffMins<30 && user[t].progressStatus<5)  user[t].cancellable=true 
else  user[t].cancellable=false


    //APPEND ADDRESS
    if(companyAddress && companyAddress.dataValues )      user[t].companyAddress=companyAddress
    else  user[t].companyAddress=""


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
        var orderData = await ORDERS.findOne({
        where :{id :orderId},      
        include: [
          {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
          {model: USERS , attributes: ['id','firstName','lastName','image','countryCode','phoneNumber'] } ,

          {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
        
          include: [{
            model: PRODUCTS,
            attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
            required: false
          }]},        
          {model: ASSIGNMENT , attributes: ['id','jobStatus'],
          where:{jobStatus :1},
          required: false,
          include: [{
            model: EMPLOYEE,
            attributes: ['id','firstName','lastName','countryCode','phoneNumber','image'],
            required: false
          }]
        
        
          
      } ,
        
        ]
  
        });
       if(orderData) 
       
       {
        orderData=JSON.parse(JSON.stringify(orderData))
        var currency =await commonMethods.getCurrency(req.companyId)
      if(currency && currency.dataValues && currency.dataValues.currency)
       orderData.currency=currency.dataValues.currency
    else orderData.currency=CURRENCY




        return responseHelper.post(res,appstrings.detail,orderData);
  
  
       }
        else return responseHelper.post(res,appstrings.no_record,null,204);
      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }
    });

  app.get('/feedbacklist',checkAuth,async (req, res) => {
   var params=req.body
    var page =1
    var limit =20
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit) 
    var offset=(page-1)*limit

   
    try {
      var user = await ASSIGNMENT.findAll({
        attributes: ['id','rating','review','createdAt'],
              where :{empId: req.id,
        rating:  {[Op.not]: '0'},

      },
      order: [
        ['createdAt', 'DESC']],
      offset: offset, limit: limit,
       
      include: [
        {model: ORDERS , attributes: ['id','serviceDateTime'],
        include: [{
          model: USER,
          attributes: ['id','firstName','lastName','image'],
          required: false
        }]
      },
  
    ],
      });

        if(user.length>0){
var data={}
data.ratings=user
var rating =0,count=0,orders=0
var dataRating=await commonMethods.getEmpAvgRating(req.id) 
var dataOrders=await commonMethods.getEmpOrders(req.id) 

if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) {
  rating=dataRating.dataValues.totalRating
  count=dataRating.dataValues.totalCountRating

}
if(dataOrders && dataOrders.dataValues && dataOrders.dataValues.totalOrders) {
  orders=dataOrders.dataValues.totalOrders

}

data.avgRating=rating
data.totalRating=count
data.totalOrders=orders
         return responseHelper.post(res,appstrings.detail,data);
        }
        else  return responseHelper.post(res,appstrings.no_record,null,204);
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });


  app.get('/getCancelReasons',checkAuth,async (req, res) => {
   
    try {
      var findData = await CANCELREASON.findAll({
      where :{companyId: req.parentCompany,
       status :1

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

  app.post('/submitCancel',checkAuth,async (req, res) => {
    var params=req.body

    try{
        let responseNull=  commonMethods.checkParameterMissing([params.orderId,params.reasonId])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       var userData = await ORDERS.findOne({
         where: {
           id: params.orderId }
       });
       
       
       if(userData)
       {
       

     
    const updatedResponse = await ASSIGNMENT.update({
         jobStatus: 2,
         cancellationReason: params.reasonId,
         otherReason: params.otherReason,

       },
       {
         where : {
         orderId: params.orderId,
         empId:req.id
       }
       });
       
       if(updatedResponse)
             {
              var reasonData=await CANCELREASON.findOne({id: params.reasonId})
              
                   var notifPushUserData={title:"Assignment for  order No.- "+userData.orderNo +' is Rejected by '+ req.userData.firstName+' on ' +commonMethods.formatAMPM(new Date),
                        description:"Assignment for  order No.- "+userData.orderNo +' is Rejected by '+ req.userData.firstName+' on  ' +commonMethods.formatAMPM(new Date) +', Reason :'+reasonData.reason +"   "+params.otherReason,
                            userId :req.companyId, role :2
                  }
                  
            commonNotification.insertNotification(notifPushUserData)   
               



           return responseHelper.post(res, appstrings.success,null);
             }
             else{
               return responseHelper.post(res, appstrings.oops_something,400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,null,204);

      }

         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
   
  });




app.get('/detail/:orderId',checkAuth,async (req, res) => {
  var orderId=req.params.orderId
  
  let responseNull=  commonMethods.checkParameterMissing([orderId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
    try {
      const orderData = await ORDERS.findOne({
      where :{id :orderId},      
      include: [
        {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
        include: [{
          model: PRODUCTS,
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
          required: false
        }]        
 
        
    } ,
      
      ]

      });
     if(orderData) 
     
     {
     
    
      return responseHelper.post(res,appstrings.detail,orderData);


     }
      else return responseHelper.post(res,appstrings.no_record,null,204);
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });



     function diff_mins(dt2, dt1) 
 {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff*60));
  
 }
     
module.exports = app;



//Edit User Profile
