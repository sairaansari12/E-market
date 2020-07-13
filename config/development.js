const db = require('./db');
module.exports = {
	db: db.development,
	PORT:9074,
	mediapath: 'public/company/',
	dirnames : ['images', 'thumbnails', 'audios', 'videos','documents'],
	jwtToken: 'PGSGFUISBHS=^$#*(%^#',
	saltRounds: 10,
	authTokenExpiration: '7d',
	refreshTokenExpiration: '30d',
	MAIL_USERNAME:'seasiaphp@gmail.com',
	MAIL_PASSWORD:'',
	FCM_KEY:'sfnsvdfvs',
	UPLOAD_DIRECTORY:'public/',
        IMAGE_APPEND_URL:'http://localhost:9074/',
	//IMAGE_APPEND_URL:'http://localhost:9063/',
	NOTIFICATION_KEY:'asdasd',
	NOTIFICATION_EMP_KEY:'asdd',
	REMINDER_MAIL:'info@homeservices',
	EMAIL_HOST :'smtp.sendgrid.net',
	EMAIL_KEY :'apikey',
	INVOICE_SUBJECT:'Info Message',
	FOROGT_SUBJECT:'Reset Password request',
	EMAIL_PASS :''  , 
	APP_NAME:'E-Market',
	GOOGLEKEY:"",
	BASEURL: "http://localhost:9074/"

};
