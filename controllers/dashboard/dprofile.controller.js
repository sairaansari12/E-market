
const express = require('express');
const app     = express();
const bcrypt  = require('bcryptjs');
const v       = require('node-input-validator');
const jwt     = require('jsonwebtoken');
const hashPassword = require('../../helpers/hashPassword');
const COMPANY= db.models.companies
function isAdminAuth(req, res, next) {
    if(req.session.userData){
      return next();
    }
    return res.redirect('/company');
  }
/**
*@role Get Login Page
*@Method POST
*@author Saira Ansari
*/


app.get('/getprofile',adminAuth,async(req,res,next) => {
    try {
        const findData = await COMPANY.findOne({
          where :{id :req.companyId }
        });
        return res.render('admin/dashboard/profile.ejs',{data:findData});
      } catch (e) {
        req.flash('errorMessage',e.message)
        return res.redirect(adminpath);
      }
  });
  app.post('/companyUpdate',adminAuth,async (req, res) => {
    try {
      const data = req.body;
      console.log(data);
      console.log(req.files);
      var logo1 = "";
      var logo2 = "";
      var logo3 = "";
      //Uploading Comapny Images
      if (req.files) {
        var ImageFile = req.files.image;
        if(ImageFile)
        {
          logo1 = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
            ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ logo1, function (err) {
              //upload file
              if (err)
              return responseHelper.error(res, err.message, 400);
          });
        }
        var ImageFile2 = req.files.image2;
        if(ImageFile2)
        {
            logo2 = Date.now() + '_' + ImageFile2.name;
            ImageFile2.mv(config.UPLOAD_DIRECTORY +"users/"+ logo2, function (err) {
              //upload file
              if (err)
              return responseHelper.error(res, err.message, 400);
          });
        }
        var ImageFile3 = req.files.image3;
        if(ImageFile3)
        {
          logo3 = Date.now() + '_' + ImageFile3.name;
          ImageFile3.mv(config.UPLOAD_DIRECTORY +"users/"+ logo3, function (err) {
            //upload file
            if (err)
              return responseHelper.error(res, err.message, 400);
          });
        }
      }
      const user = await COMPANY.findOne({
        where :{id :req.companyId }
      });
      if (user) {
        if(logo1 == "")
        {
          logo1 = user.dataValues.logo1;
        }
        if(logo2 == "")
        {
          logo2 = user.dataValues.logo2;
        }
        if(logo3 == "")
        {
          logo3 = user.dataValues.logo3;
        }
        //update Record
        const users = await COMPANY.update({
            companyName: data.companyName,
            email: data.email,
            address1: data.address1,
            address2: data.address2,
            address1LatLong: data.address1LatLong,
            address2LatLong: data.address2LatLong,
            websiteLink: data.websiteLink,
            logo1:logo1,
            logo2:logo2,
            logo3:logo3,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
          },
          {
            where :{id :req.companyId }
          }
        );
        if (users) {
          responseHelper.post(res, appstrings.update_success, null,200);
        }
       else  responseHelper.error(res, appstrings.oops_something, 400);
      }
        else  responseHelper.post(res, appstrings.no_record, 204);
    } catch (e) {
      return responseHelper.error(res, appstrings.oops_something, e.message);
    }
  })
module.exports = app;

//Edit User Profile
