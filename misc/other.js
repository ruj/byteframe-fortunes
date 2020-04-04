//------------------------------------------------------------------------------ Zadey1
var targets = [
    [ '76561197961017729', 'byteframe', 3],
    [ '76561198117362085', 'Zadey', 6], ]
  , comments = [
    'I think',
    'you should',
    'have five',
    'differant',
    'hearts',
    '*** HAPPY NEW YEAR, $NAME, you dumb motherstuffer! ***' ]
  , SteamUser = require('steam-user')
  , SteamCommunity = require('steamcommunity')
  , user = new SteamUser()
  , community = new SteamCommunity();
user.logOn({ accountName: 'USERNAME', password: 'PASSWORD' });
user.on('loggedOn', () => user.setPersona(SteamUser.Steam.EPersonaState.Online));
user.on('webSession', (sessionID, cookies) => {
  community.sessionID = sessionID;
  community.setCookies(cookies);
  if (user.started) {
    return console.log('restarted connection');
  }
  user.started = true;
  (target = (t = 0) => {
    if (t == targets.length) {
      process.exit(0);
    }
    (comment = (c = 0) => {
      if (c == comments.length || targets[t][2] == 0) {
        return target(t+1);
      }
      setTimeout(() =>
        community.postUserComment(targets[t][0],
          ((targets[t][2] > 1 && c < comments.length-1)
            ? comments[c] : comments[comments.length-1].replace('$NAME', targets[t][1]))
        , (err) => {
          if (err){
            if (err.message == 'The settings on this account do not allow you to add comments.') {
              target(t+1)
            }
            console.error(err.message);
            return comment(c);
          }
          console.log(`comment: ${c+1}, target: ${t+1}/${targets.length}`);
          targets[t][2]--;
          comment(c+1);
        }), 30000);
    })();
  })();
});
//------------------------------------------------------------------------------ Zadey2
((user, community) => (
  user.logOn({ accountName: 'USERNAME', password: 'PASSWORD' }),
  user.on('loggedOn', () => user.setPersona(SteamUser.Steam.EPersonaState.Online)),
  user.on('webSession', (sessionID, cookies) => {
    community.sessionID = sessionID;
    community.setCookies(cookies);
    (user.started) ?
      console.log('restarted connection')
    : (target = (t = 0, targets = [
      [ '76561197961017729', 'byteframe', 3],
      [ '76561198117362085', 'Zadey', 6]
    ]) =>
      (t == targets.length) ?
        process.exit(0)
      : (comment = (c = 0, comments = [
        'I think',
        'you should',
        'have five',
        'differant',
        'hearts',
        '*** HAPPY NEW YEAR, $NAME, you dumb motherstuffer! ***'
      ]) =>
        (c == comments.length || targets[t][2] == 0) ?
          target(t+1)
        : setTimeout(() =>
          community.postUserComment(targets[t][0],
            ((targets[t][2] > 1 && c < comments.length-1)
              ? comments[c] : comments[comments.length-1].replace('$NAME', targets[t][1]))
          , (err) => {
            if (err){
              if (err.message == 'The settings on this account do not allow you to add comments.') {
                target(t+1)
              }
              console.error(err.message);
              return comment(c);
            }
            console.log(`comment: ${c+1}, target: ${t+1}/${targets.length}`);
            targets[t][2]--;
            comment(c+1);
          }), 30000);
      )();
    )()
  })))(new require('steam-user'), new require('steamcommunity'));
//------------------------------------------------------------------------------ N4ZAvatars
if (typeof process.argv[2] == 'undefined') {
  console.log('username not supplied');
  process.exit(1);
}
var readline = require('readline').createInterface({
    input: process.stdin, output: process.stdout })
  , avatars = [
  ... ,
];
console.log('avatar pool size: ' + avatars.length);
const urlHttp = require('fs');
var Crypto = require('crypto')
  , SteamUser = require('steam-user')
  , SteamCommunity = require('steamcommunity')
  , fs = require('fs')
  , account = { user: new SteamUser(), name: process.argv[2] }
  , logon_settings = { rememberPassword: true, accountName: account.name }
