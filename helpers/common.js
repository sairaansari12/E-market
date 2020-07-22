const config = require('config');
const jwt = require('jsonwebtoken');
const moment = require('moment');
var catArr = new Array();

async function getallcats(parentid){

    const cat = await CATEGORY.findOne({
        attributes: ['id','parentId','name','description','icon','thumbnail','orderby','level'],
        where: {
            id: parentid
        }
    });

    catArr.push(cat.dataValues);

    if(cat.dataValues.parentId != 0){

        await getallcats(cat.dataValues.parentId);

    }else{

        return catArr;

    }

}


var methods={

 userId :  (token) => {
    const decoded = jwt.verify(token, config.jwtToken);
    return decoded.id;
},
 companyId : (token) => {
    const decoded = jwt.verify(token, config.jwtToken);
    return decoded.companyId;
},

 timestamp : () => {
	return time = moment.utc().format('X');
},

checkParameterMissing :   function(params)
{

for(var k=0;k<params.length;k++)
{

if(params[k]==undefined || params[k]=="")

{
 return true
}

if(k==params.lenth-1)
return false

}

},
uploadFunction:  function(req,res,imageName)
{
    ImageFile = req.files.image;    
    ImageFile.mv(config.mediapath + imageName, function (err) {
        if(err){
            return responseHelper.error(res, 'Unable to upload image', 400);
        }
        console.log('Upload Successfully');
    });
},
getAllParentCategories: async function(parentid){

    let getAllParent = await getallcats(parentid);

    return getAllParent;

}
}
module.exports=methods
