//------------------------------------------------------------------------------ TwitchFailed
twitchChat.onWhisper((channel, user, message) => (
  console.log(user, message),
  twitchChat.whisper(user, get_reply(user, message))))
twitchChat.onPrivmsg((channel, user, message) => 
  (user != 'byteframe' && message.indexOf('@byteframe ') == 0) &&
    setTimeout((user, reply) =>
      twitchChat.say('byteframe', '@' + user + ' ' + get_reply(user, message.substr(11))), Math.max(Math.min(reply.length, 75)*80, 2000), user, get_reply(user, message)))
//------------------------------------------------------------------------------ RainbowChat
setInterval(() => rainbow_message = pool(questions), 100000),
rainbow_chat = (i = 0) => (
  rainbow_message = get_reply((i == 0 ? 'Walter' : ' Perry'), rainbow_message),
  console.log('MESSAGE |999| ' + (i == 0 ? '<< [Perry] <<' : '>> [Walter] >>').rainbow.bold.inverse + ' ' + rainbow_message.rainbow.bold),
  setTimeout(rainbow_chat, Math.floor((Math.random()*20000) + 10000), (i == 0 ? 1 : 0))),
//------------------------------------------------------------------------------ GroupSend
old_send_group_chat = send_group_chat;
send_group_chat = (account, groupid, roomid, msg) => (
  old_send_group_chat(account, groupid, roomid, msg),
  discord.channels.get('391678265166921760').send(msg));
accounts[a].send_group_chat('37338', '12030657', "/pre .\n" + generate_text());
giphy.search({q: pool(byteframe.giphy_queries)}, (err, data) =>
  accounts[a].send_group_chat('37338', '12030657', data.data[Math.floor(Math.random()*data.data.length)].url))
send_group_chat = (account, groupid, roomid, msg) => {
  if (account.user.chat666) {
    setTimeout((groupid, roomid, msg) => (
      group_chats_length--,
      account.user.chat.sendChatMessage(groupid, roomid, msg)), group_chats_length*2000, groupid, roomid, msg);
    group_chats_length++;
  }
}
send_group_chat(account, '37338', '12023431', msg.replace(/\[\/?[biu]\]/g, '').replace(/\s+/g, ' ') + ' https://steamcommunity.com/profiles/' + steamid[1] + " #" + account.index),
send_group_chat(account, '37338', '12097217',pool(decoration.ascii_face) + " | HUMAN " + pool(decoration.emojis[0]) + (action ? ' SUBSUMED ': ' DETACHED ') + pool(decoration.emojis[1]) + " ON " + pool(decoration.emojis[2]) + " INDEX " + pool(decoration.emojis[3]) + " #" + account.index + " | - " + decoration.barcode.shuffle() + "\n" + 'https://steamcommunity.com/profiles/' + persona),
send_group_chat(account, '37338', '12023431', "# " + account.index + ' https://steamcommunity.com/sharedfiles/filedetails/?id=' + item_id),
send_group_chat(account, '37338', '12023431', '/quote << ' + account.find_name(steamid) + ' << "' + msg + '"')
send_group_chat(account, '37338', '12023431', '/code >> ' + account.find_name(steamid) + ' >> "' + reply + '"'),
//------------------------------------------------------------------------------ OldWebChatSpammer
CWebChat.prototype.MessageRandomUser = function() {
  try {
    var _chat = this;
      , Friend = this.m_ActiveFriend;
      , strMessage = "HELLO"
      , ulSteamIDActive = Friend.m_ulSteamID;
      , rgParams = {
        umqid: this.m_umqid,
        type: 'saytext',
        steamid_dst: ulSteamIDActive,
        text: strMessage
      };
    this.AddToRecentChats( Friend );
    var elMessage = _chat.m_rgChatDialogs[ Friend.m_unAccountID ].AppendChatMessage( _chat.m_User, new Date(), strMessage, CWebChat.CHATMESSAGE_TYPE_LOCALECHO );
    this.m_WebAPI.ExecJSONP(
      'ISteamWebUserPresenceOAuth', 'Message', rgParams, true ).done( function(data) {
    }).fail( function () {
      ShowAlertDialog( 'Failed to send chat message: There was an error communicating with the network. Please try again later.' );
    });
  } catch (e) {
    ShowAlertDialog('Failed to send chat message: An error was encountered while processing your request:');
  }
};
//------------------------------------------------------------------------------ Broadcast chat with request text and update title
request_index = -1;
setInterval(function() {
  broadcast_log(requests[++request_index].data.replace(
    /\n/g, ' | ').replace(/\s+/g, ' ').trim().substr(0,750));
  if (request_index == requests.length-1) {
    request_index = -1;
  }
}, 30000);
function update_broadcast_title() {
  setTimeout(function() {
    jQuery('#BroadcastAdminTitleInput').val(profile_debug());
    BroadcastWatch.UpdateBroadcast();
    update_broadcast_title();
  }, (60-new Date().getSeconds()+5)*1000);
}
update_broadcast_title();
//------------------------------------------------------------------------------ ElizaInterface
var logon_settings = { rememberPassword: true, accountName: process.argv[2] }
  , ElizaBot = require('./ElizaBot.js')
  , elizaBot = new ElizaBot()
  , Crypto = require('crypto')
  , SteamUser = require('steam-user')
  , SteamCommunity = require('steamcommunity')
  , fs = require('fs')
  , readline = require('readline').createInterface({
      input: process.stdin, output: process.stdout })
  , account = { user: new SteamUser(), name: logon_settings.accountName };
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
account.user.on('loggedOn', function(details, parental) {
  console.log('logged on to steam...');
  account.user.setPersona(SteamUser.EPersonaState.LookingToPlay);
});
account.user.on('friendMessage', function(steamID, message) {
  if (message) {
    account.user.chatMessage(steamID, elizaBot.transform(message));
  }
});
//------------------------------------------------------------------------------ GetGroupJoinChat
(join_chat = (g = 0) => {
  if (g != group_chats.length) {
    account.community.getSteamGroup(group_chats[g], (err, group) => {
      if (err) {
        console.error('getGroup error: ' + group_chats[g]);
        return join_chat(g+1);
      }
      account.user.joinChat(group.steamID, (result) => {
        console.log('joinChat result: ' + SteamUser.EResult[result] + "/" + group_chats[g]);
        join_chat(g+1);
      });
    });
  }
})();
//------------------------------------------------------------------------------ AimlTestCommon
const fs = require('fs');
var few_aiml_files = [
  'reduction0.safe.aiml','reduction1.safe.aiml','reduction2.safe.aiml',
  'reduction3.safe.aiml','reduction4.safe.aiml',
  'mp0.aiml','mp1.aiml','mp2.aiml','mp3.aiml','mp4.aiml','mp5.aiml','mp6.aiml' ];
