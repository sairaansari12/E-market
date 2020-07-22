const express = require('express');
 const router = express.Router();
 const CATEGORY = db.models.categories
 const Op = require('sequelize').Op;

 var methods={
     
checkParameterMissing :   function(params)
{

for(var k=0;k<params.length;k++)
{

if(params[k]==undefined || params[k]=="")

{
 return true
 break;
}

if(k==params.lenth-1)
return false

}

},

 

getAllParentCategories: function (companyId)
{

  const catData =  CATEGORY.findAll({
    attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
    where: {
      parentId :'0',
      id:  {[Op.not]: '0'},
  
           },
          
    order: [
      ['orderby','ASC']
    ],
  });
  return catData;
},


getBusinessType: function (companyId)
{

  const catData =  BUSINESSTYPE.findOne({
    attributes: ['id','type','businessName'],
    where: {companyId:  companyId}
        
  });
  return catData;
},



getParentCompany: function (companyId)
{

  const catData =  COMPANY.findOne({
    where: {id:  companyId}
        
  });
  return catData;
},



getLinks: function (companyId)
{

  const catData =  DOCUMENT.findOne({
    where: {companyId:  companyId}
        
  });
  return catData;
},

getAllCompanies: function (companyId)
{

  const catData =  COMPANY.findAll({
    attributes: ['id','companyName'],
    where: {
      status :1,
      parentId:  companyId
           },
          
    order: [
      ['companyName','ASC']
    ],
  });
  return catData;
},

getAllCategories: function (companyId)
{

  const catData =  CATEGORY.findAll({
    attributes: ['id','name','description','icon','thumbnail','createdAt','status'],
    where: {
      companyId: companyId,
      level :'1',
      id:  {[Op.not]: '0'},
  
           },
          
    order: [
      ['orderby','ASC']
    ],
  });
  return catData;
},


getServiceAvgRating :function(serviceId)
{
  const ratData =  RATINGS.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
    [sequelize.fn('count', sequelize.col('rating')), 'totalCount']
  ],
  where: {
    serviceId:  serviceId}
  })
  
  return ratData

},

getUserTypes :function(companyId)
{
  const data =  USERTYPE.findAll({
  where: {
    companyId:  companyId,status:1}
  })
  
  return data

},

getRoleTypes :function(companyId)
{
  const data =  ROLETYPE.findAll({
  where: {
    companyId:  companyId,status:1}
  })
  
  return data

},


 getRating:function(rating)
{
    var avgRating=""
    for(var k=0;k<5;k++)
{
if(rating-k>1)
avgRating=  avgRating+'<i class="glyph-icon icon-star font-yellow "></i>'

else{ if (rating-k>0) avgRating=  avgRating+'<i class="glyph-icon icon-star-half-full font-yellow "></i>'
else  avgRating=  avgRating+'<i class="glyph-icon icon-star font-gray "></i>'
}


}
return avgRating;

},
getEmpAvgRating :function(empId)
{
  const ratData =  ASSIGNMENT.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating'],
    [sequelize.fn('count', sequelize.col('rating')), 'totalCountRating'],
  ],
  where: {
    empId:  empId,rating:{[Op.not]:'0'}
  }
  })
  
  return ratData

},

getEmpOrders :function(empId)
{
  const ratData =  ASSIGNMENT.findOne({
    attributes: [
    [sequelize.fn('count', sequelize.col('orderId')), 'totalOrders'],
  ],
  where: {
    empId:  empId}
  
  })
  
  return ratData

},

getCompAvgRating :function(companyId)
{
  const ratData =  COMPANYRATING.findOne({
    attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating']],
  where: {
    companyId:  companyId,rating:{[Op.not]:'0'}}
  })
  
  return ratData

},

getCurrency: function(companyId)
{
  
    const currency =    DOCUMENT.findOne({attributes:['currency'],where :{companyId : companyId}})
    if(currency && currency.dataValues && currency.dataValues.currency) CURRENCY=currency.dataValues.currency
    return currency
  
},
 format:function (date) {

    var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    return '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
},

formatYYMMDD:function (date) {

    var d = date.getDate();
    var m = date.getMonth()+1;
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
},


formatAMPM:function (date) {

  var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var d = date.getDate();
  var m = strArray[date.getMonth()];
  var y = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y +" "+strTime;
},

getOrderStatus :function(input)
{
  var status="Not Confirmed"
  if(input=="1") status="Confirmed"
  if(input=="2") status="Cancelled"
  if(input=="3") status="Processing"
  if(input=="4") status="Cancelled by Comapny"
  if(input=="5") status="Completed"
  return status;
},
short:function (data,length) {

    var returnString=""
    if(data!="" && data.length>length)
    {
        returnString=data.substring(data,length)+"...."

    }
    else{
        returnString=data
 
    }

    return returnString
},


 convertTime12to24 :function (time12h) {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
},



distance:function (lat1, lon1, lat2, lon2, unit) {

  console.log(">>>>>>>>>>>>>>>>>>>>",lat1,lon1,lat2,lon2)
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
}
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
},




  getLatLngByZipcode: async function(zipcode,country) 
{
  const NodeGeocoder = require('node-geocoder');

  const options = {
    provider: 'google',
   
    // Optional depending on the providers
    apiKey: config.GOOGLEKEY, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
  };
   
  const geocoder = NodeGeocoder(options);
  const res = await geocoder.geocode({
    zipcode: zipcode,
    address: ' ',
    country: country,
  });
   

  
  return res
}
 }


 module.exports=methods