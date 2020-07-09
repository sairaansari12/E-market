
const express = require('express');
const app = express();
const Op = require('sequelize').Op;

//Relations
CART.belongsTo(PRODUCTS,{foreignKey: 'serviceId'})




app.post('/add',checkAuth,async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.companyId,params.serviceId,params.orderPrice,params.quantity,params.orderTotalPrice,params.addressId,params.estimateDelivery])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const oderData = await CART.findOne({
		where: {
      serviceId: params.serviceId,
      userId: req.id,
      addressId: params.addressId,

      
		}
	  })  
      
    if(oderData)
    {
      var newQuantity=parseInt(oderData.dataValues.quantity)+parseInt(params.quantity)
      var norderPrice=parseInt(oderData.dataValues.orderPrice)+parseInt(params.orderPrice)
      var norderTotalPrice=parseInt(oderData.dataValues.orderTotalPrice)+parseInt(params.orderTotalPrice)

CART.update({quantity:newQuantity,
  orderPrice:norderPrice,
  orderTotalPrice:norderTotalPrice
},{where:{id:oderData.dataValues.id}})

      return responseHelper.post(res, appstrings.cart_success, oderData);

    }

   
   

else{

var orderPrice=params.orderPrice


// Write APPLY PROMO CODE HERE//




    const orderData = await CART.create({
	
      serviceId: params.serviceId,
      orderPrice :orderPrice,
      orderTotalPrice :params.orderTotalPrice,
      quantity :params.quantity,
      userId: req.id,
      serviceCharges:params.serviceCharges,
      estimateDelivery:params.estimateDelivery,
      addressId:params.addressId,
      size:params.size,
      color:params.color,
      companyId: params.companyId,
		
      })  
      
      if(orderData) 

      return responseHelper.post(res, appstrings.cart_success, orderData);

      else return responseHelper.post(res, appstrings.oops_something, null,400);

}


 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})

app.put('/update',checkAuth,async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.companyId,params.cartId,params.serviceId,params.orderPrice,params.quantity,params.orderTotalPrice,params.addressId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const cartData = await CART.findOne({
		where: {
      id: params.cartId,
      userId: req.id,
      
		}
	  })  
      
    if(cartData)
  {



// Write APPLY PROMO CODE HERE//




    const orderData = await CART.update(
      
      {
      serviceId: params.serviceId,
      orderPrice :params.orderPrice,
      orderTotalPrice :params.orderTotalPrice,
      quantity :params.quantity,
      userId: req.id,
      size:params.size,
      serviceCharges:params.serviceCharges,
      addressId:params.addressId,
      color:params.color,
      companyId: params.companyId,
		
      },
     { where: {id:params.cartId}
      
    }
      )  
      
      if(orderData) 

      return responseHelper.post(res, appstrings.cart_update_success, null);

      else return responseHelper.post(res, appstrings.oops_something, null,400);

}

 
else return responseHelper.post(res, appstrings.no_record, null,204);

 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})

app.get('/list',checkAuth,async (req, res) => {
   
    try {
      var orderData = await CART.findAll({
      
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :{userId : req.id
       
      },
      
      include: [
        {model: PRODUCTS , 
          attributes: ['id','name','description','icon','thumbnail','offer','offerName','createdAt','status','price','originalPrice','brandName'],
          include:[{
            model: PRODUCTSPEC,
            attributes:['id','productImages','productColor','stockQunatity'],
            required: false,
         },
         {
          model: FAVOURITES,
          where: {
            'userId':  req.id
          },
          attributes:['id'],
          required: false,
                    },
        
        
        
        ] 
        }
      ]
      

      });

      if(orderData) 
     {

      var countDataq = await CART.findOne({
        attributes: ['id','promoCode','userId',
          [sequelize.fn('sum', sequelize.col('orderPrice')), 'torderPrice'],
          [sequelize.fn('sum', sequelize.col('orderTotalPrice')), 'totalSum'],
          [sequelize.fn('sum', sequelize.col('quantity')), 'totalQunatity'],
        ],
       
      where :{ userId : req.id
       
      }
});


var serviceCharges = await CART.findAll({
  attributes: ['id','serviceCharges',
    [sequelize.fn('sum', sequelize.col('serviceCharges')), 'toalCharges'],
  ],
 
group:['companyId','addressId'],
where :{ userId : req.id

}
});



 orderData=JSON.parse(JSON.stringify(orderData))
 countDataq=JSON.parse(JSON.stringify(countDataq))

 const coupanDetails = await COUPAN.findOne({
  attributes: ['id','code','discount'],
   where: {
     code: countDataq.promoCode
   }
 });


 var serviceCharges=0;servId=[],addressId=[];
for(var p=0;p<orderData.length;p++)
{
if((!servId.includes(orderData[p].serviceId)) && !addressId.includes(orderData[p].addressId)) 
{
  serviceCharges=serviceCharges+orderData[p].serviceCharges;
  servId.push(orderData[p].serviceId);
  addressId.push(orderData[p].addressId);

}

}


//console.log(serviceCharges)

 var data={}


 if(coupanDetails)
 {
 let price = parseFloat(countDataq.totalSum);
 let per   = parseFloat(coupanDetails.dataValues.discount);
 let discount_price = (price/100)*per;        // Get Percentage Amount
 let payableAmount  = price - discount_price;  //Payable Amount
 data['discount']=discount_price
 data['payableAmount']=payableAmount
 }
 data['torderPrice']=countDataq.torderPrice
data['sum']=countDataq.totalSum
data['serviceCharges']=serviceCharges
data['totalQunatity']=countDataq.totalQunatity
data['data']=orderData

    


if(orderData.length>0)
    return responseHelper.post(res,appstrings.detail,data);
    else
    return responseHelper.post(res,appstrings.detail,data,204);


     }

     
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });


app.get('/detail/:cartId',checkAuth,async (req, res) => {
  var cartId=req.params.cartId
  
  let responseNull=  commonMethods.checkParameterMissing([cartId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
    try {
      const orderData = await CART.findOne({
      where :{id :cartId},      
      include: [
        {model: PRODUCTS ,
           attributes: ['id','name','description','icon','thumbnail','price','originalPrice','offer','offerName','createdAt','status'],
           include:[{
            model: PRODUCTSPEC,
            attributes:['id','productImages','productColor','stockQunatity'],
            required: false,
         }] 


      }
      
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



  app.delete('/remove',checkAuth,async(req,res, next) => {
    const params = req.query;
    
    let responseNull=  common.checkParameterMissing([params.cartId])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
    try{
      const orderData = await CART.findOne({
      where: {
        id: params.cartId,
        userId: req.id
        
      }
      })  
        
      if(orderData)
     {

const numAffectedRows = await CART.destroy({
    where: {
      id: params.cartId
  
    }
    })  
      
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.cart_delete_success,null);
   
  }
  else
  return responseHelper.post(res, appstrings.no_record,null, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      
     });



     app.delete('/clear',checkAuth,async(req,res, next) => {
      

      try{
      
  const numAffectedRows = await CART.destroy({
      where: {
        userId: req.id
      }
      })  
        
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.cart_delete_success,null);
    
    else
    return responseHelper.post(res, appstrings.no_record,null, 204);
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
        
       });
module.exports = app;



//Edit User Profile