//------------------------------------------------------------------------------ BurlyTest
const Burly = require('burlyy');
const bot = new Burly({
  defaultResponse: "I don't know what you're on about.",
  name: 'Botto'
});
aiml_files = fs.readdirSync('aiml/').map(file => 'aiml/'+file);
var prompt = 'You: ';
(function load_aiml_files(f = 0) {
  if (f != aiml_files.length) {
    bot.loadFile(aiml_files[f]).then(() => {
      console.log('loading file: ' + aiml_files[f]);
      load_aiml_files(f+1);
    });
  } else {
    console.log(`${bot.name}: Hello! Type quit to quit or /help for unhelpful help.`);
    process.stdout.write(prompt);
    process.stdin.on('data', data => {
      let sentence = data.toString().replace(/\r?\n/g, '');
      if (sentence === 'quit' || sentence === 'exit') {
          console.log('Yeah, fuck off.');
          process.exit();
      }
      bot.talk(sentence).then(res => {
          console.log(`${bot.name}: ${res}`);
          process.stdout.write(prompt);
      }).catch(err => {
          console.error(`\n\nSome shit happened.\n${err.stack}`);
          process.exit(1);
      });
    });
  }
})();
//------------------------------------------------------------------------------ AimlHighTest
var aimlHigh = require('aiml-high');
var interpreter = new aimlHigh({name:'Bot', age:'42'}, 'Goodbye');
aiml_files = aiml_files.concat(
  fs.readdirSync('aiml-en-us-foundation-alice/').map(file => 'aiml-en-us-foundation-alice/'+file));
console.log(aiml_files);
interpreter.loadFiles(aiml_files);
console.log('loaded');
var callback = function(answer, wildCardArray, input){
  console.log(answer + ' | ' + wildCardArray + ' | ' + input);
};
setTimeout(function() { interpreter.findAnswer('hello', callback); }, 2000);
//------------------------------------------------------------------------------ SurlyTest
const fs = require('fs');
var pkg = require('./package.json');
var Surly = require('./src/Surly');
var conf = { brain: '' };
var bot = new Surly({
  brain: conf.brain
});
aiml_files = aiml_files.concat(
  fs.readdirSync('aiml-en-us-foundation-alice/').map(file => 'aiml-en-us-foundation-alice/'+file));
