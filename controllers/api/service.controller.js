const express = require('express');
const app = express();
const db = require('../../db/db');
const config = require('config');
const Op = require('sequelize').Op;
const moment   = require('moment');
const _=require('underscore')
var sortBy = require('lodash.sortby');
// or
sortBy = require('lodash').sortBy;
//Relations
PRODUCTS.belongsTo(CATEGORY,{as: 'category',foreignKey: 'categoryId'})
PRODUCTS.hasOne(FAVOURITES,{foreignKey: 'serviceId'})
PRODUCTS.hasOne(CART,{foreignKey: 'serviceId'})
COMPANY.hasOne(DOCUMENT,{foreignKey: 'companyId'})
PRODUCTS.belongsTo(COMPANY,{foreignKey: 'companyId'})
PRODUCTS.hasMany(PRODUCTSPEC,{foreignKey: 'productId'})
COMPANY.hasMany(CATEGORY,{foreignKey: 'companyId'})
//COMPANY.hasMany(DOCUMENT,{foreignKey: 'companyId'})

//Home API with cats and trending and banners

app.get('/getParentcategories', checkAuth,async (req, res, next) => {
    try{

      //Get All Categories
      const servicesData = await CATEGORY.findAll({
        attributes: ['id','name', 'icon','thumbnail','colorCode'],
        where: {
          status: 1,
          parentId :'0'
               },
              
               
        order: [
          ['orderby','ASC']
        ],
      })

  

      //CART ITEMS CATEGORY
var cartCategoryType="",cartCategoryCompany=""
var cartData = await CART.findAll({where :{ userId : req.id},
include: [
  {model:PRODUCTS , attributes: ['categoryId']}
]});

for(var p=0;p<cartData.length;p++)
{
if(cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId!="")
{
var data=await CATEGORY.findOne({
  attributes: ['connectedCat','id','companyId'],
  where: {
    id: cartData[p].service.categoryId
  }});

  cartCategoryType=JSON.parse(JSON.stringify(data.dataValues.connectedCat).toString())
  cartCategoryCompany=data.dataValues.companyId

  break;

}

}



    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.parentCompany},
      order: [
        ['orderby','ASC']
      ], 
    })

   
    let userData = {}
    
    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType=cartCategoryType
    userData.cartCategoryCompany=cartCategoryCompany

    var currency =await commonMethods.getCurrency(req.companyId) 

    var links =await commonMethods.getLinks(req.parentCompany) 


    var termsLink="",aboutUsLink="",privacyLink=""
    if(links && links.dataValues) 
    { aboutUsLink=links.dataValues.aboutusLink
      privacyLink=links.dataValues.privacyLink
      termsLink=links.dataValues.termsLink

    }
   
      userData.aboutUsLink=aboutUsLink
      userData.privacyLink=privacyLink
      userData.termsLink=termsLink

    

    if(currency && currency.dataValues && currency.dataValues.currency) 
    userData.currency=currency.dataValues.currency
    else userData.currency=CURRENCY
        return responseHelper.post(res, appstrings.success,userData);

   //return responseHelper.post(res, appstrings.success,userData);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});



