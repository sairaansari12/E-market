const NOTIFICATION=db.models.notifications

const sequelize = require('sequelize')
const fs = require('fs');
var FCM = require('fcm-node');
 var apn = require('apn');
 var fcm = new FCM(config.NOTIFICATION_KEY);
 var cron = require('node-cron');
 var moment = require('moment')
 const Op = require('sequelize').Op;
 var dateFormat = require('dateformat');

 var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: 465,
    secure: true, // use SSL
    //service: 'gmail',
    auth: {
        user: config.EMAIL_KEY,
        pass: config.EMAIL_PASS
    }
});



cron.schedule('30 06 * * *',  async() => {
   console.log('running a task every 6:30 AM ');
   var days=['sun','mon','tue','wed','thu','fri','sat']

   var dayCount=days[new Date().getDay()]
  try {
    var findData = await SCHEDULE.findAll({where: {dayParts:{[Op.not]: dayCount}}});
    findData=JSON.parse(JSON.stringify(findData))

for(var t=0;t<findData.length;t++)
{
  SCHEDULE.update(
     {slots: findData[t].permanentSlots},
      {where: {id:findData[t].id}});
 }


//Delete older Notifications

NOTIFICATION.destroy({where: {  createdAt: {[Op.lte]: moment().subtract(7, 'days').toDate()
}}
});






  } catch (e) {
    console.error(e.message)
  }

  });
   

  cron.schedule('00 12 * * *',  async() => {
    console.log('running a task every 12:00 AM ');
    try{
      var newDate = moment(new Date()).format("YYYY/MM/DD hh:mm:ss");


      var services = await PRODUCTS.findAll({
        attributes: ['id','name','icon','thumbnail','validUpto','offer','offerName','price','originalPrice'],
        where: {
                 status: 1,
                 validupto: {
                  [Op.lt]: newDate
                },
               
        },
        include: [{
          model: PRODUCTSPEC,
          attributes:['id','productImages','productColor','stockQunatity'],
          required: true,
       }] ,
        order: [
          ['offer','DESC']
        ]
      })


      services=JSON.parse(JSON.stringify(services))
      for(var p=0;p<services.length;p++)
      {
      
        PRODUCTS.update( {price:services[p].originalPrice,
          offer: 0,offerName:'',validUpto:''},
          {where: {id: services[p].id}})
      
      var data=services[p].productSpecifications
      //console.log(data)
      //console.log(">>>>>>>>>",data.length)

      for(var t=0;t<data.length;t++)
{

  var stocks=data[t].stockQunatity

  //console.log("STOCKS>>>>>",stocks)
var array=[];
  for(var p=0;p<stocks.length;p++)
  {
var data1=stocks[p]
data1.price=data1.originalPrice
array.push(data1)
  }

//console.log(data[t])
  PRODUCTSPEC.update( {stockQunatity:JSON.stringify(array)},
    {where: {id: data[t].id}})
}
      }


    
   } catch (e) {
     console.error(e.message)
   }
 
   });




// cron.schedule('* * * * *', () => {
//   var newDate = moment(new Date()).subtract(10,'days');

//   console.log('Runing a job at 01:0`0 at America/Sao_Paulo timezone',newDate);
 
// }, {
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// });



 









