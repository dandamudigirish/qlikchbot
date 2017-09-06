var getApp = require('./qixconnection');
var builder = require('botbuilder');
var Sync = require('sync');

module.exports = function (session, messageText, year, intent) {
    getApp.then((app) => {
      if (intent === "sales"){
    Sync(function(){
      if (year !== "total") {
        app.getField('Invoice Year_FKDAT').then(result => {
          result.select(year);
        });
      }
      setTimeout(function(){
        app.evaluate('sum([Billing Sales Amount_NETWR])').then(result => {
        let svalue = (result/1000000).toFixed(2);
        messageText += svalue.toString()+" millions";
        var message = new builder.Message(session).text(messageText);
          session.send(message);
          setTimeout(function(){
            builder.Prompts.confirm(session, 'Do you want the quarterly sales as well ?');
          }, 1000);

      });
      }, 1000);
    //
  });
}
if (intent === "cost"){
  if (year !== "total") {
    app.getField('Invoice Year_FKDAT').then(result => {
      result.select(year);
    });
  }

setTimeout(function(){
  app.evaluate('sum([Sales Cost Amount_WAVMR])').then(result => {
  let svalue = (result/1000000).toFixed(2);
  messageText += svalue.toString()+" millions";
  var message = new builder.Message(session).text(messageText);
    session.send(message);
  });
}, 1000);
}

if (intent === "margin"){

  Sync(function(){
  app.clearAll();

  setTimeout(function(){
    if (year !== null) {
      app.getField('Billing Date_FKDAT').then(result => {
        result.select(year);
        app.getObject('wYjfX').then((object) => {
          object.getHyperCubeData('/qHyperCubeDef', [{
            qTop: 0,
            qLeft: 0,
            qWidth: 10,
            qHeight: 1000
          }]).then((data) => {
          data[0].qMatrix.map((row, index) => {
              let date =  row[0].qText;
              console.log(date);
               let doc = row[1].qText;
               let doc_link = row[2].qText;
               messageText += date+"  "+doc+" "+doc_link;
               var message = new builder.Message(session).text(messageText);
               // send message with attached image stream
               if (index === (data[0].qMatrix.length-1)){
                 session.send(message);
               }
           });
         });
       });
      });

    } else {
        app.getObject('YBYAFwV').then((object) => {
        console.log(object);
        object.getLayout().then((layout) => {
          //console.log(layout.qHyperCube.qMeasureInfo[0].qMax);
          layout.qHyperCube.qDataPages[0].qMatrix.map((row, index) => {
              let name =  row[0].qText;
               let svalue = (row[1].qNum/1000000).toFixed(2);
               messageText += name+": "+svalue.toString()+" millions \n";
               var message = new builder.Message(session).text(messageText);
               // send message with attached image stream
               if (index === (layout.qHyperCube.qDataPages[0].qMatrix.length-1)){
                 session.send(message);
               }
           });
         });
       });
      }
      }, 1000);
    });
  //
}


	 });
};