;
account.user.setOption("dataDirectory", null);
account.community = new SteamCommunity();
if (fs.existsSync('ssfn')) {
  account.user.setSentry(Crypto.createHash('sha1').update(
    fs.readFileSync('ssfn')).digest()
  );
}
if (fs.existsSync('key')) {
  logon_settings.loginKey = fs.readFileSync('key', 'utf8');
  account.user.logOn(logon_settings);
} else {
  readline.question('password: ', function(input) {
    logon_settings.password = input;
    account.user.logOn(logon_settings);
  });
}
account.user.on('sentry', function(sentry) { fs.writeFileSync('ssfn', sentry); });
account.user.on('loginKey', function(key) { fs.writeFileSync('key', key, 'utf8'); });
account.user.on('webSession', function(sessionID, cookies) {
  console.log('logged on to web...');
  account.community.sessionID = sessionID;
  account.community.setCookies(cookies);
});
(function avatar_changer(index) {
  if (index == avatars.length) {
    index = 0;
    shuffle_array(avatars);
  }
  setTimeout(function() {
    if (account.user.client.loggedOn) {
      account.community.uploadAvatar(avatars[index], null, function(err) {
        if (err) {
          return console.log('ERROR, uploadAvatar:' + err);
        }
        console.log('uploaded Avatar:' + index + " " + new Date().toString());
      });
    }
    avatar_changer(index+1);
  }, (60-new Date().getSeconds())*1000);
})(avatars.length);
//------------------------------------------------------------------------------ BrunoSardine
var names = [
  'STUFF','JUNK','CRAP','BUNK','SCRAP','FOOD','MISC','WASTE','CHAOS','OFFAL',
  'CHAFF','SLOP','LEAK','GEAR', 'ODDS','ENDS','DIRT','MIX','DRECK' ]
, emojis = [
  [ '🌂','🎈','🏓','🏀','📕','👹','💗','💄','🐠','🌸','💃','🍖','🌋','🚗', ],
  [ '🎄','🎍','⛳','🔋','📗','👽','💚','🐊','🐛','🌳','🥒','🥗','🕺','🚙', ],
  [ '🐟','🎫','🎽','👔','📘','👾','💙','💎','🐳','🍇','🍆','🍧','🌏','🚘', ],
  [ '⚡','🎁','📣','📀','📒','😺','💛','👑','🐝','👃','🌽','🥞','👳','🚕', ],]
, errors = 0;
account.user.on('loggedOn', (details, parental) => {
  console.log('logged on');
  account.user.gamesPlayed([399080,399220,399480]);
});
(function group_avatar_changer(index) {
  if (index == avatars.length) {
    index = 0;
    shuffle_array(avatars);
    shuffle_array(names);
  }
  setTimeout(function() {
    if (account.user.client.loggedOn) {
      account.user.setPersona(SteamUser.EPersonaState.Offline,
        names[index] + "[" + emojis[0][Math.floor(Math.random()*14)] +
        emojis[1][Math.floor(Math.random()*14)] +
        emojis[2][Math.floor(Math.random()*14)] +
        emojis[3][Math.floor(Math.random()*14)] + "]");
      account.community.uploadAvatar("./group/" + avatars[index], null, function(err) {
        if (err) {
          if (++errors == 6) {
            errors = 0;
            account.user.webLogOn();
            return console.log('restarting...');
          }
          return console.log('ERROR, uploadAvatar:' + err);
        }
        errors = 0;
        console.log('uploadAvatar (' + names[index] + '): ' + index + " " + new Date().toString());
      });
    }
    group_avatar_changer(index+1);
  }, (60-new Date().getSeconds())*1000);
})(avatars.length);
SteamCommunity.prototype.uploadAvatar = function(image, format, callback) {
  fs.readFile(image, function(err, file) {
    if (err) {
      return callback(err);
    }
    account.community.httpRequestPost({
      "uri": "https://steamcommunity.com/actions/FileUploader",
      "formData": {
        "MAX_FILE_SIZE": file.length,
        "type": "group_avatar_image",
        "gId": '103582791432273268',
        "sessionid": account.community.getSessionID(),
        "doSub": 1,
        "json": 1,
        "avatar": {
          "value": file,
          "options": {
            "filename": 'avatar.jpg',
            "contentType": 'image/jpeg'
          }
        }
      },
      "json": true
    }, function(err, response, body) {
      if (err) {
        return callback(err);
      } else if (body && !body.success && body.message) {
        return callback(new Error(body.message));
      } else if (response.statusCode != 200) {
        return callback(new Error("HTTP error " + response.statusCode));
      } else if (!body || !body.success) {
        return callback(new Error("Malformed response"));
      }
      callback(null, body.images.full);
    }, "steamcommunity");
  })
};
//------------------------------------------------------------------------------ SimonI
if (process.argv.length < 3) {
  console.error('username not supplied!');
  process.exit(1);
}
var logon_settings = { rememberPassword: true, accountName: process.argv[2] }
  , Cheerio = require('cheerio')
  , Crypto = require('crypto')
  , SteamUser = require('steam-user')
  , SteamCommunity = require('steamcommunity')
  , fs = require('fs')
  , readline = require('readline').createInterface({
      input: process.stdin, output: process.stdout })
  , account = { user: new SteamUser(), name: process.argv[2] }
  , RiveScript = require("rivescript")
  , riveScript = new RiveScript()
  , avatars = fs.readdirSync("./avatars")
  , avatar_index = 99999
  , backgrounds = []
  , background_index = 99999
  , errors = 0;
