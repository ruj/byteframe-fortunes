//------------------------------------------------------------------------------ OPNEvents
this.user.on('groupRelationship', (steamID, relationship) => {
  if (relationship != SteamUser.EClanRelationship.Blocked
  && relationship != SteamUser.EClanRelationship.Member) {
    this.log('SESSION | groupRelationship: '
      + (SteamUser.EClanRelationship[relationship].toUpperCase()
      + "=https://steamcommunity.com/gid/" + steamID).yellow);
  }
  if (relationship == SteamUser.EClanRelationship.Invited) {
    this.user.respondToGroupInvite(steamID, this.accept_group);
  }
  if (!this.accept_friend && relationship != SteamUser.EClanRelationship.Member
  && relationship != SteamUser.EClanRelationship.Blocked && this.index == 0) {
    OPN("https://steamcommunity.com/gid/" + steamID + "?" + SteamUser.EClanRelationship[relationship]);
  }
});
this.accept_friend = accept_friend;
this.user.on('friendRelationship', (steamID, relationship) => {
  if (this.accept_friend) {
    if (relationship == SteamUser.EFriendRelationship.RequestRecipient && steamid_blacklist.indexOf(steamID) == -1) {
      return this.user.addFriend(steamID);
    }
  } else if (relationship != SteamUser.EFriendRelationship.Friend
  && relationship != SteamUser.EFriendRelationship.RequestInitiator && this.index == 0) {
    OPN("https://steamcommunity.com/profiles/" + steamID + "?" + SteamUser.EFriendRelationship[relationship]);
  }
  this.log('SESSION | friendRelationship: '
    + (SteamUser.EFriendRelationship[relationship].toUpperCase()
    + "=https://steamcommunity.com/profiles/" + steamID).yellow);
});
//------------------------------------------------------------------------------ HttpRequestProcedure
http_request = (account, endpoint, data = null, callback = null, method = 'GET', json = true, retries = 0, force = false) => {
  if (retries == 3) {
    return;
  }
  if (data != null && typeof data !== 'string') {
    data.sessionid = account.community.getSessionID();
    method = 'POST';
  }
  endpoint = endpoint.replace(/http.*:\/\/steamcommunity.com\//, '');
  var options = {
    "uri": endpoint,
    "method": method,
    "form": (typeof data == 'string' ? 'sessionID=' + account.community.getSessionID() + data : data),
    "json": json,
  };
  if (options.uri.indexOf('http') == -1) {
    options.uri = ('https://steamcommunity.com/' + options.uri).replace("/my/", "/" + profile_url(account) + "/");
  }
  if (!json) {
    options.encoding = null;
  }
  account.community.httpRequest(options, (err, response, body) => {
    var result = endpoint.replace(/http.*:\/\//, '').replace(/^www./, '').replace(
        "steamcdn-a.akamaihd.net/steamcommunity/public/images/", '') + ": " + (method + '-').yellow
      , success = false;
    if (err && err.message == 'Malformed JSON response') {
      err = 0;
    }
    if (!response) {
      result = "FAILURE" + " | " + result + '???=NO RESPONSE'.yellow;
    } else {
      var response_code = response.statusCode.toString();
      result = result + response_code.yellow
      if (!body && response_code != '302' && response_code != '200') {
        result = "FAILURE" + " | " + result + "=NO BODY".yellow;
      } else if (err && !(endpoint == 'my/edit' && response_code == 500)) {
        if (response_code == '400' || response_code == '302') {
          return setTimeout(() =>
            http_request(account, endpoint, data, callback, method, json, retries+1), 1000);
        }
        result = "FAILURE" + " | " + result + ("=" + err.message).yellow;
      } else if (body && typeof body.success != 'undefined' && body.success != 1) {
        var error = (body.error) ? body.error.replace(/ /g, '').substr(0,30) : SteamCommunity.EResult[body.success];
        result = "FAILURE" + " | " + result + ("=" + error).yellow;
        if (error == 'NotLoggedOn') {
          account.user.webLogOn();
        }
      } else if (body && body.toString().indexOf("g_steamID = false;") > -1) {
        result = "FAILURE" + " | " + result + "=SteamIDIsFalse".yellow;
      } else {
        success = true;
        result = "SUCCESS" + " | " + result;
      }
    }
    if (!success || verbose == 1 || retries > 2) {
      log(account, result.replace('POST-', 'POST'.inverse + '-'));
    }
    if (callback !== null && (success || force)) {
      callback(body, response, err);
    }
  });
  return true;
}
//------------------------------------------------------------------------------ ReadlineExitHandler
(typeof readline == 'undefined' && account.index == 0) && (
  readline = require('readline').createInterface({ input: process.stdin, output: process.stdout }),
  readline.on('line', (input) =>
  eval(input))),
exit_handlers = [ save_config_files ],
exit_handlers.forEach((handler) =>
  handler())
//------------------------------------------------------------------------------ AccountLimitations
this.user.on('accountLimitations', (limited, communityBanned, locked, canInviteFriends) => {
  this.user.setPersona(SteamUser.EPersonaState.LookingToPlay);
  this.user.setUIMode(SteamUser.EClientUIMode.BigPicture);
  this.user.getSteamLevels([this.user.steamID], (results) => {
    this.friends_level = results[this.user.steamID];
    this.friends_max = 2000 - ((350 - Math.min(350, this.friends_level)) * 5);
    if (login_count == 0 || login_count == accounts.length+1 || communityBanned || locked) {
      this.log('SESSION | loggedOn: '+ ("https://steamcommunity.com/" + this.profile_url()).yellow
        + " | " + this.friends_level + "^" + this.friends_max + "="
        + (limited + "/" + communityBanned + "/" + locked).replace(
          /true/g, '1'.red).replace(/false/g, '0'.green));
    }
  });
});
if (this.user.limitations) {
  return finish(this);
}
this.user.once('accountLimitations', (limited, communityBanned, locked, canInviteFriends) => {
  this.user.limitations = { limited: limited };
});
//------------------------------------------------------------------------------ EmailOptOut
accounts[a].http_request('https://store.steampowered.com/account/emailoptout', { "action": "save", "opt_out_all": 1 })
//------------------------------------------------------------------------------ OldBatchStarter
REM del byteframe.js
REM xcopy /Y "Z:\\Work\node-byteframe\data-*.json" .
REM type Z:\Work\node-byteframe\node_share.js Z:\Work\node-byteframe\node_user.js Z:\Work\node-byteframe\node_chatbot.js Z:\Work\node-byteframe\node_games.js Z:\Work\node-byteframe\node_adventure.js Z:\Work\node-byteframe\node_byteframe.js Z:\Work\node-byteframe\node_activity_rater.js Z:\Work\node-byteframe\node_profile_commenter.js Z:\Work\node-byteframe\node_friend_log.js Z:\Work\node-byteframe\node_randomized_profile.js Z:\Work\node-byteframe\node_wishlister.js Z:\Work\node-byteframe\node_twitter.js Z:\Work\node-byteframe\node_status_poster.js > byteframe.js
REM node byteframe.js "Z:\\Work\node-byteframe\\"
cd ~/pdl-idler
DATE=$(date +%s)
LOCATION=/mnt/Datavault/Work/node-byteframe
mkdir -p backups/${DATE}
if [ -d ${LOCATION} ]; then
  cp ${LOCATION}/data-*.json .
  cp ${LOCATION}/../Steam/screenshots/sharedconfig.vdf .
  cp ${LOCATION}/../Steam/screenshots/760/screenshots.vdf .
  if [ ! -d text ]; then
    cp -R ${LOCATION}/text .
  fi
  if [ ! -d fortunes ]; then
    cp -R ${LOCATION}/fortunes .
  fi
  if [ ! -d rivescript ]; then
    cp -R ${LOCATION}/rivescript .
  fi
  if [ ! -d avatars ]; then
    cp -R ${LOCATION}/avatars .
  fi
  cp state-*.json ${LOCATION}
  cp ${LOCATION}/node_*.js .
fi
cp .js* backups/${DATE}
cat ./node_share.js \
  ./node_chatbot.js \
  ./node_user.js \
  ./node_byteframe.js \
  ./node_profile_commenter.js \
  ./node_friend_log.js \
  ./node_randomized_profile.js \
  ./node_activity_rater.js \
  ./node_twitter.js > byteframe.js
cat ./node_share.js ./misc/node_byteframe_test.js > byteframe_test.js
cp byteframe.js misc
cat errors.txt >> misc/errors.txt
echo > errors.txt
if [ ! -z ${1} ]; then
  node --expose-gc --inspect=newton:9229 byteframe_test.js
else
  node byteframe.js
fi
//------------------------------------------------------------------------------ OldBatchLines
mklink byteframe.bat Z:\\Work\node-byteframe\byteframe.bat
mklink config-byteframe.json Z:\\Work\node-byteframe\config-byteframe.json
mklink config-users.json Z:\\Work\node-byteframe\config-users.json
mklink data-adjectives.json Z:\\Work\node-byteframe\data-adjectives.json
mklink data-avatars.json Z:\\Work\node-byteframe\data-avatars.json
mklink data-byteframe.json Z:\\Work\node-byteframe\data-byteframe.json
mklink data-countries.json Z:\\Work\node-byteframe\data-countries.json
mklink data-decoration.json Z:\\Work\node-byteframe\data-decoration.json
mklink data-jokes.json Z:\\Work\node-byteframe\data-jokes.json
mklink data-performance-review.json Z:\\Work\node-byteframe\data-performance-review.json
mklink data-questions.json Z:\\Work\node-byteframe\data-questions.json
mklink config-friends.json Z:\\Work\node-byteframe\config-friends.json
mklink config-friends.diff Z:\\Work\node-byteframe\config-friends.diff
//------------------------------------------------------------------------------ LogSuspiciousChatEchos
friend_message_echo_handlers.push((steamid, msg, account) =>
  (msg.indexOf('http') > -1) &&
    fs.appendFileSync('hacked.txt', account.index + ": " + msg + "\n")),
//------------------------------------------------------------------------------ ApiKeys
(!accounts[a].apikey) && (
  accounts[a].apikey = true,
  http_request(accounts[a], 'https://steamcommunity.com/dev/revokekey', {}))
(check_bot_api = (i = 1) =>
  (i < 233) &&
    (a(i).limited) ?
      check_bot_api(i+1)
    :(http_request(a(i), 'https://steamcommunity.com/dev/revokekey', {}),
      setTimeout(() =>
        check_bot_api(i+1), 10000)))()
//------------------------------------------------------------------------------ CheckBotChatHistory
(check_bot_chat = (index = 1) =>
  (index < 224) &&
    http_request(a(index), 'https://help.steampowered.com/en/accountdata/GetFriendMessagesLog', {}, (body, response, err) => (
      body = Cheerio.load(body)('tr'),
      affected = false,
      [...Array(body.length).keys()].forEach((i) =>
        (body.eq(i).text().indexOf('¡') == 0 && body.eq(i).text().indexOf('http') > -1) && (
          affected = true)),
      (affected) && (
        console.log("ACCOUNT " + index)),
      setTimeout(() => check_bot_chat(index+1), 2000))))()
//------------------------------------------------------------------------------ DeauthorizeOther
http_request(a(i), 'https://store.steampowered.com/twofactor/manage_action', { action: 'deauthorize' })
//------------------------------------------------------------------------------ JQueryNicknameAndSub
(subscribe = (i) => {
  if (i == accounts.length) {
    return console.log('done');
  }
  jQuery.post('https://steamcommunity.com/comment/Profile/subscribe/' + accounts[i] + "/-1", {
    sessionid: g_sessionID, count: 6,
  });
  console.log('https://steamcommunity.com/profiles/' + accounts[i]);
  setTimeout(subscribe, 3000, i+1);
})(1);
(nickname = (i) => {
    if (i == accounts.length) {
    	return console.log('done');
    }
    jQuery.post("https://steamcommunity.com/profiles/" + accounts[i] + "/ajaxsetnickname/", {
    	sessionid: g_sessionID,
    	nickname: "[" + i + "]"
    });
	console.log('https://steamcommunity.com/profiles/' + accounts[i] );
	setTimeout(nickname, 2000, i+1);
})(1);
//------------------------------------------------------------------------------ Unsubscribe
(unsubscribe = (i) => {
  if (i == accounts.length) {
    return console.log('done');
  }
  http_request(accounts[0], 'comment/Profile/unsubscribe/' + accounts.steamID + "/-1", { count: 6});
  console.log('https://steamcommunity.com/profiles/' + accounts.steamID);
  setTimeout(unsubscribe, 1000, i+1);
})(1);
//------------------------------------------------------------------------------ BanBlockBatch
accounts.forEach((accounts[a], i) =>
  setTimeout(() => (
    Object.keys(accounts[a].user.myFriends).forEach((friend) =>
      accounts[a].community.getSteamUser(new SteamCommunity.SteamID(friend), (err, user) =>
       (user.customURL != null && user.customURL.indexOf('byte') == 0) &&
         accounts[a].user.removeFriend(friend))),
    accounts[a].user.blockUser('76561197976737508')), 5000*i))
//------------------------------------------------------------------------------