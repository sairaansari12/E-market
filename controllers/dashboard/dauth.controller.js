
const express = require('express');
const app     = express();
const moment = require('moment');
const { QueryTypes, Sequelize } = require('sequelize');
const hashPassword = require('../../helpers/hashPassword');
const db = require('../../db/db');
const COMPANY= db.models.companies
const USER = db.models.users
const ORDERS= db.models.orders
const SUBORDERS=db.models.suborders
const Op = require('sequelize').Op;

ORDERS.hasMany(SUBORDERS,{foreignKey: 'orderId'});
ORDERS.hasOne(PAYMENT,{foreignKey: 'orderId'})
SUBORDERS.hasMany(PAYMENT,{foreign_key: 'orderId'});

function isAdminAuth(req, res, next) {
    if(req.session.userData){
      return next();
    }
    return res.redirect('/company');
  }

  
app.get('/', async (req, res, next) => {
   //return res.render(adminfilepath+'index.ejs',{data:null});
    if(req.session.userData){
       var data=await  getDashboardData(req.session.companyId);

       console.log(data);

        return res.render(adminfilepath+'index.ejs',{data:data});
    }
    return res.render(adminfilepath+'login.ejs');
});

async function getDashboardData(companyId)
{

    //Count Registered Users
    const users =  await USER.count({
      where: {
        companyId: companyId
      }
    });

    // console.log("user count is ",users);

    //Count Orders under this company
    const orders = await ORDERS.count({
      include: [
        {
          model: SUBORDERS, 
          as : 'suborders', 
          attributes: ['companyId','userId','orderId'],
          where: {
            companyId: companyId
          }
        }
      ]
    });

    // console.log("orders count is ",orders);

    //Total Payments
    const payments = await db.query(
                        "SELECT SUM(`amount`) AS total FROM `payment` AS P INNER JOIN `suborders` AS S ON P.orderId = S.orderId WHERE S.companyId = :companyId",
                        {
                          replacements: {companyId: companyId},
                          type: QueryTypes.SELECT
                        });

    // console.log("payments count is ",payments);

    const weeklyPayments = await db.query(
                              "SELECT SUM(`amount`) AS total FROM `payment` AS P INNER JOIN `suborders` AS S ON P.orderId = S.orderId WHERE S.companyId = :companyId AND P.createdAt > :datefilter",
                              {
                                replacements: 
                                  {
                                    companyId: companyId, 
                                    datefilter: moment().subtract(7, 'days').toDate()
                                  },
                                type: QueryTypes.SELECT
                              });

    //moment().subtract(7, 'days').toDate()

    // console.log("weekly payments are ",weeklyPayments);

    //weekly Orders
    const weeklyOrders = await ORDERS.count({
      where: {
        createdAt: {
          [Op.gte]: moment().subtract(7, 'days').toDate()
        }
      },
      include: [
        {
          model: SUBORDERS, 
          as : 'suborders', 
          attributes: ['companyId','userId','orderId'],
          where: {
            companyId: companyId
          }
        }
      ]
    });

    // console.log("weekly orders are ,",weeklyOrders);
    
      //Group by status payments
      const paymentStatus = await db.query(
        "SELECT COUNT(*) AS `orders`,`progressStatus` FROM `suborders` WHERE `companyId` = :companyId GROUP BY `progressStatus`",
        {
          replacements: {companyId: companyId},
          type: QueryTypes.SELECT
        });


      let data = {};
      data.users = users;
      data.orders = orders;
      data.payments = payments[0].total != null ? payments[0].total: 0;
      data.weeklyOrders = weeklyOrders;
      data.weeklyPayments = weeklyPayments[0].total != null ? weeklyPayments[0].total: 0;
      data.paymentStatus = paymentStatus;

      return data;

}



/**
*@role Admin Login
*@Method POST
*@author Saira Ansari
*/



