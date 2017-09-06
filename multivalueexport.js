var getApp = require('./qixconnection');
var builder = require('botbuilder');
var Sync = require('sync');

module.exports = function (session, messageText, city, year, intent) {
    getApp.then((app) => {

        if (intent === "cost"){
          if (year !== "total") {
            app.getField('Invoice Year_FKDAT').then(result => {
              result.select(year);
            });
          }
          app.getField('City Customer_ORT01').then(result => {
            result.select(city);
          });

        setTimeout(function(){
          app.evaluate('sum([Sales Cost Amount_WAVMR])').then(result => {
          let svalue = (result/1000000).toFixed(2);
          messageText += svalue.toString()+" millions";
          var message = new builder.Message(session).text(messageText);
            session.send(message);
          });
        }, 1000);
      }
	 });
};
