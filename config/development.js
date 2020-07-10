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
	MAIL_PASSWORD:'lenovo@321',
	FCM_KEY:'sfnsvdfvs',
	UPLOAD_DIRECTORY:'public/',
      IMAGE_APPEND_URL:'http://localhost:9074/',
	//IMAGE_APPEND_URL:'http://localhost:9063/',
	NOTIFICATION_KEY:'AAAAlFPLn38:APA91bGhgdz4LngwoCUCkX8MxZTLWdy3YukGvNVHc8LXb6f5q4RD-UKd4Hw4WWT8qXBRgt9yEVGV3JMjGkjgYfuHyN_WdBezaP-1Bw0CK9k8KqMtJ6CeeKoNfU4dGV7L4tgS4pVCvpoi',
	NOTIFICATION_EMP_KEY:'AAAA_A5arGM:APA91bEyn5wlvLQlmK9WAXkMGWE-v2GbFTqbsDirM-ULHRA_mOdxO5EuoveXpyIWeGjLC-eXClTUTdyjOgn4GgIP3a_2y7hi4bh0fsviRzbT1g02uqrBijSGfraqJmqLizEULLgJh36W',
	REMINDER_MAIL:'info@homeservices',
	EMAIL_HOST :'smtp.sendgrid.net',
	EMAIL_KEY :'apikey',
	INVOICE_SUBJECT:'Info Message',
	FOROGT_SUBJECT:'Reset Password request',
	EMAIL_PASS :'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'  , 
	APP_NAME:'E-Market',
	GOOGLEKEY:"AIzaSyDBBLtvW2kqoNiPXOuDBzlk5V_QmRXJLKg",
	BASEURL: "http://localhost:9074/"

};