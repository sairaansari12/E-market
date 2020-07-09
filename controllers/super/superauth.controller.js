
const express = require('express');
const app     = express();
const hashPassword = require('../../helpers/hashPassword');
const COMPANY= db.models.companies
const Op = require('sequelize').Op;


/**
*@role Get Login Page
*@Method POST
*@author Saira Ansari
*/
app.get('/', async (req, res, next) => {
    if(req.session.userData){
       //var data=await  getDashboardData("2020-04-10","2020-04-17",null,null,req.session.companyId)
       
       var compData= await commonMethods.getAllCompanies(req.session.userId)

       return res.render(superadminfilepath+'index.ejs',{data:null,compData:compData});
    }
    return res.render(superadminfilepath+'login.ejs');
});

async function getDashboardData(fromDate1,toDate1,progressStatus1,filterName,compId)
{
    try {
        
        var fromDate =  ""
        var toDate =  ""
        var filterNameMain=[sequelize.literal(`DAY(createdAt)`), 'DAY']

        var progressStatus =  ['0','1','2','3','4','5']
        if(progressStatus1 && progressStatus1!="")  progressStatus=[progressStatus1]
        if(filterName && filterName!="")
        {
          if(filterName=="MONTH")  filterNameMain= [sequelize.literal(`MONTH(createdAt)`), 'MONTH']
          if(filterName=="YEAR")  filterNameMain= [sequelize.literal(`YEAR(createdAt)`), 'YEAR']
          if(filterName=="WEEK")  filterNameMain= [sequelize.literal(`WEEK(createdAt)`), 'WEEK']

        }



        orderWhere={progressStatus: { [Op.or]: progressStatus}}
        paymentWhere={transactionStatus: { [Op.or]: progressStatus}}
        userWhere={}

        
       
        if(fromDate1)fromDate= Math.round(new Date(fromDate1).getTime())
        if(toDate1) toDate=Math.round(new Date(toDate1).getTime())
        
      
      if(fromDate1!="" && toDate1!="")
      {
        
        orderWhere={progressStatus: { [Op.or]: progressStatus},createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        paymentWhere={transactionStatus: { [Op.or]: progressStatus},createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        userWhere={createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}

    
      }

if(compId!="")
{
  orderWhere.companyId=compId
  paymentWhere.companyId=compId
 // userWhere.companyId=compId

}





          var ordersDataqDepth = await ORDERS.findAll({
            attributes: ['progressStatus',
              [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
              filterNameMain,
              [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count']],
              group: [filterNameMain],
          where :orderWhere
          });
          
          var paymentDataqdepth = await PAYMENT.findAll({
            attributes: ['transactionStatus',
              [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
              filterNameMain,
              [sequelize.fn('COUNT', sequelize.col('transactionStatus')), 'count']],
            group: ['transactionStatus',filterNameMain],
          where :paymentWhere});
      
          var userDataqDepth = await USER.findAll({
            attributes: ['id','status',
            filterNameMain,
              [sequelize.fn('COUNT', sequelize.col('status')), 'count'],[sequelize.literal(`WEEK(createdAt)`), 'week'],
            ],
               group:['status',filterNameMain],
              where :userWhere});


          var categoryDataq = await CATEGORY.findAll({
            attributes: ['id','parentId',filterNameMain,
              [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status',filterNameMain],
          where :userWhere});



          var userDtaa={}
          userDtaa.ordersDataStat=JSON.parse(JSON.stringify(ordersDataqDepth))
          userDtaa.paymentDataStat=JSON.parse(JSON.stringify(paymentDataqdepth))
          userDtaa.userDataStat=JSON.parse(JSON.stringify(userDataqDepth))
          userDtaa.categoryDataStat=JSON.parse(JSON.stringify(categoryDataq))
          userDtaa.totalStatOrder=userDtaa.ordersDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          userDtaa.totalStatCategory=userDtaa.categoryDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          userDtaa.totalStatPayment=userDtaa.paymentDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          userDtaa.totalStatUser=userDtaa.userDataStat.map(item => item.count).reduce(function(acc, val) { return acc + val; }, 0)
          

          var dataWhere={}
          if(compId!="") dataWhere.companyId=compId

          userDtaa.mainTotalOrder=(await ORDERS.findAll({})).length
          userDtaa.mainTotalUser=(await USER.findAll({})).length
         userDtaa.mainTotalPayment=(await PAYMENT.findAll({})).length
         userDtaa.mainTotalCategory=(await CATEGORY.findAll({})).length

          return  userDtaa
      
        } catch (e) {
          console.log(e)
          return null
         // return responseHelper.error(res, e.message, 400);
        }
      

}



/**
*@role Admin Login
*@Method POST
*@author Saira Ansari
*/



app.post('/dashboard',superAuth,async (req, res, next) => {
  try{
    var params=req.body
    var compId=""

    if(params.compId && params.compId!="") compId=params.compId
    var data=await getDashboardData(params.fromDate,params.toDate,null,params.filterName,compId)
    var compData= await commonMethods.getAllCompanies(req.companyId)
    return responseHelper.post(res, appstrings.success,data,200);
  }
  catch(e)
  {
    return responseHelper.error(res, e.message);

  }
  
});
app.post('/login',async(req,res,next) => { 
  
    var params=req.body
        try{
            		const userData = await COMPANY.findOne({
            		where: {
                  email: params.email,
                  role: 1
            		}
            	  })  
                  
                if(userData)
               {
                
                console.log(await hashPassword.generatePass(params.password));

               
                const match = await hashPassword.comparePass(params.password,userData.dataValues.password);
        
                if (!match) {
                    req.flash('errorMessage',appstrings.invalid_cred)
                    return res.redirect(superadminpath);
                }

                var parentCompany=""
                var parent=await commonMethods.getParentCompany(userData.dataValues.id)
                if(parent && parent.dataValues)parentCompany=parent.dataValues.parentId
                        
                req.session.userData = userData;
                req.session.role = 1;
                req.session.companyId = userData.dataValues.id;
                req.session.userId = userData.dataValues.id;
                req.session.parentCompany = parentCompany;

                var currency =await commonMethods.getCurrency(userData.dataValues.id) 
                if(currency && currency.dataValues && currency.dataValues.currency) CURRENCY=currency.dataValues.currency
                 




                req.flash('successMessage',"Welcome, you are logged in successfully.");
                return res.redirect(superadminpath);

                }  
                else    
                {  
                    req.flash('errorMessage',appstrings.invalid_cred);
                    return res.redirect(superadminpath);

                }
 
                       
    }catch (e) {
            req.flash('errorMessage',e.message);
            return res.redirect(superadminpath);

    //  return responseHelper.error(res, e.message, 400);
    }
});

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
    return res.redirect(superadminpath);
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


app.post('/changePassword',superAuth,async(req,res,next) => { 
  
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

app.get('/changePassword',superAuth, async (req, res, next) => {
   return res.render(superadminfilepath+'changePassword.ejs');
});

module.exports = app;

//Edit User Profile
