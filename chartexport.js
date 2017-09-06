var getApp = require('./qixconnection');
var vega = require('vega');
var canvas = require('canvas-prebuilt');
var fs = require('fs');
var builder = require('botbuilder');
var Sync = require('sync');

module.exports = function (session, messageText, year, intent) {

  let barchartSpec = require('./charts/barchart.vg.json');
  let groupedbarchartSpec = require('./charts/groupedbarchart.vg.json');

  let view = new vega.View(vega.parse(barchartSpec))
    .renderer('none')
    .initialize();

  let view1 = new vega.View(vega.parse(groupedbarchartSpec))
      .renderer('none')
      .initialize();


    getApp.then((app) => {
        if (intent === "sales"){
          Sync(function(){
            if (year !== "total"){
	             app.getField('Invoice Year_FKDAT').then(result => {
                 result.select(year);
               });
             }
             app.getObject('BtamKz').then((object) => {
               console.log(object);
               object.getLayout().then((layout) => {
	              //console.log(layout.qHyperCube.qMeasureInfo[0].qMax);
                let values = layout.qHyperCube.qDataPages[0].qMatrix.map((row) => {
                return {"category": row[0].qText, "value": (row[1].qNum/1000000).toFixed(2)} });
                view.insert('table', values).run;

                view.toCanvas().then(function (canvas) {
                var pngString = canvas.toBuffer().toString('base64');
                var message = new builder.Message(session).text(messageText);
                message.addAttachment({
                    contentType: 'image/png',
                    contentUrl: 'data:image/png;base64,' + pngString,
                    name: 'Chart name'
                });
                // send message with attached image stream
                session.send(message);

	          });
          });
        });
    });
  }
  //Sales Ended
  if (intent === "margin"){
    Sync(function(){
      if (year !== "total"){
         app.getField('Invoice Year_FKDAT').then(result => {
           result.select(year);
         });
       }
       app.getObject('mkPs').then((object) => {
         object.getLayout().then((layout) => {
          var values = layout.qHyperCube.qDataPages[0].qMatrix.map((row) => {
            var value = [];
            value[0] = {"category": row[0].qText, "position":1, "value": (row[1].qNum/1000000).toFixed(2)};
            value[1] = {"category": row[0].qText, "position":2, "value": (row[2].qNum/1000000).toFixed(2)};
              return value;
           });
          var vals = [].concat.apply([], values);
          let values10 = vals.slice(0, 20);
          view1.insert('table', values10).run;

          view1.toCanvas().then(function (canvas) {
          var pngString = canvas.toBuffer().toString('base64');
          var message = new builder.Message(session).text(messageText);
          message.addAttachment({
              contentType: 'image/png',
              contentUrl: 'data:image/png;base64,' + pngString,
              name: 'Chart name'
          });
          // send message with attached image stream
          session.send(message);

      });
    });
  });
});
}
  });
};
