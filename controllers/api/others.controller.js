const express = require('express');
const app = express();




app.get('/getFaq', checkAuth,async (req, res, next) => {
    try{
      var params=req.query
      var page =1
      var limit =50
      if(params.page) page=params.page
      if(params.limit) limit=parseInt(params.limit)
      var offset=(page-1)*limit
     
     
      //Get All Categories
      var findData=await FAQ.findAll({
        attributes:['id','question','answer','status','language'],
        where :{companyId :req.parentCompany},
        order: [
          ['createdAt','DESC']
        ],      
        offset: offset, 
        limit: limit,

        
      })

      if(findData.length>0) return responseHelper.post(res, appstrings.success,findData, 200);
      return responseHelper.post(res, appstrings.no_record,{}, 204);

 }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});


module.exports = app;