var restify = require('restify');
var builder = require('botbuilder');
var apiairecognizer = require('api-ai-recognizer');
var saleschart = require('./chartexport');
var salesvalue = require('./valueexport');
var multivalue = require('./multivalueexport');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

//Initialize the API AI with the token. In the local use the original token
var recognizer = new apiairecognizer(process.env.API_AI_TOKEN);
var intents = new builder.IntentDialog({
         recognizers: [recognizer]
});

// Receive messages from the user about the Business
bot.dialog('/',intents);

var year;
intents.matches('SalesIntent',[
    function(session,args){
        var sales = builder.EntityRecognizer.findEntity(args.entities,'salesEntity');
        var year_obj = builder.EntityRecognizer.findEntity(args.entities,'date-period');
        if(year_obj){
          year = year_obj.entity.substring(0, 4);
        } else{
          year = "total";
        }
        var city = builder.EntityRecognizer.findEntity(args.entities, 'geo-city');
        var msg ;

        if (sales){
          if (year){
            session.send("Sending Sales Value for "+year.toString());
            msg =  "Total Sales for "+year+" is " ;
          }
          else{
            session.send("Sending Total Sales Value");
            msg = "Total Sales is ";
          }
          salesvalue(session, msg, year,"sales")
          //builder.Prompts.confirm(session, 'Do you want the quarterly sales as well ?');

        }else{
            session.send("Hey ! I didn't get that sales...");
        }
    },
    function(session, results) {
      if (results.response){
        session.send("Sending the Quarterly Sales Chart");
        saleschart(session, "Quarterly Sales Chart", year, "sales");
        session.endDialog();
      }
    }
]);

intents.matches('CostIntent',[
    function(session,args){
        var cost = builder.EntityRecognizer.findEntity(args.entities,'costEntity');
        var year_obj = builder.EntityRecognizer.findEntity(args.entities,'date-period');
        if(year_obj){
        var year = year_obj.entity.substring(0, 4);
      }
        var city = builder.EntityRecognizer.findEntity(args.entities, 'geo-city');
        var division = builder.EntityRecognizer.findEntity(args.entities,'divisionEntity');
        console.log(cost);
        if (cost){
          if (year){
            if(division){
              if(city){
                session.send("Sending cost for 2005 division biscuit sales office Milan");
                multivalue(session, "Cost - Milan - Biscuit Division for 2005 : ", city, year,"cost");
              }
            }
            session.send("Sending Cost Value for "+year.toString());
            salesvalue(session, "Total Cost for "+year+" is ", year,"cost");
          }
          else{
            session.send("Sending Total Cost Value");
            salesvalue(session, "Total Cost is ", "total","cost");
          }
        }else{
            session.send("Hey ! I didn't get that cost...");
        }
    }
]);
//
intents.matches('MarginIntent',[
    function(session,args){
        var margin = builder.EntityRecognizer.findEntity(args.entities,'MarginEntity');
        var misc = builder.EntityRecognizer.findEntity(args.entities,'MiscEntity');
        var invoice = builder.EntityRecognizer.findEntity(args.entities,'invoiceEntity');
        var date_obj = builder.EntityRecognizer.findEntity(args.entities,'date-time');
        if(date_obj){
          var date = date_obj.entity.substring(8, 10)+"-"+date_obj.entity.substring(5, 7)+"-"+date_obj.entity.substring(0, 4);
          console.log(date+"I state it thei way");
        }
        if (margin){
          if (misc){
            session.send("Sending Top 5 Customers by Margin");
            salesvalue(session, "Top 5 Customers by Margin are : " , null, "margin");
          }
          else{
            session.send("Sending Sales, Margin by Product Group");
            saleschart(session, " Sales, Margin by Product Group : " , "total", "margin");
          }
        }
        else if (invoice){
          if(date){
            session.send("Sending Invoice Details");
            salesvalue(session, "Invoice Details are : " ,date, "margin");
          }
        }
        else{
            session.send("Hey ! I didn't get that margin...");
        }
    }
]);
//
// intents.matches('CostIntent');

intents.onDefault(function(session){
    session.send("Sorry...can you please rephrase that?");
});
