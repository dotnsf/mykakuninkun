//. app.js
var express = require( 'express' ),
    client = require( 'cheerio-httpcli' ),
    app = express();

app.use( express.Router() );

client.set( 'browser', 'chrome' );

var settings_cors = 'CORS' in process.env ? process.env.CORS : '';  //. "http://localhost:8080,https://xxx.herokuapp.com"
app.all( '/*', function( req, res, next ){
  //console.log( req.headers );
  if( settings_cors ){
    var origin = req.headers.origin;
    if( origin ){
      var cors = settings_cors.split( " " ).join( "" ).split( "," );

      //. cors = [ "*" ] への対応が必要
      if( cors.indexOf( '*' ) > -1 ){
        res.setHeader( 'Access-Control-Allow-Origin', '*' );
        res.setHeader( 'Vary', 'Origin' );
      }else{
        if( cors.indexOf( origin ) > -1 ){
          res.setHeader( 'Access-Control-Allow-Origin', origin );
          res.setHeader( 'Vary', 'Origin' );
        }
      }
    }
  }
  next();
});

app.get( '/', function( req, res ){
  var mode = 'html';
  if( req.query.mode ){
    mode = req.query.mode;
  }

  client.fetch( 'https://www.ugtop.com/spill.shtml', {}, 'UTF-8', function( err, $, response, body ){
    if( err ){
      res.contentType( 'application/json; charset=utf-8' );
      res.status( 400 );
      res.write( JSON.stringify( err, null, 2 ) );
      res.end();
    }else{
      switch( mode ){
      case 'ip':
        var text = '';
        var table = $('table').eq( 1 );
        var th_text = $(table).find( 'th' ).eq( 2 ).text();
        if( th_text == 'あなたのＩＰアドレス(IPv4)' ){
          text = $(table).find( 'td' ).eq( 2 ).text();
        }

        res.contentType( 'text/plain; charset=utf-8' );
        res.write( text );
        res.end();
        break;
      case 'hostname':
        var text = '';
        var table = $('table').eq( 1 );
        var th_text = $(table).find( 'th' ).eq( 3 ).text();
        if( th_text == 'ゲートウェイの名前' ){
          text = $(table).find( 'td' ).eq( 3 ).text();
        }

        res.contentType( 'text/plain; charset=utf-8' );
        res.write( text );
        res.end();
        break;
      default:
        res.contentType( 'text/html; charset=utf-8' );
        res.write( body );
        res.end();
        break;
      }
    }
  });
});

var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );

module.exports = app;
