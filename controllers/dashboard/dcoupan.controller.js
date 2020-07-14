
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;


COUPAN.belongsTo(CATEGORY,{as: 'category',foreignKey: 'categoryId'})



app.get('/',adminAuth, async (req, res, next) => {
    
  try{
   
    //var newDate = moment(new Date()).format("MM/DD/YYYY");
    const findData = await COUPAN.findAll({
      where: {
        companyId: req.companyId,
        
      },
      include:[ {
        model: CATEGORY,
        as: 'category',
        attributes: ['name','icon','thumbnail'],
        required: false
      }]
    });
    
   
        return res.render('admin/coupans/coupanListing.ejs',{data:findData});

      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllCategories(req.companyId)
    var types=await commonMethods.getUserTypes(req.companyId) 

    return res.render('admin/coupans/addCoupan.ejs',{catData:cdata,types:types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await COUPAN.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await COUPAN.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, appstrings.success,updatedResponse);
             }
             else{
               return responseHelper.post(res, 'Something went Wrong',null,400);
    
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


app.post('/add',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.minimumAmount,data.name,data.code,data.discount,data.type,data.validupto])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await COUPAN.findOne({
      attributes: ['id'],

      where: {
        code: data.code,
      }
    });



    if (!user) {
    



      const users = await COUPAN.create({
        name: data.name,
        type: data.type,
        usageLimit: data.usageLimit,
        code: data.code,
        discount: data.discount,
        icon: icon,
        validupto:data.validupto,
        thumbnail: thumbnail,
        description:data.description,
        companyId: req.companyId,
        mcategoryId:data.McategoryId,
        categoryId:data.categoryId,
        minimumAmount:data.minimumAmount

       });


      if (users) {

        responseHelper.post(res, appstrings.add_coupan, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/update',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.minimumAmount,data.validupto, data.coupanId,data.name,data.code,data.discount,data.type])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
      });

    }
    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await COUPAN.findOne({
      attributes: ['id'],

      where: {
        id: data.coupanId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await COUPAN.update({
        name: data.name,
        type: data.type,
        code: data.code,
        discount: data.discount,
        icon: icon,
        usageLimit: data.usageLimit,
        thumbnail: thumbnail,
        description:data.description,
        companyId: req.companyId,
        validupto:data.validupto,
        minimumAmount:data.minimumAmount,
        categoryId:data.categoryId,
        mcategoryId:data.McategoryId



       },
       {where:{

        id: data.coupanId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
   // console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})









app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"coupans");
}


   
      const findData = await COUPAN.findOne({
      where :{companyId :req.companyId, id: id }
      });
      console.log(findData)
      var cdata= await commonMethods.getAllCategories(req.companyId)
      var types=await commonMethods.getUserTypes(req.companyId) 
      var subCategoryList = await CATEGORY.findAll({
         attributes: ['id','name','description','icon','thumbnail','createdAt','status','parentId','level'],
         where: {
          parentId: findData.dataValues.mcategoryId,
        companyId :req.companyId
         }
        
      }) 
      return res.render('admin/coupans/viewCoupan.ejs',{data:findData,catData:cdata,types:types,subCategoryList});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"coupans");
    }


 
});



app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { return responseHelper.noData(res, appstrings.required_field);
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await COUPAN.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           return responseHelper.post(res, appstrings.delete_success, null,200);

          }

          else {
             return responseHelper.noData(res, appstrings.no_record);
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
           return responseHelper.noData(res, appstrings.no_record);
        }
});




module.exports = app;

//Edit User Profile