app.get('/getCompanies', checkAuth,async (req, res, next) => {
  try{
var category=req.query.categoryId
    //Get All Categories
    var findData = await COMPANY.findAll({
      attributes:['id','companyName','logo1','address1'],
      where: {
        status: 1,
      role :2
      },
      include:[{model: CATEGORY,attributes:['id','parentId'],required:true,where:{connectedCat: {
        [Op.like]: '%'+ category + '%'
      }, parentId :{[Op.not]:'0'}}}],
             
      order: [
        ['createdAt','ASC']
      ],
    })

    
    var cartCompanyId=""

    var cartData = await CART.findOne({where :{ userId : req.id},
    include: [
      {model:PRODUCTS , attributes: ['categoryId']}
    ]});
    
   if(cartData && cartData.dataValues) 
      cartCompanyId=cartData.dataValues.companyId


      findData=JSON.parse(JSON.stringify(findData))
for(var k=0;k<findData.length;k++)
{
  findData[k].cartCompanyId=cartCompanyId

}
   if(findData.length>0)
   return responseHelper.post(res, appstrings.success,findData);
  
   else    return responseHelper.post(res, appstrings.no_record,null,204);


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});



app.get('/getSubcat', checkAuth,async (req, res, next) => {

  const category=req.query.categoryId
  var include=[]

  let responseNull=  common.checkParameterMissing([category])
  if(responseNull) return responseHelper.error(res, appstrings.required_field, 400);
  
    try{
      var services = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail'],
        where: {
          parentId: category,
          status: 1,

        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
      })


   

      

      
if(services.length>0)
    return responseHelper.post(res, appstrings.success, services);
else    return responseHelper.post(res, appstrings.no_record, null);

    


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});

app.post('/getServices',checkAuth,async (req, res, next) => {
var params=req.body;
console.log(params)
  var include=[]
  var page =1
  var limit =20
  var categoryId=params.category
  var catArray=[categoryId]
  var orderby='createdAt'
  var orderType='DESC'

  
  if(params.page) page=params.page
  if(params.limit) limit=parseInt(params.limit)

  if(params.orderByInfo &&   params.orderByInfo.orderby && params.orderByInfo.orderby!='rating') {
      
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


if(params.search && params.serach!="")
{


  var services = await PRODUCTS.findAll({
    attributes: ['id','categoryId','name','brandName'],
    where: {status:1,
    name: {[Op.like]: '%'+ params.search + '%'},

    },
  })




if(services && services.length>0) 
catArray=services.map(item => item.categoryId)



else  return responseHelper.post(res, appstrings.no_record, null,204);


console.log(catArray)

}



  var recommendData=await RECOMMENDED.findOne({
    userId: req.id});
  if(recommendData)
  RECOMMENDED.update({
    categoryId: categoryId
   },{where:{userId:req.id}});  //console.log(">>>>>>>>",progressStatus)

  else
  RECOMMENDED.create({
    userId: req.id,
    categoryId: catArray[0]
   });  //console.log(">>>>>>>>",progressStatus)




  var offset=(page-1)*limit
 
   include=[ {
      model: CATEGORY,
      as: 'category',
      attributes: ['id','name','icon','thumbnail','minPriceRange','maxPriceRange'],
      required: true
    },
  
    {
      model: FAVOURITES,
      where: {
        'userId':  req.id
      },
      attributes:['id'],
      required: false,
                },
   {
    model: PRODUCTSPEC,
    attributes:['id','productImages','productColor','stockQunatity'],
    required: false,
 } 

  
  ]
  
    try{


      var catDta = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail'],
        where: {
          [Op.or]:{
          parentId: catArray[0],
          id:catArray[0]
        },
          
          status: 1

          
        },
        order: [
          ['orderby','ASC']
        ],
      })

      for(var p=0;p<catDta.length;p++)
      {
        catArray.push(catDta[p].id)
      }

      var where={categoryId:  {[Op.or]: catArray},   status: 1}
      if (params.catArray && params.catArray.length>0){
        
        if(typeof params.catArray=='string')
        where.categoryId=  {[Op.or]: [params.catArray]}
         else        where.categoryId=  {[Op.or]: params.catArray} 

     

      }
      if (params.brandArray && params.brandArray.length>0)  {
      
        if(typeof params.brandArray=='string')
         where.companyId=  {[Op.or]: [params.brandArray]}
          else where.companyId=  {[Op.or]: params.brandArray}
      
        
        }  
      if (params.priceRange && params.priceRange.start) where.price=  {[Op.between]: [params.priceRange.start,params.priceRange.end]}

if(params.search && params.search!="")
{
where.name= {[Op.like]: '%'+ params.search + '%'}


}
    


      var services = await PRODUCTS.findAll({
        attributes: ['id','name','description','icon','thumbnail','price','originalPrice','type','offer','createdAt','offerName','validUpto','brandName'],
        where: where,
        include: include,
        order: [
          [orderby,orderType]
        ],
        offset: offset, limit: limit,

      })


      var newDate = moment(new Date()).format("MM/DD/YYYY");
    



      var sales = await PRODUCTS.findAll({
        attributes: ['id','name','icon','price','originalPrice','thumbnail','offer','offerName','validUpto','brandName'],
        where: {
          categoryId:  {[Op.or]: catArray},   
                 status: 1,
                 validupto: {
                  [Op.gte]: newDate
                },
        },
        include: include,
        order: [
          ['offer','DESC']
        ],
        offset: 0, limit: 10,

      })



      services=JSON.parse(JSON.stringify(services))
for(var p=0;p<services.length;p++)
{
  var rating=0

   if(services[p].cart) services[p].cart=services[p].cart.id
   else services[p].cart=""

   if(services[p].favourite) services[p].favourite=services[p].favourite.id
   else services[p].favourite=''

   var dataRating=await commonMethods.getServiceAvgRating(services[p].id)

   if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
   rating=dataRating.dataValues.totalRating
   
   services[p].rating=rating
   //services[p].productSpecifications[0].stockQunatity= JSON.parse(JSON.stringify(services[p].productSpecifications[0].stockQunatity))



   if(services[p].offer >0 && (new Date(services[p].validUpto) < new Date()))
   {services[p].price=services[p].originalPrice
   services[p].offer=0}

}


if(params.orderByInfo && params.orderByInfo.orderby && params.orderByInfo.orderby=='rating') {
      
  //services = _.sortBy( services, 'rating' ,['DESC']);
  if(params.orderByInfo.orderType.toLowerCase()=='desc') services=sortBy( services, 'rating' ).reverse();
else services=sortBy( services, 'rating' )
}


  let dataSend={};


 



  dataSend.services=services
  dataSend.sales=sales

  var currency =await commonMethods.getCurrency(req.parentCompany) 
  var currencySend=CURRENCY 
if(currency && currency.dataValues && currency.dataValues.currency) currencySend=currency.dataValues.currency
  dataSend.currency=currencySend

 return responseHelper.post(res, appstrings.success, dataSend);
 
    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});
 
app.post('/getFilters',checkAuth,async (req, res, next) => {
  var params=req.body;
    var catArray=params.category
    var type=params.type
var maxPriceRange=0,minPriceRange=0
  
if(typeof catArray=='string')
catArray=[catArray]
   
      try{

   if(type=="search" && params.search && params.serach!="")
   {
   
   
     var services = await PRODUCTS.findAll({
       attributes: ['id','categoryId','name','brandName'],
       where: {status:1,
       name: {[Op.like]: '%'+ params.search + '%'},
   
       },
       include:{ model: CATEGORY,
        as: 'category',
        attributes: ['parentId']
        },
        group:['categoryId']
      })
    

     
   
  
   if(services && services.length>0) 
  { catArray=services.map(item => item.category.parentId)
    catArrayId=catArray.concat(services.map(item => item.categoryId))

  }
   }
   



   var newDate = moment(new Date()).format("MM/DD/YYYY");

  if(type=='sales')
  {
     services= await PRODUCTS.findAll({
      attributes: ['id','categoryId','name','brandName'],
      where: {status:1,
        validupto: {
          [Op.gte]: newDate
        },
        offer :{[Op.not]:""}
      },

      include:{ model: CATEGORY,
      as: 'category',
      attributes: ['parentId']
      },
      group:['categoryId']
    })
  
  

    services=JSON.parse(JSON.stringify(services))
   

  if(services && services.length>0) 
  {  catArray=services.map(item => item.category.parentId)
    catArrayId=services.map(item => item.categoryId)
  }

//   for(var p=0;p<catS.length;p++)
//   {

//    const catDaTA = await CATEGORY.findAll({
//      attributes: ['id','parentId'],
//      where: {
//        status: 1,
//        id: {[Op.like]: '%'+ catS[p] + '%'},                     },
 
//    })
   
//    catArray=catArray.concat((catDaTA.map(item => item.parentId)));
//    console.log("................",catArray)

//  }




}




if(type=="cat")
{

  catDta  = await CATEGORY.findAll({
    attributes: ['id','name','parentId','minPriceRAnge','maxPriceRange'],
    where: {
      [Op.or]:{
      id:{[Op.in]: catArray},
      parentId:{[Op.in]: catArray}},
       parentId:{[Op.not]: '0'}},
      status: 1,
      })
      
  catDta=JSON.parse(JSON.stringify(catDta))
  catArrayId=catDta.map(item => item.id);


if(catDta && catDta.length>0)
{
minPriceRange=finder(Math.max, catDta, "minPriceRAnge");
maxPriceRange=finder(Math.max, catDta, "maxPriceRange");
}




}
else{
         catDta  = await CATEGORY.findAll({
          attributes: ['id','name','parentId'],
          where: {
            id:{[Op.in]: catArray}},
            status: 1,
            })
            
            
          }  
          
  


        catDta=JSON.parse(JSON.stringify(catDta))

     
        //console.log(catDta)
        var dataCAt=[]

        
        for(var p=0;p<catDta.length;p++)
        {



          var where= {
            parentId: catDta[p].id,
           status: 1,
       
           }

           if(type!="cat")
           where.id={[Op.in]: catArrayId}

          var catDta1= await CATEGORY.findAll({
            attributes: ['id','name'],
            where:where,

            order: [
              ['orderby','ASC']
            ],
          })
 
          //const magenicIndex = catDta1.findIndex(vendor => (catArrayId.includes(vendor.id)));

         
          

          catDta[p].subArray=catDta1
          dataCAt.push(catDta[p].id)
          dataCAt=dataCAt.concat((catDta1.map(item => item.id)));

         
        }
  
          
    
        var services = await PRODUCTS.findAll({
          attributes: ['id','brandName'],
          where: {status:1 ,categoryId: {[Op.or]: dataCAt},
            brandName :{[Op.not]:''
          
          }},
          group:['brandName'],
          order: [
            ['brandName','ASC']
          ],  
        })
  
  
      
  
  

    var filters={};
    filters.categories=catDta
    filters.brands=services

    filters.pice={"min":minPriceRange,"max":maxPriceRange}

  

   return responseHelper.post(res, appstrings.success, filters);
   
      }
      catch (e) {
        return responseHelper.error(res, e.message, 400);
      }
  
  });


app.get('/getSuggested',checkAuth,async (req, res, next) => {
  var params=req.query;
  var search=params.search
  let responseNull=  commonMethods.checkParameterMissing([search])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  
  var services = await PRODUCTS.findAll({
    attributes: ['id','name','categoryId','brandName'],
    where: {status:1,name: {[Op.like]: '%'+search + '%'}, },
    include: {
      model: CATEGORY,
      as: 'category',
      attributes: ['id','name'],
      required: true
    }
  })
  
  
  
 return responseHelper.post(res, appstrings.success, services);
  
  
  
  
  });
   


app.post('/getSales',checkAuth,async (req, res, next) => {
  var params=req.body;
    var include=[]
    var page =1
    var limit =20
    
  var orderType='DESC'
  var orderby='createdAt'

    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit

    if(params.orderByInfo &&   params.orderByInfo.orderby && params.orderByInfo.orderby!='rating') {
      
      orderby=params.orderByInfo.orderby
      orderType=params.orderByInfo.orderType
  
    }
  
   
     include=[ {
        model: CATEGORY,
        as: 'category',
        attributes: ['id','name','icon','thumbnail','minPriceRange','maxPriceRange'],
        required: true
      },
    
      {
        model: FAVOURITES,
        where: {
          'userId':  req.id
        },
        attributes:['id'],
        required: false,
                  },
     {
      model: PRODUCTSPEC,
      attributes:['id','productImages','productColor','stockQunatity'],
      required: false,
   } 
  
    
    ]
    
      try{
  
  
        var newDate = moment(new Date()).format("MM/DD/YYYY");
        var where={ status: 1,  validupto: {
          [Op.gte]: newDate
        }}
        if (params.catArray && params.catArray.length>0){
          var catArray=[]

          if(typeof params.catArray=='string')
         catS=   [params.catArray]
           else       catS=   params.catArray
  
for(var p=0;p<catS.length;p++)
           {

            const catDaTA = await CATEGORY.findAll({
              attributes: ['id'],
              where: {
                status: 1,
                connectedCat: {[Op.like]: '%'+ catS[p] + '%'},                     },
          
            })
            
            catArray=catArray.concat((catDaTA.map(item => item.id)));
            //console.log("................",catArray)

          }
           // console.log(">>>>>>>>>>",catArray)
            where.categoryId=  {[Op.or]: catArray} 

           }
  
        
        if (params.brandArray && params.brandArray.length>0)  {
        
          if(typeof params.brandArray=='string')
           where.companyId=  {[Op.or]: [params.brandArray]}
            else where.companyId=  {[Op.or]: params.brandArray}
        
          
          }   if (params.priceRange && params.priceRange.start) where.price=  {[Op.between]: [params.priceRange.start,params.priceRange.end]}
  
  


        var services = await PRODUCTS.findAll({
          attributes: ['id','name','icon','thumbnail','offer','offerName','validUpto','originalPrice','price','createdAt','brandName'],
          where: where,                
          include: include,
          order: [
            [orderby,orderType]
          ],
          offset: offset, limit: limit,
  
        })
  
  
  
        services=JSON.parse(JSON.stringify(services))
  for(var p=0;p<services.length;p++)
  {
    var rating=0
  
  
     if(services[p].favourite) services[p].favourite=services[p].favourite.id
     else services[p].favourite=''
  
     var dataRating=await commonMethods.getServiceAvgRating(services[p].id)
     if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
     rating=dataRating.dataValues.totalRating
     
     services[p].rating=rating
  

     if(services[p].offer >0 && (new Date(services[p].validUpto) < new Date()))
     {services[p].price=services[p].originalPrice
     services[p].offer=0}
  
  }
  

  if(params.orderByInfo && params.orderByInfo.orderby && params.orderByInfo.orderby=='rating') {
      
    //services = _.sortBy( services, 'rating' ,['DESC']);
    if(params.orderByInfo.orderType.toLowerCase()=='desc') services=sortBy( services, 'rating' ).reverse();
  else services=sortBy( services, 'rating' )
  }
  
  var currency =await commonMethods.getCurrency(req.parentCompany) 

var currencySend=CURRENCY 
if(currency && currency.dataValues && currency.dataValues.currency) currencySend=currency.dataValues.currency
  
var data={}
data.services=services
data.currency=currencySend

  

const catDaTA = await CATEGORY.findAll({
  attributes: ['id','name'],
  where: {
    status: 1,
    parentId :'0'
         },
        
         
  order: [
    ['orderby','ASC']
  ],
})





var filters={};
filters.categories=catDaTA
data.filters=filters


  
   return responseHelper.post(res, appstrings.success, data);
  
 

      }
      catch (e) {
        return responseHelper.error(res, e.message, 400);
      }
  
  });
   


// function getRange(data)
// {

//   var array=[];

//   for()

// }


app.post('/checkAvailability',checkAuth,async (req, res) => {
var params=req.body;

var data1={}
var estimatDelivery=""
var shipmentCharges="0"

let responseNull=  commonMethods.checkParameterMissing([params.zipCode,params.companyId,params.country])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
try{



var latLongRes=await commonMethods.getLatLngByZipcode(params.zipCode,params.country)
//console.log(latLongRes)

if(latLongRes && latLongRes.length>0)
{

var companyData=await commonMethods.getParentCompany(params.companyId)

//console.log(">>>>>>>",companyData)
  if(companyData && companyData.address1LatLong)
  {
    var companyAdd=JSON.parse(companyData.address1LatLong)
    var lat1=companyAdd.lat
    var long1=companyAdd.long
    var lat2=latLongRes[0].latitude
    var long2=latLongRes[0].longitude

var distance=await commonMethods.distance(lat1,long1,lat2,long2,"K")
console.log(distance)

var data=  await getEstimation(distance,params.companyId)
data=data.toString().split("#")
estimatDelivery=data[0]
shipmentCharges=data[1]

  }
}

data1.estimatedDelivery=estimatDelivery
data1.shipment=shipmentCharges

return responseHelper.post(res,appstrings.success,data1);


}


  

    
    catch (e) {
      return responseHelper.error(res, e.message, 400);

    }

}),

app.get('/getHome',checkAuth,async (req, res, next) => {
  var params=req.query;
  
   
   
    
    
      try{
  
        include=[ 
      
        {
          model: FAVOURITES,
          where: {
            'userId':  req.id
          },
          attributes:['id'],
          required: false,
                    },
       {
        model: PRODUCTSPEC,
        attributes:['id','productImages','productColor','stockQunatity'],
        required: false,
     } 
    
      
      ]




        var catDta = await CATEGORY.findAll({
          attributes: ['id','name','description','icon','thumbnail'],
          where: {
            parentId: 0,
            status: 1
          },
          order: [
            ['name','ASC']
          ],
        })
  
        var newDate = moment(new Date()).format("MM/DD/YYYY");

  
        var services = await PRODUCTS.findAll({
          attributes: ['id','name','icon','thumbnail','price','validUpto','originalPrice','offer','offerName','brandName'],
          where: {
                   status: 1,
                   validupto: {
                    [Op.gte]: newDate
                  },
          },
          include:include,

          order: [
            ['offer','DESC']
          ],
          offset: 0, limit: 15,
  
        })
  
  
  
        services=JSON.parse(JSON.stringify(services))
  for(var p=0;p<services.length;p++)
  {
    var rating=0
  
     if(services[p].cart) services[p].cart=services[p].cart.id
     else services[p].cart=""
  
     if(services[p].favourite) services[p].favourite=services[p].favourite.id
     else services[p].favourite=''
  
     var dataRating=await commonMethods.getServiceAvgRating(services[p].id)
  
     if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
     rating=dataRating.dataValues.totalRating
     
     services[p].rating=rating
  
  
  
     if(new Date(services[p].validUpto) < new Date())
     {services[p].price=services[p].originalPrice
     services[p].offer=0}
  
  }
  
    let dataSend={};
  
  
  
    var recommended=null
    var recommendData=await RECOMMENDED.findOne({
      userId: req.id});
      if(recommendData && recommendData.dataValues)
      {recommended=await getTrending(recommendData.dataValues.categoryId)
        console.log(">>>>>>>>>>>>>>>>>>>>>>",recommended.length)
if(recommended && recommended.length==0)
recommended=await getTrending("")

      }
      else recommended=await getTrending("")

    dataSend.recommended=recommended
    dataSend.sales=services
    dataSend.categories=catDta

    var currency =await commonMethods.getCurrency(req.parentCompany) 
    var currencySend=CURRENCY 
  if(currency && currency.dataValues && currency.dataValues.currency) currencySend=currency.dataValues.currency
  dataSend.currency=currencySend



   return responseHelper.post(res, appstrings.success, dataSend);
   
  
  
      }
      catch (e) {
        return responseHelper.error(res, e.message, 400);
      }
  
  });
async function getTrending(CAT)
{


  try{
    var where={}

    if(CAT && CAT!="")
    {
      where={
        [Op.or]:{
          connectedCat: {[Op.like]: '%'+ CAT + '%'},
           id: {[Op.like]: '%'+ CAT + '%'}
        }
      }
  }  
  var countDataq = await SUBORDERS.findAll({
    attributes: ["id","serviceId",[sequelize.fn("COUNT", sequelize.col("serviceId")), "count"]] , 
    group: ['serviceId'],
    order: [[sequelize.literal('count'), 'DESC']],
    offset: 0, limit: 20,  
});
var services=[];

var serviceArray=[]
for(var k=0;k<countDataq.length;k++)
    {
      serviceArray.push(countDataq[k].serviceId)
    }



     services = await PRODUCTS.findAll({
      attributes: ['id','name','description','icon','thumbnail','categoryId','offer','price','originalPrice','offerName','brandName'],
      where: {
        id:  {[Op.or]: serviceArray},
        status: 1
      },
              include: [ {
              model: CATEGORY,
              as: 'category',
              attributes: ['name','id'],
              required: true,
        
                where: where,             
             
          
            }],
    })


    services=JSON.parse(JSON.stringify(services))
    for(var p=0;p<services.length;p++)
    {
      var rating=0
    var dataRating=await commonMethods.getServiceAvgRating(services[p].id)
    
    if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
       rating=dataRating.dataValues.totalRating
        
       services[p].rating=rating

    
    
      }
    
    
  
    if(services)  return services;
else  return null

  }

  catch(e)
  {
console.log(e)
    callback(e.message, null);

  }



}


 async function getfiltersData(category)
{

  var fdata={}
  try{
  
    var findData = await PRODUCTS.findAll({
      attributes:['id','brandName'],
      where: {
      status: 1,
      brandName :{[Op.not]:''}
      },
      include:[{model: CATEGORY,
        as: 'category',
        attributes:['id'],required:true,where:{connectedCat: {
        [Op.like]: '%'+ category + '%'
      }, parentId :{[Op.not]:'0'}}}],
         
      group: ['brandName'],
      order: [
        ['brandName','ASC']
      ],
    })





return findData;
  }

  catch(e)
  {
console.log(e)
   // callback(e.message, null);

  }



}


app.get('/detail', checkAuth,async (req, res, next) => {
  var params=req.query
var id =params.serviceId
let responseNull=  commonMethods.checkParameterMissing([id])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    try{
      var services = await PRODUCTS.findOne({
        attributes: ['id','name','description','price','icon','thumbnail','type','originalPrice','offer','companyId','categoryId','offerName','brandName'],
        where: {
          id: id,
          status: 1
        },

        include :[{
          model: FAVOURITES,
          where: {
            'userId':  req.id,
    
          },
          attributes:['id'],
          required: false,
                    },

                    {
                      model: PRODUCTSPEC,
                      attributes:['id','productImages','productColor','stockQunatity'],
                      required: false,
                   } ,

                   {
                    model: COMPANY,
                    attributes:['id','companyName','logo1','address1LatLong'],
                     include:[{model:DOCUMENT ,attributes:['aboutus']}]
                 } ,

    
       {
          model: CART,
          attributes: ['id','serviceId','color','size','quantity','addressId'],
          required: false,
       } ,
       {
        model: CATEGORY,
        as: 'category',
        attributes: ['id','name','icon','thumbnail'],
        required: true
      },
      
      
      
      
      ],

        order: [
          ['orderby','ASC']
        ],
      })
      if(services) 
      {

      services=JSON.parse(JSON.stringify(services))
    
       
      
       var rating=0,count=0
       var dataRating=await commonMethods.getServiceAvgRating(id)
       
       if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
          {rating=dataRating.dataValues.totalRating
           count=dataRating.dataValues.totalCount
          }
          services.rating=rating
          services.ratingCount=count
   
       
       
         



        if(services.favourite) services.favourite=services.favourite.id
        else services.favourite=''

        var currency =await commonMethods.getCurrency(req.parentCompany) 
        var currencySend=CURRENCY 
      if(currency && currency.dataValues && currency.dataValues.currency) currencySend=currency.dataValues.currency
      services.currency=currencySend



      var recommended=await getTrending(services.categoryId)
      services.recommended=recommended

      var ratings=await RATINGS.findOne({
        attributes: ['rating','review','reviewImages','createdAt'],
        include: [
          {
          model: USERS,
          attributes: ['id','firstName','lastName','image'],
          required: true
          }],
      where: {
        serviceId:  params.serviceId,rating:{[Op.not]:'0'}},
    
      order:[['createdAt','DESC']],
      }
      
      
      )
      

      //console.log(ratings)
      services.recommended=recommended
      services.ratings=ratings






        // services['category']=null
      
        var estimatDelivery=""
        var shipmentCharges="0"


if(params.addressId && params.addressId!="")
{
  var addressDetail =await ADDRESS.findOne({where:{id:params.addressId}}) 

if(services.company && services.company.address1LatLong && addressDetail)
      {
        var companyAdd=JSON.parse(services.company.address1LatLong)
        var lat1=companyAdd.lat
        var long1=companyAdd.long
        var lat2=addressDetail.dataValues.latitude
        var long2=addressDetail.dataValues.longitude

var distance=await commonMethods.distance(lat1,long1,lat2,long2,"K")


var data=  await getEstimation(distance,services.companyId)
data=data.toString().split("#")
estimatDelivery=data[0]
shipmentCharges=data[1]

      }
    }

services.estimatDelivery=estimatDelivery
services.shipment=shipmentCharges

    return responseHelper.post(res, appstrings.success, services);

      }
     else return responseHelper.post(res,appstrings.no_record,null,204);

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


async function getEstimation(distance,companyId)
{

  var shipment =await SHIPMENT.findOne({where:{companyId:companyId}}) 

  //console.log(shipment)
reeUfreeUptoDistancepto=10
extraDistanceCharges=10
estimateDayPerKM=10
estimateDay=1
var estimatDelivery=""
var shipmentCharges="0"
if(shipment && shipment.dataValues)
{
freeUptoDistance=shipment.dataValues.freeUptoDistance
 extraDistanceCharges=shipment.dataValues.extraDistanceCharges
 estimateDayPerKM=shipment.dataValues.estimateDayPerKM
 estimateDay=shipment.dataValues.estimateDay

var dd=parseInt((distance/estimateDayPerKM)*estimateDay)
if(dd>2)
estimatDelivery=dd-1+"-"+dd
else 
estimatDelivery="1-2"


if(distance>freeUptoDistance)
{
var dd=(distance-freeUptoDistance)
//console.log(dd,extraDistanceCharges)
shipmentCharges=(dd*extraDistanceCharges).toFixed(2)
}

}
return estimatDelivery+"#"+shipmentCharges
}


function finder(cmp, arr, attr) {
    var val = arr[0][attr];
    for(var i=1;i<arr.length;i++) {
        val = cmp(val, arr[i][attr])
    }
    return val;
}
module.exports = app;