var restify = require('restify');
var builder = require('botbuilder');
var apiairecognizer = require('api-ai-recognizer');

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
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

//Initialize the API AI with the token
var recognizer = new apiairecognizer(process.env.API_AI_TOKEN);
var intents = new builder.IntentDialog({
         recognizers: [recognizer]
});

// Receive messages from the user about the Business
bot.dialog('/api/messages/',intents);

intents.matches('SalesIntent',[
    function(session,args){
        var sales = builder.EntityRecognizer.findEntity(args.entities,'salesEntity');
        if (sales){
            var sales_name = sales.entity;
            session.send("The"+sales_name+" is $122,431");
        }else{
            session.send("Hey ! I didn't get that...");
        }
    }
]);

intents.onDefault(function(session){
    session.send("Sorry...can you please rephrase that?");
});