app.post('/dashboard', adminAuth,async (req, res, next) => {
  try{
    var params=req.body
    var data=await getDashboardData(params.fromDate,params.toDate,null,params.filterName,req.session.companyId)
    return responseHelper.post(res, appstrings.success,data,200);
  }
  catch(e)
  {
    return responseHelper.error(res, e.message);

  }
  
});
app.post('/login',async(req,res,next) => { 
  
    var params=req.body
    console.log(params);

        try{
            		const userData = await COMPANY.findOne({
            		where: {
                  email: params.email,
                  role:2,
                  status:1
            		}
                })  
              
                  
                if(userData)
               {
                
                console.log(await hashPassword.generatePass(params.password));

               
                const match = await hashPassword.comparePass(params.password,userData.dataValues.password);
        
                if (!match) {
                    return responseHelper.noData(res, appstrings.invalid_cred);
                }
                      
                
                var parentCompany=""
                var parent=await commonMethods.getParentCompany(userData.dataValues.id)
                if(parent && parent.dataValues)parentCompany=parent.dataValues.parentId
                req.session.userData = userData;
                req.session.role = 2;
                req.session.companyId = userData.dataValues.id;
                req.session.userId = userData.dataValues.id;
                req.session.parentCompany = parentCompany;

                var currency =await commonMethods.getCurrency(userData.dataValues.id) 
                if(currency && currency.dataValues && currency.dataValues.currency) CURRENCY=currency.dataValues.currency
                 
                return responseHelper.post(res, "Login Successfully",null,200);

                }  
                else    
                {  
                     return responseHelper.noData(res, appstrings.invalid_cred);
                    //req.flash('errorMessage',appstrings.invalid_cred);
                    //return res.redirect(adminpath);

                }
 
                       
    }catch (e) {
       return responseHelper.error(res, e.message);
            //req.flash('errorMessage',e.message);
            //return res.redirect(adminpath);

    //  return responseHelper.error(res, e.message, 400);
    }
});

/**
*@role Admin Dashboard
*@Method POST
*@author Saira Ansari
*/


/**
*@role Admin Dashboard
*@Method POST
*@author Saira Ansari
*/
app.get('/logout',async(req,res,next) => {
    req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    }
   // req.flash('successMessage',"Logout Success.");
    return res.redirect(adminpath);
    });
});


app.post('/forgotPassword',async(req,res,next) => { 
  
  var params=req.body
  let responseNull= commonMethods.checkParameterMissing([params.forgotEmail])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

      try{
             userData = await COMPANY.findOne({
            where: {
                email: params.forgotEmail,
              }
              })  
                
              if(userData)
             {
              
                userData= JSON.parse(JSON.stringify(userData))
                  var number= Math.floor(Math.random()*(10000000-0+1)+10000000 )+"";
                  const newPassword = await hashPassword.generatePass(number);
          var dataEmail={name: userData.companyName,password: number,app_name:config.APP_NAME}
                  commonNotification.sendForgotPasswordMail(userData.email,dataEmail)
                  await COMPANY.update({ password: newPassword}, {where: { id: userData.id}}) ; 
                 
                 
               return responseHelper.post(res, appstrings.password_reset_success,null,200);


              
             

              }  
              else    
              {  
                  return responseHelper.post(res, appstrings.no_record,null,204);


              }

                     
  }catch (e) {
      console.log(e)
        return responseHelper.error(res, e.message);

  //  return responseHelper.error(res, e.message, 400);
  }
});


app.post('/changePassword',adminAuth,async(req,res,next) => { 
  
    var params=req.body
    let responseNull= commonMethods.checkParameterMissing([params.oldPassword,params.newPassword])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

        try{
            	const userData = await COMPANY.findOne({
            	where: {
                  id: req.id,
            		}
            	  })  
                  
                if(userData)
               {
                
                const match = await hashPassword.comparePass(params.oldPassword,userData.dataValues.password);
        
                if (!match) {
                 return responseHelper.post(res, appstrings.inccorect_oldpass,null,400);

                }
                     
                else{

                    const newPassword = await hashPassword.generatePass(params.newPassword);
                    await COMPANY.update({ password: newPassword}, {where: { id: req.id}}) ; 
                    return responseHelper.post(res, appstrings.password_change_success,null,200);


                }
               

                }  
                else    
                {  
                    return responseHelper.post(res, appstrings.no_record,null,204);


                }
 
                       
    }catch (e) {
        console.log(e)
          return responseHelper.error(res, e.message);

    //  return responseHelper.error(res, e.message, 400);
    }
});

app.get('/changePassword',adminAuth, async (req, res, next) => {
   return res.render(adminfilepath+'changePassword.ejs');
});

module.exports = app;

//Edit User Profile