console.log(aiml_files);
var prompt = 'You: ';
(function load_aiml_files(f = 0) {
  if (f == aiml_files.length) {
    console.log('loading file: ' + aiml_files[f]);
    bot.loadFile(aiml_files[f], function(err, response) {
      load_aiml_files(f+1);
    });
  } else {
    console.log(`${bot.name}: Hello! Type quit to quit or /help for unhelpful help.`);
    process.stdout.write(prompt);
    process.stdin.on('data', data => {
      let sentence = data.toString().replace(/\r?\n/g, '');
      if (sentence === 'quit' || sentence === 'exit') {
          console.log('Yeah, fuck off.');
          process.exit();
      }
      bot.talk(sentence, function (err, response) {
        console.log('Surly: ' + response);
        process.stdout.write(prompt);
      });
    });
  }
})();
//------------------------------------------------------------------------------ UserData
if (fs.existsSync('config-users.json')) {
  var json = JSON.parse(fs.readFileSync('config-users.json'));
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      riveScript.setUservars(key, json[key]);
    }
  }
}
process.once('exit', (code) => {
  fs.writeFileSync('config-users.json', JSON.stringify(riveScript.getUservars(), null, 2));
});
console.log("SESSION |" + '000'.gray + "| restoring " + Object.keys(config.chat_users).length + " sessions...");
for (var key in config.chat_users) {
  if (config.chat_users.hasOwnProperty(key)) {
    riveScript.setUservars(key, config.chat_users[key]);
  }
}
("saving_chat_data" == "true") && (
  Object.keys(config.chatbot).forEach((key) =>
    riveScript.setUservars(key, config.chatbot[key])),
  console_log("SESSION |" + '000'.gray.inverse + "| restored " + Object.keys(config.chatbot).length + " sessions"),
  exit_handlers.unshift(() => config.chatbot = riveScript.getUservars())),
//------------------------------------------------------------------------------ ChatProcedures
get_reply = (userid, msg, account) => {
  var reply = riveScript.reply(userid, msg).replace(
    /<oob><search>.*<\/search><\/oob>/, '').replace(
    /  random/g, ' ').replace(/  /g, ' ').replace('}', '');
  if (!reply.length) {
    reply = 'Huh?';
  }
  log_line(userid, ">>", reply, account);
  return reply;
};
handle_message_echo = (userid, msg, send, account) => {
  if (msg.indexOf('#!') == 0) {
    send(get_reply(userid, msg.substr(2), account));
  } else if (msg.indexOf('##') == 0) {
    riveScript.setUservar(userid, 'chat_time', 0);
  } else if (msg.indexOf('#$') == 0) {
    riveScript.setUservar(userid, 'chat_time', Date.now());
  }
  if (msg.indexOf('ㅤ') != -1) {
    return;
  }
  log_line(userid, "^^", msg, account);
};
send_reply = (reply, typeon, typeoff, send, account, callback = null) => {
  setTimeout(() => {
    typeon(account);
    setTimeout(() => {
      typeoff(account);
      send(account, reply);
      if (callback != null) {
        callback();
      }
    }, Math.max(Math.min(reply.length, 100)*50, 1500));
  }, 1000);
};
incoming_message_event = (userid, msg, typeon, typeoff, send, account) => {
  log_line(userid, "<<", msg, account);
  if (msg.indexOf('!') == 0) {
    var trigger = msg.substr(1, (msg+" ").indexOf(' ')-1);
    if (trigger in chat_triggers) {
      return chat_triggers[trigger](userid, (msg+" ").substr(msg.indexOf(' ')).trim(), typeon, typeoff, send, account);
    } else {
      return send_reply('Unknown Chat Trigger!', typeon, typeoff, send, account);
    }
  }
};
handle_message_echo(recipientID.toString(), msg, (reply) => {
  account.user.chatMessage(recipientID, reply);
}, account);
incoming_message_event(steamID.toString(), msg,
  (account) => { account.user.chatTyping(steamID); },
  (account) => { ; },
  (account, reply) => { account.user.chatMessage(steamID, reply); }
, account);
//------------------------------------------------------------------------------