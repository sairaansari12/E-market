
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const CATEGORY = db.models.categories
const FAVOURITES = db.models.favourites



// app.get('/',adminAuth, async (req, res, next) => {
    
//     try {
//       const servicesData = await CATEGORY.findAll({
//         attributes: ['id','name','description','icon','thumbnail','createdAt','status','colorCode'],
//         where: {
//           companyId: req.companyId,
//           parentId :'0',
//           id:  {[Op.not]: '0'},
      
//                },
              
//         order: [
//           ['orderby','ASC']
//         ],
//       });
     


//         return res.render('admin/category/categoriesListing.ejs',{data:servicesData});



//       } catch (e) {
//         return responseHelper.error(res, e.message, 400);
//       }


// });

app.get('/',adminAuth, async (req, res, next) => {
  var id = req.query.id

  var  where={
    companyId: req.companyId,
        level :'1',
        id:  {[Op.not]: '0'}
         }
  if(id && id!="") 
  where={companyId: req.companyId,
  parentId:  id,
       }


  try {
    const servicesData = await CATEGORY.findAll({
      attributes: ['id','name','description','icon','thumbnail','createdAt','status','colorCode','parentId'],
      where:where,     
      order: [
        ['orderby','ASC']
      ],
    });
   


    var cdata= await commonMethods.getAllParentCategories(req.companyId)

      return res.render('admin/category/categoriesListing.ejs',{data:servicesData,parData :cdata});



    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.get('/parent',adminAuth, async (req, res, next) => {
  try {
    
    var cdata= await commonMethods.getAllParentCategories(req.companyId)

      return res.render('admin/category/pcategoriesListing.ejs',{data :cdata});



    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});





app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllParentCategories(req.companyId)

    return res.render('admin/category/addCategory.ejs',{catData:cdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await CATEGORY.findOne({
         attributes:['id','parentId','name'],
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await CATEGORY.update({
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
               return responseHelper.post(res, 'Something went Wrong',400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,204);

      }

         }
           catch (e) {
             console.log(e)
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


app.post('/add',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceName,data.category])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        name: data.serviceName,
        companyId: req.companyId

      }
    });



    if (!user) {
    
      const users = await CATEGORY.create({
        name: data.serviceName,
        description: data.description,
        icon: icon,
        thumbnail: thumbnail,
        companyId: req.companyId,
        parentId :data.category,
        level : 1,
        colorCode:data.colorCode,
        connectedCat: data.category

       });


      if (users) {

        responseHelper.post(res, appstrings.add_service, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/superadd',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceName])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        name: data.serviceName,
        companyId: req.companyId

      }
    });



    if (!user) {
    
      const users = await CATEGORY.create({
        name: data.serviceName,
        description: data.description,
        icon: icon,
        thumbnail: thumbnail,
        companyId: req.companyId,
        parentId :'0',
        colorCode:data.colorCode

       });


      if (users) {

        responseHelper.post(res, appstrings.add_service, null,200);
       
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


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.serviceName,data.category])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        id: data.serviceId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await CATEGORY.update({
        name: data.serviceName,
        description: data.description,
        icon: icon,
        thumbnail: thumbnail,
        companyId: req.companyId,
        parentId :data.category,
        level : 1,
        connectedCat: data.category,
        colorCode :data.colorCode

       },
       {where:{

        id: data.serviceId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})

app.post('/superupdate',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.serviceName])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        id: data.serviceId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await CATEGORY.update({
        name: data.serviceName,
        description: data.description,
        icon: icon,
        thumbnail: thumbnail,
        companyId: req.companyId,
        parentId :0,
        colorCode :data.colorCode

       },
       {where:{

        id: data.serviceId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})




app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"category");
}
      const findData = await CATEGORY.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      var cdata= await commonMethods.getAllParentCategories(req.companyId)

      return res.render('admin/category/viewCategory.ejs',{data:findData,catData:cdata});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"category");
    }


 
});



app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"category");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await CATEGORY.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(adminpath+"category");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(adminpath+"category");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(adminpath+"category");
        }
});




module.exports = app;

//Edit User Profile