account.user.setOption("dataDirectory", null);
account.community = new SteamCommunity();
console.log("loading rivescript files...");
riveScript.loadDirectory("./rs", () => {
  riveScript.sortReplies();
  if (fs.existsSync('users.json')) {
    var json = JSON.parse(fs.readFileSync('users.json'));
    console.log("restoring " + Object.keys(json).length + " sessions...");
    for (var key in json) {
      if (json.hasOwnProperty(key)) {
        riveScript.setUservars(key, json[key]);
      }
    }
  }
  if (fs.existsSync('ssfn')) {
    account.user.setSentry(Crypto.createHash('sha1').update(
      fs.readFileSync('ssfn')).digest()
    );
  }
  if (fs.existsSync('key-' + process.argv[2])) {
    logon_settings.loginKey = fs.readFileSync('key-' + process.argv[2], 'utf8');
    account.user.logOn(logon_settings);
  } else {
    readline.question('password: ', (input) => {
      logon_settings.password = input;
      account.user.logOn(logon_settings);
    });
  }
  account.user.on('sentry', (sentry) => fs.writeFileSync('ssfn', sentry));
  account.user.on('loginKey', (key) => fs.writeFileSync('key-' + process.argv[2], key, 'utf8'));
  account.user.on('loggedOn', (sessionID, cookies) => {
    console.log('logged on to steam: ' + process.argv[2]);
    account.user.setPersona(SteamUser.EPersonaState.LookingToPlay);
    account.user.gamesPlayed([362960,238750,2100,475150,297000,304390,211420,236430,374320,658620,238960,24810,15370,444590,372000,438420,315810,17480,24800,307780,286260,344770,221380,379430,373420,219990,236390,222880,10270,496300,242920,14221]);
  });
  account.community.on('sessionExpired', (err) => {
    console.log('sessionExpired...');
    account.user.webLogOn();
  });
  account.user.on('webSession', (sessionID, cookies) => {
    console.log('webSession...');
    account.community.sessionID = sessionID;
    account.community.setCookies(cookies);
    if (!backgrounds.length) {
      console.log('requesting inventory...');
      account.community.getUserInventoryContents(account.user.steamID, 753, 6, false, 'english', (err, inventory, currencies, count) => {
        inventory.forEach((item) => {
          if (item.tags[2].name == 'Profile Background') {
            backgrounds.push(item);
          }
        });
        console.log('total backgrounds: ' + backgrounds.length);
        function shuffle_array(array) {
          for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random()*(i + 1));
            var t = array[i];
            array[i] = array[j];
            array[j] = t;
          }
          return array;
        }
        console.log('caching edit form...');
        account.community.httpRequestGet({
          "uri": 'https://steamcommunity.com/id/Triumphofdegeneration/edit',
        }, (err, response, body) => {
          edit = Cheerio.load(body);
        });
        setInterval(() => profile_changer(), 60000);
      });
    }
  });
  function profile_changer() {
    if (++avatar_index >= avatars.length) {
      avatar_index = 0;
      shuffle_array(avatars);
    }
    if (++background_index >= backgrounds.length) {
      background_index = 0;
      shuffle_array(backgrounds);
    }
    account.community.uploadAvatar("./avatars/" + avatars[avatar_index], null, (err) => {
      if (err) {
        if (++errors == 6) {
          errors = 0;
          account.user.webLogOn();
          return console.log('restarting web session...');
        }
        return console.log('ERROR, uploadAvatar:' + err);
      }
      errors = 0;
      console.log('uploadAvatar: ' + avatar_index + " " + new Date().toString());
    });
    edit("input[name=sessionID]").attr("value", account.community.getSessionID());
    edit("#profile_background").attr("value", backgrounds[background_index].id);
    account.community.httpRequestPost({
      "uri": 'https://steamcommunity.com/id/Triumphofdegeneration/edit',
      "form": edit("#editForm").serialize()
    }, (err, response, body) => {
      console.log('profile randomized...');
    });
  }
  function get_reply(steamID, message, steamID64 = steamID.toString()) {
    var reply = riveScript.reply(steamID64, message).replace(
      /<oob><search>.*<\/search><\/oob>/, '').replace(
      /  random/g, ' ').replace(/  /g, ' ').replace('}', '');
    if (!reply.length) {
      reply = 'Huh?';
    }
    console.log(new Date() + " | " + riveScript.getUservar(steamID64, 'chat_time') +
      "\n>> " + "[" + steamID64 + "] " + reply);
    return reply + "ㅤ";
  }
  account.user.on('friendMessageEcho', (recipientID, message, steamID64 = recipientID .toString()) => {
    if (message.indexOf('#!') == 0) {
      account.user.chatMessage(recipientID, get_reply(recipientID, message.substr(2)));
    } else if (message.indexOf('##') == 0) {
      riveScript.setUservar(steamID64, 'chat_time', 0);
    } else if (message.indexOf('ㅤ') == -1) {
      riveScript.setUservar(steamID64, 'chat_time', Date.now());
    }
  });
  account.user.on('friendMessage', (steamID, message, steamID64 = steamID.toString()) => {
    if (riveScript.getUservar(steamID64, 'chat_time') == 'undefined') {
      riveScript.setUservar(steamID64, 'chat_time', 0);
      riveScript.setUservar(steamID64, 'chat_active', false);
    }
    console.log(new Date() + " | " + riveScript.getUservar(steamID64, 'chat_time') +
      "\n<< " + "[" + steamID64 + "] " + message);
    if (Date.now() - riveScript.getUservar(steamID64, 'chat_time') > 3600000
    && riveScript.getUservar(steamID64, 'chat_active') != true) {
      riveScript.setUservar(steamID64, 'chat_active', true);
      var reply = get_reply(steamID, message);
      setTimeout(() => {
        account.user.chatTyping(steamID);
        setTimeout(() => {
          account.user.chatMessage(steamID, reply);
          riveScript.setUservar(steamID64, 'chat_active', false);
        }, Math.max(Math.min(reply.length, 100)*50, 2000));
      }, 1000);
    }
  });
});
quit = () => {
  account.user.logOff();
  fs.writeFileSync('users.json', JSON.stringify(riveScript.getUservars(), null, 2));
  process.exit(0);
}
process.on('SIGINT', quit);
process.on('SIGTERM', quit);
function shuffle_array(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i + 1));
    var t = array[i];
    array[i] = array[j];
    array[j] = t;
  }
  return array;
}
//------------------------------------------------------------------------------