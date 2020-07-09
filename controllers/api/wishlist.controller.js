
const express = require('express');
const app = express();
const Op = require('sequelize').Op;

//Relations
WISHLIST.belongsTo(PRODUCTS,{foreignKey: 'serviceId'})




app.post('/add',checkAuth,async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.companyId,params.serviceId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const favData = await WISHLIST.findOne({
		where: {
      serviceId: params.serviceId,
      userId: req.id,
      companyId: params.companyId,
      
		}
	  })  
      
    if(favData)
    return responseHelper.post(res, appstrings.already_exists, null, 400);

   

else{


    const createResponse = await WISHLIST.create({

      serviceId: params.serviceId,
      userId: req.id,
      companyId: params.companyId,
	
      })  
      
      if(createResponse) 

      return responseHelper.post(res, appstrings.wish_success, createResponse);

      else return responseHelper.post(res, appstrings.oops_something, null,400);

}


 }
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})

app.get('/list',checkAuth,async (req, res) => {
   
  var params=req.query;

  whereSearch={}
  if(params.search && params.search!="")
  whereSearch.name={[Op.like]: '%'+ params.search + '%'}



    try {
      var findData = await WISHLIST.findAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :{userId : req.id
       
      },
      
      include: [
        {model: PRODUCTS , attributes: ['id','name','description','price','originalPrice','icon','thumbnail','price','offerName','offer','createdAt','status','brandName'],
      where:whereSearch,
        include:[ {
          model: CATEGORY,
          as: 'category',
          attributes: ['id','name','companyId'],
          required: true
        },
        {
          model: PRODUCTSPEC,
          attributes:['id','productImages','productColor','stockQunatity'],
          required: false,
       } 
      ]
      }
      
       
      ]

      });



    
      
      


      if(findData) 
      {
        findData=JSON.parse(JSON.stringify(findData))
for(var k=0;k<findData.length;k++)
        {
          var rating=0
var dataRating=await commonMethods.getServiceAvgRating(findData[k].serviceId)
if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
rating=dataRating.dataValues.totalRating
   
//findData[k].service.rating=rating
//findData[k].cartCategoryType=cartCategoryType
//findData[k].cartCategoryCompany=cartCategoryCompany
findData[k].rating=rating


        }
      }
     
    return responseHelper.post(res,appstrings.detail,findData);


     
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
  });

app.delete('/remove',checkAuth,async(req,res, next) => {
    const params = req.query;
    
    let responseNull=  common.checkParameterMissing([params.wishId])
    if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
    try{
      const findData = await WISHLIST.findOne({
      where: {
        id: params.wishId,
        userId: req.id
        
      }
      })  
        
      if(findData)
     {

const numAffectedRows = await WISHLIST.destroy({
    where: {
      id: params.wishId
  
    }
    })  
      
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.wish_delete_success,null);
   
  }
  else
  return responseHelper.error(res, appstrings.no_record, 404);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      
     });


     app.delete('/clearAll',checkAuth,async(req,res, next) => {
      

      try{
      
  const numAffectedRows = await WISHLIST.destroy({
      where: {
        userId: req.id
      }
      })  
        
    if(numAffectedRows>0)
    return responseHelper.post(res, appstrings.wish_delete_success,null);
    
    else
    return responseHelper.post(res, appstrings.no_record,null, 204);
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
        
       });



module.exports = app;



//Edit User Profile
