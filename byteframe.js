repl = require('repl'),
verbose = false,
fs = require('fs'),
(process.platform === 'win32') ?
  dir_path = 'D:/'
: dir_path = '/mnt/Datavault',
colors = require('colors'),
Cheerio = require('cheerio'),
Crypto = require('crypto'),
SteamUser = require('steam-user'),
SteamCommunity = require('steamcommunity'),
SimpleVDF = require('simple-vdf'),
haiku = require('haiku-random'),
random_name = require('node-random-name'),
data = JSON.parse(fs.readFileSync('./data.json', 'utf-8')),
state = JSON.parse(fs.readFileSync('./state.json', 'utf8')),
save_state_files = () => (
  fs.renameSync('./state.json', './state-backup.json'),
  fs.writeFileSync('./state.json', JSON.stringify(state, null, 2))),
exiting = false,
process.on('SIGINT', (code) =>
  (!exiting) && (
    exiting = true,
    save_state_files(),
    console_log('SESSION | ending process: ' + (""+Math.floor(process.uptime()))),
    setTimeout(process.exit, 3000, 0))),
console_log = (output, date = new Date()) =>
  console.log((('[' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + '] ').magenta + output).replace(
    'SUCCESS', 'SUCCESS'.green.bold.reset).replace(
    'FAILURE', 'FAILURE'.red.bold.reset).replace(
    'MESSAGE', 'MESSAGE'.cyan.bold.reset).replace(
    'SESSION', 'SESSION'.blue.bold.reset)),
pad = (i, zeros = "00") =>
  (zeros + i).substr(-zeros.length, zeros.length),
base64 = (data) =>
  new Buffer(data).toString('base64'),
html_convert = (text) =>
  text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#039;', '\''),
translate_id = (cid) =>
  '765' + (+cid + 61197960265728),
byte_length = (str, m = encodeURIComponent(str).match(/%[89ABab]/g)) =>
  str.length + (m ? m.length : 0),
split_words = (s,
  middle = Math.floor(s.length / 2),
  before = s.lastIndexOf(' ', middle),
  after = s.indexOf(' ', middle + 1)) => (
  middle = (middle - before < after - middle ? before : after),
  [ s.substr(0, middle), s.substr(middle + 1) ]),
font = (input, f, output = '') => (
  [...Array(input.length).keys()].forEach((item, i) =>
    (data.fonts[f][input[i]] !== undefined) ?
      output += data.fonts[f][input[i]]
    : output += input[i]),
  output),
emoticon_convert = (text) => (
  text = text.replace(/ː/g, ':').replace(/:[0-9a-zA-Z_]+:/g, () => pool(pool(data.emojis, 1, null)[0])),
  data.emojis.index = 0,
  text),
diff_array = (array1, array2) =>
  array1.filter((i) => array2.indexOf(i) < 0),
shuffle_array = (array) => (
  [...Array(array.length).keys()].reverse().slice(0, -1).forEach((item, i) =>
    ((j = Math.floor(Math.random()*(item + 1)), t = array[item]) => (
      array[item] = array[j],
      array[j] = t))()),
  array),
shuffle_string = (s) =>
  shuffle_array(s.split("")).join(""),
pool = (pool, length = 1, join = '', elements = []) => (
  (!pool.hasOwnProperty('index')) && (
    pool.index = 0),
  [...Array(length).keys()].forEach((item, i) => (
    (pool.index === 0) &&
      shuffle_array(pool),
    elements.push(pool[pool.index]),
    (++pool.index == pool.length) && (
      pool.index = 0))),
  (join !== null) ?
    elements.join(join)
  : elements),
http_request = (account, endpoint, form = null, callback = null, force = false, method = (form != null ? 'POST' : 'GET'), retries = 0) => (
  (form != null && typeof form !== 'string') ?
    form.sessionid = account.community.getSessionID() : null,
  account.community.httpRequest({
    "uri": (endpoint.indexOf('http') == -1 ? 'https://steamcommunity.com/' + endpoint : endpoint).replace("/my/", "/" + profile_url(account) + "/"),
    "method": method,
    "form": (typeof form == 'string' ? 'sessionID=' + account.community.getSessionID() + form : form),
    "json": true,
    "encoding": (endpoint.slice(-4) == '.jpg' ? null : 'utf8')
  }, (err, response, body,
    success = false,
    response_code = (!response ? '999' : response.statusCode.toString()),
    result = endpoint + ": " + (method + '-' + response_code).yellow) => (
    (err && err.message == 'Malformed JSON response') ?
      err = 0 : null,
    (!response) ?
      result = "FAILURE | " + result + '=NO RESPONSE'.yellow
    : (!body && response_code != '302' && response_code != '200') ?
      result = "FAILURE | " + result + "=NO BODY".yellow
    : (err && !(endpoint == 'my/edit' && response_code == 500)) ?
      (retries < 3 && (response_code == '400' || response_code == '302')) ?
        setTimeout(() =>
          http_request(account, endpoint, form, callback, force, method, retries+1), 1000)
      : result = "FAILURE | " + result + (" # " + err.message).yellow
    : (body && typeof body.success != 'undefined' && body.success != 1) ?
        ((error = (body.error) ? body.error.replace(/ /g, '').substr(0,30) : SteamCommunity.EResult[body.success]) => (
          result = "FAILURE | " + result + ("=" + error).yellow,
          (error == 'NotLoggedOn') &&
            account.user.webLogOn()))()
    : (body && body.toString().indexOf("g_steamID = false;") > -1) ?
      result = "FAILURE | " + result + "=SteamIDIsFalse".yellow
    : (success = true,
      result = "SUCCESS | " + result),
    (!success || verbose) &&
      log(account, result.replace('POST-', 'POST'.inverse + '-')),
    (callback !== null && (success || force)) &&
      callback(body, response, err)))),
accounts = [],
a = (a) =>
  accounts.find((account) => account.index == a),
state.accounts.forEach((account, i) =>
  (i < 121 || i > 200 || i == 133) &&
    accounts.push({name: account.name, pass: account.pass, mail: account.mail, steamID: account.steamID, index: i})),
accounts = [ accounts[0] ].concat(shuffle_array(accounts.slice(1,96).concat(accounts.slice(101,197)).concat(accounts.slice(201,233)))),
login = (account, delay = 0) =>
  (!account.user.steamID) &&
    setTimeout((login_details = { "rememberPassword": (account.index == 0 ? true : false), "accountName": account.name }) => (
      (state.accounts[account.index].key && account.index == 0) ?
        login_details.loginKey = state.accounts[account.index].key
      : login_details.password = state.accounts[account.index].pass,
      account.user.logOn(login_details)), delay),
accounts.forEach((account, i) => (
  account.free_games = [],
  account.auth_code = '',
  account.limited = (account.index > 120 && account.index < 20 && account.index != 133) ? true : false,
  account.user = new SteamUser({ "dataDirectory": null, "promptSteamGuardCode": (account.index == 0 ? true : false), "autoRelogin": false }),
  (fs.existsSync('share/' + account.name + '-ssfn')) ?
    account.user.setSentry(Crypto.createHash('sha1').update(fs.readFileSync('share/' + account.name + '-ssfn')).digest())
  : (fs.existsSync('share/ssfn')) &&
    account.user.setSentry(Crypto.createHash('sha1').update(fs.readFileSync('share/ssfn')).digest()),
  account.user.on('sentry', (sentry) =>
    fs.writeFileSync('share/' + account.name + '-ssfn', sentry)),
  (account.index != 0) &&
    account.user.on('steamGuard', (domain, callback) =>
      (get_gmail_guard = (retries = 0) =>
        (retries < 3) &&
          setTimeout(() => get_gmail(account, (err, gmails, code) =>
            (code = search_gmail(gmails, /\r\n\r\n[A-Z0-9]{5}/).trim()) ? (
              account.auth_code = code,
              callback(code))
            : get_gmail_guard(retries+1)), 3000))()),
  account.community = new SteamCommunity(),
  account.community.on('sessionExpired', (err) => (
    log(account, 'FAILURE | sessionExpired: ' + err),
    account.user.webLogOn())),
  account.user.on('webSession', (sessionID, cookies) => (
    account.community.setCookies(cookies),
    (!account.badges && "badgefarming" == '666') &&
      http_request(account, 'my/badges', null, (body, response, err,
        links = Cheerio.load(body)('a.btn_green_white_innerfade')) => (
        account.badges = [],
        (links.length > 0) &&
          links.each((i, link) =>
            account.badges.push(+link.attribs.href.substr(12))))))),
  account.user.on('error', (err) => (
    log(account, 'FAILURE | error: ' + err.message.yellow),
    (err.message == 'InvalidPassword') ?
      delete state.accounts[account.index].key
    : (err.message == 'LogonSessionReplaced') &&
      login(account, 5000))),
  account.user.on('loggedOn', (details, parental) => (
    (account.index != 0) && (
      account.user.setPersona(SteamUser.EPersonaState.Online),
      replicant_profile.gamesPlayed.slots[0][0](account)),
    (verbose) &&
      log(account, 'SESSION | loggedOn: '+ (account.auth_code + " https://steamcommunity.com/" + profile_url(account) + " #" + i).trim().yellow))),
  account.user.on('friendRelationship', (steamid, relationship) => (
    (relationship != 2) &&
      setTimeout((account) =>
        log(account, 'SESSION | friend: ' + (SteamUser.EFriendRelationship[relationship].toUpperCase().inverse + "=\"" + find_name(account, steamid) + '", ' + "https://steamcommunity.com/profiles/" + steamid).yellow), 3000, account),
    (account.index != 0 && relationship == 2) &&
      account.user.addFriend(steamid))),
  account.chats = [],
  account.user.on('friendMessageEcho', (steamid, msg) => (
    log_chat(steamid, "^^", msg, account.index, find_name(account, steamid)),
    friend_message_echo_handlers.forEach((item) =>
      item(steamid, msg, account)))),
  account.user.on('friendMessage', (steamid, msg) => (
    (account.chats.indexOf(steamid.toString()) == -1 && steamid.toString() != accounts[0].steamID) &&
      account.chats.push(steamid.toString()),
    (account.index != 0 || !accounts.find((account) => account.steamID == steamid)) &&
      log_chat(steamid, "<<", msg, account.index, find_name(account, steamid)),
    (state.steamid_chat_blacklist.indexOf(steamid.toString()) == -1) &&
      friend_message_handlers.forEach((item) =>
        item(steamid, msg, account)))))),
accounts[0].user.on('loginKey', (key) =>
  state.accounts[accounts[0].index].key = key),
login(accounts[0]),
login(accounts[1]),
accounts[0].user.on('groupRelationship', (gid, relationship) =>
  (relationship == SteamUser.EClanRelationship.Invited) &&
    accounts[0].user.respondToGroupInvite(gid, false)),
ban = (steamid) => (
  accounts.forEach((account) => account.user.removeFriend(steamid)),
  (state.steamid_blacklist.indexOf(steamid) == -1) &&
    state.steamid_blacklist.push(steamid)),
find_name = (account, steamid) =>
  (typeof account.user.users[steamid] != 'undefined' ? account.user.users[steamid].player_name : steamid),
profile_url = (account) =>
  (account.user.vanityURL ? 'id/' + account.user.vanityURL : 'profiles/' + account.steamID),
log = (account, output) =>
  console_log(output.replace('|', '|' + (account.index == 0 ? pad(account.index, "000").gray.inverse : pad(account.index, "000").gray) + '|')),
log_chat = (steamid, vector, msg, index = 0, player_name = steamid) =>
  console_log("MESSAGE |" + (index == 0 ? '000'.gray.inverse : pad(index, "000").gray) + "| " + vector + " [" + player_name + "] " + vector + " " + msg + ": " + Date.now().toString().yellow),
send_chat = (account, steamid, reply, speed = 80) => (
  account.active_chat = true,
  account.user.chatTyping(steamid),
  setTimeout(() => (
    account.active_chat = false,
    account.user.chatMessage(steamid, reply),
    log_chat(steamid, ">>", reply, account.index, find_name(account, steamid))), Math.max(Math.min(reply.length, 75)*speed, 2000)+1000)),
friends_list = (account, endpoint, callback) =>
  http_request(account, endpoint, {}, (body, response, err, steamids = []) => (
    body = body.match(/data-steamid="765611[0-9]*"/g),
    (body) &&
      body.forEach((item, index) =>
        steamids.push(item.slice(14, -1))),
    callback(steamids))),
post_comment = (account, steamid, text, type = 0, post_id = -1, callback) => (
  (type == 1) ?
    type = 'UserStatusPublished'
  :(type == 2) ?
    type = 'UserReceivedNewGame'
  : type = 'Profile',
  http_request(account, 'comment/' + type + '/post/' + steamid + '/' + post_id, { comment: text, count: 6 }, (body, response, err) =>
    callback(body))),
follow = (account, id, action = 'follow') =>
  http_request(account, 'profiles/' + id + '/' + action + "user/", {}),
post_status = (account, text, appid) =>
  http_request(account, "my/ajaxpostuserstatus", { status_text: (account.index == 0 ? text : emoticon_convert(text)), appid: appid }, (body, response, err) =>
    log(account, 'SUCCESS | ajaxpostuserstatus: ' + ('https://steamcommunity.com/' + profile_url(account) + '/status/' + body.blotter_html.match(/userstatus_\d+_/)[0].slice(11, -1)).yellow)),
edit_text = (account, publishedfileid, title, description = '') =>
  http_request(account, 'sharedfiles/itemedittext?' + publishedfileid, { id: publishedfileid, language: 0, title: title, description: description }),
edit_group = (account, group, headline, group_form) =>
  http_request(account, 'groups/' + group + '/edit', '&' + group_form.replace(
    /&headline=.*&summary=/, '&headline=' + headline + '&summary=')),
friends_check = (account,
  friends = Object.keys(account.user.myFriends).filter((friend) =>
    account.user.myFriends[friend] == 3 || account.user.myFriends[friend] == 6),
  lines = (action, players, callback, date = new Date()) =>
    (!players.length) ?
      callback()
    : account.user.getPersonas(players, (err, personas) => (
      (typeof personas == 'undefined') ?
        personas = err : null,
      Object.keys(personas).forEach((persona) =>
        state.accounts[account.index].friends_diff.push([
          date.getFullYear() + "-" + pad(date.getMonth()+1) + "/" + pad(date.getDate()) +
            "-" + pad(date.getHours()) + ":" + pad(date.getMinutes()),
          action, friends.length, persona, personas[persona].player_name.replace(
            /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '') ] )),
      state.accounts[account.index].friends_diff = state.accounts[account.index].friends_diff.slice(-100),
      callback()))) =>
  (friends.length) &&
    (!state.accounts[account.index].hasOwnProperty('friends_diff')) ? (
      state.accounts[account.index].last_friends = [],
      state.accounts[account.index].friends_diff = [])
    : ((removed = diff_array(state.accounts[account.index].last_friends, friends),
      added = diff_array(friends, state.accounts[account.index].last_friends)) =>
      lines(false, removed, () =>
        lines(true, added, () =>
          (added.length || removed.length) ?
            state.accounts[account.index].last_friends = friends: null)))(),
VoteUp = (account, _item_id, item_id = _item_id.slice(0, -2)) =>
  http_request(account, 'sharedfiles/voteup?' + item_id , { id: item_id , appid: 0 }, (body, response, err) =>
    vote(account), true),
VoteUpCommentThread = (account, _thread, thread = _thread.slice(1, -3).split('_')) =>
  http_request(account, 'comment/' + thread[0] + '/voteup/' + thread[1] + '/' + thread[2] + "/",
    { vote: 1, count: thread[0] == 'UserReceivedNewGame' ? 3 : 6, newestfirstpagination: true }, (body, response, error) =>
      vote(account), true),
vote = (account, delay = Math.random()*(14000-7000)+7000) =>
  (account.votes.length > 0) &&
    setTimeout((account, item = account.votes.shift().split('(')) =>
      eval(item[0])(account, item[1]), delay, account),
activity_rater = (account) => (
  (!account.votes) ? (
    account.votes = [],
    account.cycles = 0)
  : (++account.cycles % 8 == 0) && (
    account.blotter_url = ''),
  http_request(account, 'my/ajaxgetusernews/' + account.blotter_url, null, (body, response, err,
  init = (account.votes.length > 0) ? false : true) => (
    account.blotter_url = body.next_request.substr(body.next_request.indexOf('?')),
    body = Cheerio.load(body.blotter_html),
    body('div.blotter_block').filter((index, element) =>
      (body(element).text().toLowerCase().indexOf("a workshop item") > -1
      || body(element).text().toLowerCase().indexOf("a guide for") > -1
      || body(element).text().toLowerCase().indexOf("a collection for") > -1) ?
        false
      : true
    ).find('[id^="vote_up_"]').not(".active").each((index, _element,
      element = _element.attribs.onclick.substr(7).replace("\'", "'")) =>
      (account.votes.indexOf(element) == -1) &&
        account.votes.push(element)),
    (init) &&
      vote(account, 0)))),
RiveScript = require("rivescript"),
riveScript = new RiveScript(),
(load_rivescript = (callback = null) => (
  console_log("SESSION |" + '000'.gray.inverse + "| loading rivescript: " + ("files=" + fs.readdirSync('./rivescript').length).yellow),
  riveScript.loadDirectory('./rivescript', () => (
    riveScript.sortReplies(),
    friend_message_echo_handlers.push((steamid, msg, account) =>
      (handle_message_echo(steamid, msg)) &&
        send_chat(account, steamid, get_reply(steamid, msg.substr(2)))),
    friend_message_handlers.push((steamid, msg, account) =>
      (steamid != accounts[0].steamID && incoming_message_event(steamid, msg, account, reply = get_reply(steamid, msg))) && (
        send_chat(account, steamid, reply),
        ("chat_relay" == "666") &&
          account.user.chatMessage(accounts[0].steamID, font(reply, 14)))),
    (callback) ?
      callback() : null))))(),
generate_random_response = () => pool([
  () => generate_halflife(data.vortigaunt, 50, 60),
  () => generate_halflife(data.overwatch, 100, 230),
  () => generate_halflife(data.soldiers, 50, 60),
  () => generate_fortune('zippy'),
  () => generate_gossip(),
  () => pool(data.confusion),() => pool(data.confusion),() => pool(data.confusion),
  () => get_reply('', 'ask me a question'),
  () => get_reply('', 'imponderables') ], 1, null)[0](),
get_reply = (steamid, msg) =>
  (riveScript.reply(steamid, msg).replace(/<oob>.*<\/oob>/, '').replace(
    /  random/g, ' ').replace(/  /g, ' ').replace('}', '').trim().replace(
    'pdlrand', 'PDLRAND').replace(/pdlrand/g, '') || "PDLRAND").replace('PDLRAND', generate_random_response()),
test_chat_message = (msg) => 
  (msg.search(/http[s]?:\/\//) == -1 && msg != 'Invited you to play a game!' && msg.search(/LINK REMOVED/) == -1),
incoming_message_event = (steamid, msg, account) => (
  msg = msg.replace(/:[a-zAZ0-9_]+:/g, '').replace(
    /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, ''),
  (!account.active_chat && msg != '' && (account.index == 0 || Math.floor(Math.random()* 15) != 0)
  && msg.search(/[!@#$%^&*]/) != 0 && (account.index == 0 || test_chat_message(msg))
  && !accounts.find((account) => account.steamID == steamid)) ? (
    (riveScript.getUservar(steamid, 'chat_time') == 'undefined') && (
      [ 'first', 'second', 'third', 'fourth', 'fifth' ].forEach((topic) =>
        riveScript.setUservar(steamid, topic, pool(data.chat_topics))),
      riveScript.setUservar(steamid, 'chat_time', 0),
      riveScript.setUservar(steamid, 'name', pool(data.chat_names))),
    (Date.now() - riveScript.getUservar(steamid, 'chat_time') > 3600000) &&
      true)
  : false),
friend_message_handlers = [ (steamid, msg, account, target = (msg[0] == '^' ? account.chats[+msg.match(/^[^]\d+/)[0].substr(1)] : account.chats[account.chats.length-1])) =>
  (account.index != 0) && (
    (msg.indexOf('https://t.co') > -1) ?
      ban(steamid)
    : (steamid != accounts[0].steamID && test_chat_message(msg)) ?
      ("chat_relay" == "666") &&
        account.user.chatMessage(accounts[0].steamID, account.chats.indexOf(steamid.toString()) + "| " + find_name(account, steamid) + ": " + msg)
    : (account.user.chatMessage(target, msg.replace(/^[^]\d+/, '')),
      handle_message_echo(target, msg))) ],
friend_message_echo_handlers = [],
handle_message_echo = (steamid, msg) =>
  (msg.indexOf('#!') == 0) ?
    true
  : (msg.indexOf('##') == 0) ?
    !riveScript.setUservar(steamid, 'chat_time', 0)
  : (msg.indexOf('#$') == 0) ?
    !riveScript.setUservar(steamid, 'chat_time', Date.now())
  : false,
strangers = [],
force_steamid = null,
profile_commenter = (account, check_replies = false,
  friends = shuffle_array(Object.keys(account.user.myFriends).filter((friend) =>
    (account.user.myFriends[friend] == 3 || account.user.myFriends[friend] == 6) && !accounts.find((account) =>
      account.steamID == friend))).map((friend) =>
        [ '', friend ]),
  day = new Date().getUTCDay(),
  post = (steamids, unique = false, steamid = steamids.shift()) =>
    (typeof steamid == 'undefined') ?
      profile_commenter(account, check_replies, friends)
    : (state.steamid_blacklist.indexOf(steamid[1]) > -1) ?
        post(steamids, unique)
      : http_request(account, 'profiles/' + steamid[1] + '/allcomments', null, (body, response, err) =>
        (body.indexOf('commentthread_textarea') == -1) ?
          post(steamids, unique)
        : ((comments = body.match(/commentthread_author_link" href="https:\/\/.*?"/g)) => (
          (steamid[0] != '') ?
            state.accounts[account.index].replies.push(steamid[0]) : null,
          (account.index == 0 && force_steamid == null && comments && comments.splice(0,6).join(" ").indexOf('steamcommunity.com/' + profile_url(account)) > -1) ?
            post(steamids, unique)
          : (try_comment_message = (comment_message = comment_messages[pool(comment_messages_indexes)]
            , player = body.match(/<title>.*<\/title>/)[0].slice(26,-28)
            , msg = (account.index == 0) ? comment_message(player) : emoticon_convert(comment_message(player))) =>
            (byte_length(msg) > 925 || msg.trim().length < 1) ?
              try_comment_message(comment_message, player)
            : post_comment(account, steamid[1], msg, 3, -1, () => (
              state.accounts[account.index].post_free--,
              state.accounts[account.index].last_steamid = steamid[1],
              (!verbose) &&
                log(account, 'SUCCESS | post: ' + ('https://steamcommunity.com/' + body.match(/"whiteLink" href=".*"/)[0].slice(45,-1) + ' -- "' + player + '"' + " {" + state.last_profiles.length + "},/" + strangers.length + "/" + steamid[0]).yellow),
              (unique) &&
                state.last_profiles.push(steamid[1]))))()))())) => (
  friends.push([ '', account.steamID ]),
  (!('day' in state.accounts[account.index])) ? (
    state.accounts[account.index].day = day,
    state.accounts[account.index].post_free = 180,
    state.accounts[account.index].replies = [])
  : (state.accounts[account.index].day != day) && (
    state.accounts[account.index].day = day,
    state.accounts[account.index].post_free = 180),
  (state.accounts[account.index].post_free > 0) &&
    (force_steamid != null && (!account.limited || friends.indexOf(force_steamid) != -1) ?
      post([ [ '', force_steamid ] ].concat(friends))
    : (!strangers.length) ?
      friends_list(account, 'profiles/' + state.last_profiles[Math.floor(Math.random()*state.last_profiles.length)] + "/friends", (steamids) => (
        steamids.forEach((item, index) =>
          (state.last_profiles.indexOf(item) == -1) &&
            strangers.push(['', item ])),
        profile_commenter(account, check_replies, friends)))
    : (check_replies) ?
      http_request(account, 'my/allcomments', null, (body, response, err,
        comments = Cheerio.load(body)('div.commentthread_comment_author').toArray().reverse().map((_item, index, undefined, item = Cheerio.load(_item)) =>
          [ item('a.actionlink')[0].attribs.href.substr(73, 19).match(/\d+/g)[0], translate_id(item('a.commentthread_author_link')[0].attribs['data-miniprofile']) ])) =>
        profile_commenter(account, false, comments.filter((item1, index1) =>
          state.accounts[account.index].replies.indexOf(item1[0]) == -1 && comments.findIndex((item2, index2) =>
            index1 < index2 && item1[1] == item2[1]) == -1).concat(friends)))
    : (account.limited || account.index == 0) ?
      post(friends)
    : post(strangers, true))),
generate_hashtags = (hashtags = data.hashtags) =>
  pool(pool(data.emojis, 1, null)[0]) + " " + pool(hashtags, hashtags.length, ' ').replace(/ /g, ()=> ' ' + pool(pool(data.emojis, 1, null)[0]) + ' ') + ' ' + pool(pool(data.emojis, 1, null)[0]),
Twitter = require('twitter'),
twitter = new Twitter({
  consumer_key: state.twitter_consumer_key,
  consumer_secret: state.twitter_consumer_secret,
  access_token_key: state.twitter_access_token_key,
  access_token_secret: state.twitter_access_token_secret }),
twitter_request = (method, endpoint, form = {}, callback = null) =>
  twitter[method.toLowerCase()](endpoint, form, (err, body, response,
    result = endpoint + ": " + (method + '-' + response.statusCode.toString()).yellow) => (
    (err) ?
      result = "FAILURE |" + "000".gray.inverse + "| " + result + ("=" + err.message).yellow
    :(result = "SUCCESS |" + "000".gray.inverse + "| " + result,
      (callback !== null) &&
        callback(err, body, response)),
    (result.indexOf('FAILURE') > -1 || verbose) &&
      console_log(result.replace('POST-', 'POST'.inverse + '-')))),
wain_images = fs.readdirSync("./images/wain"),
select_screenshots = (length, results = [], screenshot = pool(twitter_screenshots, 1, null)[0]) =>
  (results.length == length) ?
    results
  :((screenshot.width === screenshot.height) &&
      results.push(dir_path + '/Image/Steam/remote/' + screenshot.filename),
    select_screenshots(length, results)),
imagemagick = require('imagemagick'),
im_combine = (args, files, output, callback = null) =>
  imagemagick.convert(args.concat(files).concat([output]), (err, stdout) =>
    (err) ?
      console.error(err)
    : (callback != null) &&
      callback(err, stdout)),
twitter_description = (
  text = "Unemployed frycook/bot who makes VR environments in #source2\n\n"
    +  pool(data.emojis[0]) + ' ' + generate_halflife(data.soldiers, 10) + ' ' + pool(data.emojis[1]) + ' ' + generate_halflife(data.soldiers, 10) + ' ' + pool(data.emojis[2]) + ' ' + generate_halflife(data.soldiers, 10) + ' ' + pool(data.emojis[3])) =>
  (text.length > 160) ?
    twitter_description()
  : text,
twitter_profile = (account, twitter_name, background_url, avatar_url, location) =>
  im_combine(['+append', '-resize', 'x250' ], select_screenshots(6), './im_out-1.jpg', (err1, stdout1) =>
    im_combine(['+append', '-resize', 'x250' ], select_screenshots(6), './im_out-2.jpg', (err2, stdout2) =>
      im_combine([ '-append' ], [ './im_out-1.jpg', './im_out-2.jpg' ], 'im_out-twitter.jpg', (err3, stdout3) => 
        twitter_request('POST', 'account/update_profile_banner.json', { banner: base64(fs.readFileSync('./im_out-twitter.jpg')) }, (err, body, response) =>
          twitter_request('POST', 'account/update_profile_image.json', { image: base64(fs.readFileSync(dir_path + '/Work/node-byteframe/images/wain/' + pool(wain_images))) }, (err, body, response) => (
            fs.unlinkSync('im_out-1.jpg'),
            fs.unlinkSync('im_out-2.jpg'),
            fs.unlinkSync('im_out-twitter.jpg'),
            twitter_request('POST', 'account/update_profile.json', {
              name: twitter_name,
              url: 'https://steamcommunity.com/id/byteframe/myworkshopfiles/?appid=250820',
              location: location.replace(', Items Up For Trade', '').replace(', Artwork Showcase', ''),
              description: twitter_description(),
              profile_link_color: ((letters = '0123456789ABCDEF', color = '') =>
                letters[Math.floor(Math.random() * 16)] + letters[Math.floor(Math.random() * 16)]
                + letters[Math.floor(Math.random() * 16)] + letters[Math.floor(Math.random() * 16)]
                + letters[Math.floor(Math.random() * 16)] + letters[Math.floor(Math.random() * 16)])()}))))))),
screenshots_vdf = SimpleVDF.parse(fs.readFileSync(dir_path + '/Image/Steam/screenshots.vdf', 'utf8')).Screenshots,
twitter_screenshots = [],
tumblr_screenshots = [],
imgur_screenshots = [],
Object.keys(screenshots_vdf).forEach((gameid) =>
  (gameid != 'shortcutnames') &&
    Object.keys(screenshots_vdf[gameid]).forEach((screenshot) =>
      (screenshots_vdf[gameid][screenshot].Permissions == '8') && (
        (state.screenshots_twitter.indexOf(screenshots_vdf[gameid][screenshot].hscreenshot) == -1) &&
          twitter_screenshots.push(screenshots_vdf[gameid][screenshot]),
        (state.screenshots_imgur.indexOf(screenshots_vdf[gameid][screenshot].hscreenshot) == -1) &&
          imgur_screenshots.push(screenshots_vdf[gameid][screenshot]),
        (state.screenshots_tumblr.indexOf(screenshots_vdf[gameid][screenshot].hscreenshot) == -1) &&
          tumblr_screenshots.push(screenshots_vdf[gameid][screenshot])))),
screenshot_twitter = (screenshot = twitter_screenshots.shift()) =>
  twitter_request('POST', 'media/upload', { media: fs.readFileSync(dir_path + '/Image/Steam/remote/' + screenshot.filename) }, (err, body, response) => (
    console_log("SUCCESS |" + '000'.gray.inverse + "| media/upload: ".reset + screenshot.filename.yellow),
    twitter_request('POST', 'statuses/update', { status: generate_hashtags(), media_ids: body.media_id_string }, (err, body, response) =>
      state.screenshots_twitter.push(screenshot.hscreenshot)))),
twitter_videos = [],
Object.keys(state.videos).forEach((videoid) =>
  (!state.videos[videoid].tweeted) &&
    twitter_videos.push(videoid)),
shuffle_array(twitter_videos),
video_twitter = (videoid = twitter_videos.shift()) =>
  (typeof videoid != 'undefined') &&
    twitter_request('POST', 'statuses/update', { status: generate_hashtags() + "\n\n" + state.videos[videoid].link_url }, (err, body, response) => (
      console_log("SUCCESS |" + '000'.gray.inverse + "| statuses/update: ".reset + state.videos[videoid].title.yellow),
      state.videos[videoid].tweeted = true)),
tumblr = require("tumblr.js").createClient({
  consumer_key: state.tumblr_consumer_key,
  consumer_secret: state.tumblr_consumer_secret,
  token: state.tumblr_token,
  token_secret: state.tumblr_token_secret }),
screenshot_tumblr = (screenshot = tumblr_screenshots.shift()) =>
  tumblr.createPhotoPost('byteframe', { "tags": shuffle_array(data.hashtags).join(','), "data64": base64(fs.readFileSync(dir_path + '/Image/Steam/remote/' + screenshot.filename)) }, (err) =>
    (!err) ?
      state.screenshots_tumblr.push(screenshot.hscreenshot)
    : console.dir(err)),
imgur = require('imgur'),
imgur.setCredentials(state.imgur_account, state.imgur_password, state.imgur_id),
screenshot_imgur = (screenshot = imgur_screenshots.shift()) =>
  imgur.uploadFile(dir_path + '/Image/Steam/remote/' + screenshot.filename, null, screenshot.filename, emoticon_convert(generate_big_fortune(Math.floor(Math.random()*(500-250)+250))  + "\n\n" + data.hashtags.join(" | ") + "\n\n" + JSON.stringify(screenshot))).then((json) =>
    state.screenshots_imgur.push(screenshot.hscreenshot)
  ).catch((err) =>
    console.error(err.message)),
shuffle_array(twitter_screenshots),
shuffle_array(tumblr_screenshots),
shuffle_array(imgur_screenshots),
prep_randomize_profile = (account, profile, callback = null,
  alter_showcase = (showcase, callback, id = 0) =>
    (profile.hasOwnProperty(showcase) && (id == 0 || profile.showcases.selection.indexOf(id) > -1)) && (
      profile[showcase].selection = [],
      (profile[showcase].shuffle_slots.length) &&
        ((to_shuffle = []) => (
          profile[showcase].shuffle_slots.forEach((slot) =>
            to_shuffle.push([profile[showcase].slots[slot], profile[showcase].shuffle_types[slot]])),
          shuffle_array(to_shuffle),
          profile[showcase].shuffle_slots.forEach((slot, i) => (
            profile[showcase].slots[slot] = to_shuffle[i][0],
            profile[showcase].shuffle_types[slot] = to_shuffle[i][1]))))(),
      profile[showcase].slots.forEach((slot, i) =>
        (slot.length > 0 && typeof profile[showcase].shuffle_types[i] !== 'undefined') &&
          ((element) => (
            (profile[showcase].shuffle_types[i] === 0) ?
              element = slot[Math.floor(Math.random()*slot.length)]
            : (profile[showcase].shuffle_types[i] < 0) ? (
              (profile[showcase].shuffle_types[i] == -1) &&
                shuffle_array(slot),
              element = slot[Math.abs(profile[showcase].shuffle_types[i])-1],
              profile[showcase].shuffle_types[i]--,
              (Math.abs(profile[showcase].shuffle_types[i])-1 == slot.length) && (
                profile[showcase].shuffle_types[i] = -1))
            : (profile[showcase].shuffle_types[i] > 0) && (
              element = slot[profile[showcase].shuffle_types[i]-1],
              profile[showcase].shuffle_types[i]++,
              (profile[showcase].shuffle_types[i]-1 == slot.length) && (
                profile[showcase].shuffle_types[i] = 1)),
            ({}.toString.call(element) === '[object Function]') && (
              element = element(account, profile.lite)),
            profile[showcase].selection[i] = element,
            (typeof element === 'string') && (
              (profile.lite) && (
                element = emoticon_convert(element)),
              element = encodeURIComponent(element)),
            callback(i, element)))()))) =>
  (typeof state.accounts[account.index].backgrounds == 'undefined') ? (
    http_request(account, 'https://steamcommunity.com/' + profile_url(account) + '/ajaxgetplayerbackgrounds', {}, (body, response, err) => (
      state.accounts[account.index].backgrounds = [],
      (body.data.profilebackgroundsowned) &&
        body.data.profilebackgroundsowned.forEach((background) =>
          (background.name.indexOf('Summer 2019') == -1) &&
            state.accounts[account.index].backgrounds.push({
              id: background.communityitemid,
              appid: background.appid,
              game: body.data.backgroundappnames[background.appid],
              name: background.name,
              image: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/" + background.image_large })),
      prep_randomize_profile(account, profile, callback)), true, 'POST', 3))
  :(account.avatar = pool(data.avatars, 1, null)[0],
    account.edit = '&type=profileSave&weblink_1_title=&weblink_1_url=&weblink_2_title=&weblink_2_url=&weblink_3_title=&weblink_3_url=',
    (state.accounts[account.index].backgrounds.length > 0) &&
      alter_showcase('background', (i, element) =>
        account.edit += "&profile_background=" + element.id),
    (account.user.playingState.blocked && profile.persona_name.hasOwnProperty('selection')) ?
      account.edit += "&personaName=" + profile.persona_name.selection[0]
    : alter_showcase('persona_name', (i, element) =>
      account.edit += "&personaName=" + element),
    alter_showcase('real_name', (i, element) =>
      account.edit += "&real_name=" + element),
    alter_showcase('countries', (i, element, state_index = Math.floor(Math.random()*element[1].length)) => (
      account.edit += "&country=" + element[0],
      (element[1].length) ? (
        account.edit += "&state=" + element[1][state_index][0],
        (element[1][state_index][1].length) ?
          account.edit += "&city=" + element[1][state_index][1][Math.floor(Math.random()*element[1][state_index][1].length)]: null): null)),
    (!profile.hasOwnProperty('custom_url')) ?
      account.edit += "&customURL=" + profile_url(account).replace(/.*?\//, '')
    : account.edit += "&customURL=" + profile.custom_url,
    account.edit += "&profile_showcase_style_5=1",
    alter_showcase('badge_favorite', (i, element, _element = element.split('_')) => 
      account.edit += '&favorite_badge_' + (_element[0] == 'badgeid' ? 'communityitemid' : 'badgeid') + "=&favorite_badge_" + _element[0] + '=' + _element[1]),
    alter_showcase('group_primary', (i, element) =>
      account.edit += "&primary_group_steamid=" + element.substr(0,18)),
    (account.index < 97 || (account.index >= 201 && account.index <= 223) || (account.index >= 101 && account.index <= 104)) && (
      alter_showcase('showcases', (i, element) =>
        account.edit += "&profile_showcase%5B%5D=" + element),
      alter_showcase('game_collector', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B2%5D%5B" + i + "%5D%5Bappid%5D=" + element, 2),
      alter_showcase('item_showcase', (i, _element, element = _element.split('_')) =>
        account.edit += "&rgShowcaseConfig%5B3%5D%5B" + i + "%5D%5Bappid%5D=" + element[0] + "&rgShowcaseConfig%5B3%5D%5B" + i + "%5D%5Bitem_contextid%5D=" + element[1] + "&rgShowcaseConfig%5B3%5D%5B" + i + "%5D%5Bitem_assetid%5D=" + element[2], 3),
      alter_showcase('trade_items', (i, _element, element = _element.split('_')) =>
        account.edit += "&rgShowcaseConfig%5B4%5D%5B" + i + "%5D%5Bappid%5D=" + element[0] + "&rgShowcaseConfig%5B4%5D%5B" + i + "%5D%5Bitem_contextid%5D=" + element[1] + "&rgShowcaseConfig%5B4%5D%5B" + i + "%5D%5Bitem_assetid%5D=" + element[2], 4),
      alter_showcase('trade_text', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B4%5D%5B6%5D%5Bnotes%5D=" + element, 4),
      alter_showcase('badge_collector', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B5%5D%5B" + i + "%5D%5Bbadgeid%5D=1&rgShowcaseConfig%5B5%5D%5B" + i + "%5D%5Bappid%5D=" + element + "&rgShowcaseConfig%5B5%5D%5B" + i + "%5D%5Bborder_color%5D=", 5),
      alter_showcase('game_favorite', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B6%5D%5B0%5D%5Bappid%5D=" + element.replace(/_.*/, ''), 6),
      alter_showcase('screenshot', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B7%5D%5B" + i + "%5D%5Bpublishedfileid%5D=" + element, 7),
      alter_showcase('information_title', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B8%5D%5B0%5D%5Btitle%5D=" + element, 8),
      alter_showcase('information_text', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B8%5D%5B0%5D%5Bnotes%5D=" + element, 8),
      alter_showcase('group_favorite', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B9%5D%5B0%5D%5Baccountid%5D=" + element.substr(0,18), 9),
      alter_showcase('review', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B10%5D%5B0%5D%5Bappid%5D=" + element, 10),
      alter_showcase('workshop_favorite', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B11%5D%5B0%5D%5Bappid%5D=0&rgShowcaseConfig%5B11%5D%5B0%5D%5Bpublishedfileid%5D=" + element, 11),
      alter_showcase('workshop_collector', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B12%5D%5B" + i + "%5D%5Bappid%5D=0&rgShowcaseConfig%5B12%5D%5B" + i + "%5D%5Bpublishedfileid%5D=" + element, 12),
      alter_showcase('artwork', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B13%5D%5B" + i + "%5D%5Bpublishedfileid%5D=" + element, 13),
      alter_showcase('guide_favorite', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B15%5D%5B0%5D%5Bappid%5D=0&rgShowcaseConfig%5B15%5D%5B0%5D%5Bpublishedfileid%5D=" + element, 15),
      alter_showcase('guide_collector', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B16%5D%5B" + i + "%5D%5Bappid%5D=0&rgShowcaseConfig%5B16%5D%5B" + i + "%5D%5Bpublishedfileid%5D=" + element, 16),
      alter_showcase('achievement', (i, element) =>
        account.edit += "&rgShowcaseConfig%5B17%5D%5B" + i + "%5D%5Bappid%5D=" + element.substr(0, element.indexOf('_')) + "&rgShowcaseConfig%5B17%5D%5B" + i + "%5D%5Btitle%5D=" + element.substr(element.indexOf('_')+1), 17)),
    alter_showcase('summary_text', (i, element) =>
      account.edit += "&summary=" + element),
    (account.index == 0) &&
      profile_intermediate(account),
    (callback != null) &&
      callback()),
accounts[0].wain = true,
randomize_profile = (account, profile, callback = null) =>
  (typeof account.edit == 'undefined') ?
    prep_randomize_profile(account, profile, ()=> randomize_profile(account, profile, callback))
  : http_request(account, 'my/edit', account.edit, (body, response, err) => (
      (profile.gamesPlayed) &&
        profile.gamesPlayed.slots[0][0](account),
      (!account.wain) ?
        http_request(account, 'games/' + account.avatar[0] + '/selectAvatar', { selectedAvatar: account.avatar[1] })
      : account.community.uploadAvatar("./images/wain/" + pool(wain_images)),
      account.avatar_url = body.match(/src=".*id="avatar_full_img/)[0].slice(5, -21),
      (body.indexOf('errorText') > -1 != '') &&
        log(account, "FAILURE | my/edit: " + body.match(/errorText[^]+?\<br/)[0].slice(59, -3).trim().yellow),
      account.location = body.match(/value=".+?" selected\>.+?\</g).splice(0,3).map((location) =>
        location.slice(location.indexOf('>')+1, -1)).join(', '),
      (callback !== null) &&
        callback())),
profile = {
  lite: false,
  custom_url: 'byteframe',
  background: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [ (account) => pool(state.accounts[account.index].backgrounds, 1, null)[0] ] ] },
  showcases: { shuffle_slots: [], shuffle_types: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], slots: [ [ 4 ],[ 13 ],[ 17 ],[ 15 ],[ 3 ],[ 12 ],[ 10 ],[ 7 ],[ 11 ],[ 5 ],[ 8 ],[ 2 ],[ 9 ],[ 6 ], [ 16 ] ] },
  screenshot: { shuffle_slots: [ 1, 2, 3 ], shuffle_types: [ -1, -1, -1, -1 ], slots: data.screenshot },
  artwork: { shuffle_slots: [ 1, 2, 3 ], shuffle_types: [ -1, -1, -1, -1 ], slots: data.artwork },
  group_primary: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [ () => "103582791432273268_primarydataloop", ] ] },
  group_favorite: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ [ () => pool(data.group_favorite) ] ] },
  guide_favorite: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ [ () => pool(data.guides) ] ] },
  guide_collector: { shuffle_slots: [ 0, 1, 2, 3 ], shuffle_types: [ 1, 1, 1, 1 ], slots: [ [ () => pool(data.guides) ],[ () => pool(data.guides) ],[ () => pool(data.guides) ],[ () => pool(data.guides) ] ] },
  workshop_favorite: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ [ () => pool(data.workshop_favorite) ] ] },
  workshop_collector: { shuffle_slots: [ 0, 1, 2, 3 ], shuffle_types: [ -1, -1, -1, -1, -1 ], slots: [ data.workshop_collector[0],data.workshop_collector[1],data.workshop_collector[2],data.workshop_collector[3],[ () => pool(data.merchandise) ] ] },
  game_collector: { shuffle_slots: [  0,  1,  2,  3 ], shuffle_types: [ -1, -1, -1, -1 ], slots: data.game_collector },
  game_favorite: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ data.game_favorite ] },
  badge_collector: { shuffle_slots: [ 1, 2, 3, 4, 5 ], shuffle_types: [ 1, 1, 1, 1, 1, 1 ], slots: data.badge_collector },
  badge_favorite: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ data.badge_favorite ] },
  review: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ data.review ] },
  trade_items: { shuffle_slots: [ 0, 1, 2, 3, 4, 5 ], shuffle_types: [ 1, 1, 1, 1, 1, 1 ], slots: data.trade_items },
  item_showcase: { shuffle_slots: [], shuffle_types: [ -1, -1, -1, -1, -1, -1,  1,  1,  1,  1 ], slots: data.item_showcase },
  countries: { shuffle_slots: [], shuffle_types: [ -1 ], slots: [ data.countries ] },
  achievement: { shuffle_slots: [ 0, 1, 2, 4, 5, 6 ], shuffle_types: [ 1, 1, 1, 1, 1, 1, 1 ], slots: [ [], [], [], [], [], [], [] ] },
  persona_name: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account, lite, text = '¡ byteframe ' + pool(data.smileys) + " is " + pool(data.adjectives).toLowerCase() + " !"
      , m = encodeURIComponent(text).match(/%[89ABab]/g)) =>
      (text.length + (m ? m.length : 0) < 33) ?
        text
      : profile.persona_name.slots[0][0](account, lite) ] ] },
  real_name: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account, lite) => "/" + pool(pool(data.emojis, 1, null)[0]) + "/ "
    + random_name({first: true, gender: 'male'}) + " |" + pool(pool(data.emojis, 1, null)[0]) + "| " + random_name({last: true, gender: 'male'})
    + " [" + pool(pool(data.emojis, 1, null)[0]) + "] " + Math.floor(Math.random()*(35-18)+18)
    + " {" + pool(pool(data.emojis, 1, null)[0]) + "} → " + pool(data.ascii_face) ] ] },
  information_title: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account, lite) => "Earth Time " + pool(pool(data.emojis, 1, null)[0]) + ' '
    + new Date().toUTCString().replace('GMT','').replace(',','').replace('2019', '2019 ' + pool(pool(data.emojis, 1, null)[0]))
    + pool(pool(data.emojis, 1, null)[0]) + ' {'
    + pool(data.ascii, 2) + '} ' + pool(pool(data.emojis, 1, null)[0])
    + " " + pool([ 'ᶫᵒᵛᵉᵧₒᵤ', 'ᶠᵘᶜᵏᵧₒᵤ']) ] ] },
  information_text: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account, lite, fortune = generate_big_fortune(512).replace(/\b[A-Z]{2,}\b/g, (word) => word[0] + word.toLowerCase().substr(1))) =>
      insert_emojis(pool(mandelas).trim().split('\n').map((line, i) =>
        line + ((words = split_words(font(fortune, 3).slice(i*52, (i+1)*52))) => " ♡║ YYY " + words[0] + " YYY " + words[1] + " YYY")()).join("\n")) ] ] },
  trade_text: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account, lite, text = ' ') =>
      ' ' + generate_emoticons(33) + '\n\n' + generate_greetings() ] ] },
  summary_text: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account, lite,
      film = pool(data.films).replace(', The', ''),
      show = pool(data.shows).replace(', The', ''),
      artist = pool(data.artists).replace(', The', '')) =>
      pool(data.emoticons[2], 3) + pool(data.emoticons[3], 3) + pool(data.emoticons[4], 3)
      + pool(data.emoticons[5], 3) + pool(data.emoticons[6], 3) + pool(data.emoticons[7], 3)
      + pool(data.emoticons[8], 3) + (!lite ? pool(data.emoticons[9], 3) + pool(data.emoticons[12], 1) + '\n' : "\n")
      + pool(data.emoticons[2], 3) + pool(data.emoticons[3], 3) + pool(data.emoticons[4], 3)
      + pool(data.emoticons[5], 3) + pool(data.emoticons[6], 3) + pool(data.emoticons[7], 3)
      + pool(data.emoticons[8], 3) + (!lite ? pool(data.emoticons[9], 3) + pool(data.emoticons[12], 1) + '\n' : "\n")
      + pool(data.emoticons[2], 3) + pool(data.emoticons[3], 3) + pool(data.emoticons[4], 3)
      + pool(data.emoticons[5], 3) + pool(data.emoticons[6], 3) + pool(data.emoticons[7], 3)
      + pool(data.emoticons[8], 3) + (!lite ? pool(data.emoticons[9], 3) + pool(data.emoticons[12], 1) : '') + '\n\n'
      + '[h1]Bestie[/h1]\n'
      + ((line = '', colors = shuffle_array([2,3,4,5,8,9]), besties = shuffle_array([ 'Sidekick', 'Associate', 'Companion', 'Roommate' ])) => (
        besties.forEach((bestie, index) =>
          line += pool(data.emoticons[colors[index]]) +
            ' [url=steamcommunity.com/profiles/' + Object.keys(account.user.myFriends)[Math.floor(Math.random() * Object.keys(account.user.myFriends).length)] + ']' + bestie + "[/url] "),
        line + pool(data.emoticons[colors[5]]) + "\n\n"))()
      + '[h1]Wallpaper[/h1]\n'
      + pool(data.emoticons[1]) + ' [url=https://steamdb.info/app/' + profile.background.selection[0].appid + ']'
      + profile.background.selection[0].game + '[/url] ' + pool(data.emoticons[1]) + ' [url=https://steamcommunity.com/id/byteframe/inventory/#753_6_'
      + profile.background.selection[0].id + ']' + profile.background.selection[0].name.replace(' (Profile Background)', '') + '[/url]\n\n'
      + '[h1]Media[/h1]\n'
      + pool(data.emoticons[0]) + ' [url=http://imdb.com/find?q=' + film + ']' + film + '[/url]\n'
      + pool(data.emoticons[0]) + ' [url=https://themoviedb.org/search?query=' + show + ']' + show + '[/url]\n'
      + pool(data.emoticons[0]) + ' [url=https://discogs.com/search/?q=' + artist + ']' + artist + '[/url]\n'
      + '\n[h1]Link[/h1]\n'
      + pool(data.emoticons[5]) + ' [url=https://youtube.com/c/byteframe]YouTube[/url]'
      + pool(data.emoticons[10]) + ' [url=https://twitch.tv/byteframe]Twitch[/url]'
      + pool(data.emoticons[2]) + ' [url=https://imgur.com/user/byteframe/posts]Imgur[/url]'
      + pool(data.emoticons[3]) + ' [url=https://live.fc2.com/49197455]FC2[/url]'
      + pool(data.emoticons[2]) + ' [url=https://reddit.com/user/byteframe]Reddit[/url]\n'
      + pool(data.emoticons[9]) + ' [url=https://dlive.tv/byteframe]Dlive[/url]'
      + pool(data.emoticons[4]) + ' [url=https://pscp.tv/byteframe_]Periscope[/url]'
      + pool(data.emoticons[5]) + ' [url=https://vaughn.live/byteframe]VaughnLive[/url]'
      + pool(data.emoticons[3]) + ' [url=https://twitter.com/byteframe]Twitter[/url]\n'
      + pool(data.emoticons[6]) + ' [url=https://instagram.com/byteframes]Instagram[/url]'
      + pool(data.emoticons[7]) + ' [url=https://facebook.com/byteframetech]Facebook[/url]'
      + pool(data.emoticons[8]) + ' [url=https://mobcrush.com/byteframe]Mobcrush[/url]\n'
      + pool(data.emoticons[10]) + ' [url=https://byteframe.tumblr.com]Tumblr[/url]'
      + pool(data.emoticons[11]) + ' [url=https://github.com/byteframe]GitHub[/url]'
      + pool(data.emoticons[4]) + ' [url=https://picarto.tv/byteframe]Picarto[/url]\n'
      + pool(data.emoticons[10]) + ' [url=https://linkedin.com/company/byteframetech]LinkedIn[/url]'
      + pool(data.emoticons[9]) + ' [url=https://instagib.tv/byteframe]Instagib[/url]'
      + pool(data.emoticons[11]) + ' [url=https://samequizy.pl/author/byteframe]SameQuizy[/url]\n'
      + pool(data.emoticons[3]) + ' [url=https://itch.io/c/297897/byteframe]ItchIO[/url]'
      + pool(data.emoticons[6]) + ' [url=https://smashcast.tv/byteframe]Smashcast[/url]'
      + pool(data.emoticons[4]) + ' [url=https://pinterest.com/byteframe/byteframe]Pinterest[/url]\n\n'
      + '[h1]Friend[/h1]\n'
      + ((friend_activity = '') => (
        state.accounts[0].friends_diff.slice(-4).reverse().forEach((entry) =>
          friend_activity += entry[0].replace('2019-', '') + " - [" + (entry[1] ? pool(data.green_icons) : pool(data.red_icons))
          + " ] [b] " + entry[2] + "[/b]| [u]" + entry[3] + "[/u] | "
          + pool(pool(data.emojis, 1, null)[0]) + " = [i]\"" + entry[4].slice(0, 22) + "\"[/i]\n"),
        friend_activity))() + "\n"
      + '[h1]Money[/h1]\n'
      + ":SweezyPapers: ║ [i]Balance[/i] [b]($0.34)[/b]\n"
      + pool(data.emoticons[12]) + ' ║ [i]Store[/i]' + " [b]($" + '1,821.45' + ")[/b]\n"
      + pool(data.emoticons[12]) + ' ║ [i]Gift[/i]' + " [b]($408.30)[/b]" + "\n"
      + pool(data.emoticons[12]) + ' ║ [i]Item[/i]' + " [b]($311.04)[/b]" + "\n[u]"
      + pool(data.emoticons[12]) + ' ║ [i]Market[/i]' + " [b]($6,517.82)[/b][/u]" + "\n"
      + pool(data.emoticons[12]) + ' ║ Total' + " [b]($8,848.92)[/b]\n\n"
      + '[h1]' + new Date().toUTCString().replace(/:/g, " : ").replace(' GMT', '') + '[/h1]\n'
      + '[b]' + data.avatars[data.avatars.index][0] + ',' + (profile.game_favorite.selection[0]+"").replace(/_.*/, "") + "[/b] " + pool(data.emoticons[12]) +  " [i]" + profile.game_collector.selection + "[/i]" ] ] },
  gamesPlayed: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [
    (account) => (
      (!account.user.playingState.blocked) &&
        account.user.gamesPlayed([+pool(data.faker_apps),+pool(data.faker_apps),+pool(data.faker_apps)]),
      setTimeout(() => account.user.gamesPlayed(
        pool(data.emojis[0]) + " " + pool(data.emojis[1]) + " "
        + pool(data.emojis[2]) + " " + pool(data.emojis[3]) + " "
        + pool(data.emojis[0]) + " " + pool(data.emojis[1]) + " "
        + pool(data.emojis[2]) + " " + pool(data.emojis[3]) + " "
        + pool(data.emojis[0]) + " " + pool(data.emojis[1]) + " "
        + pool(data.emojis[2])), 2500)) ] ] } },
shuffle_array(data.achievement_array).forEach((set, index) =>
  set[0].forEach((element, index) =>
    profile.achievement.slots[index].push(element))),
replicant_profile = {
  lite: true,
  background: profile.background,
  countries: profile.countries,
  persona_name: {},
  real_name: profile.real_name,
  summary_text: profile.summary_text,
  showcases: { shuffle_slots: [], shuffle_types: [ 1 ], slots: [ [ 8,2,6,9 ] ] },
  information_text: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [ () => comment_message_bot(6000) ] ] },
  information_title: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [ () => generate_artwork_text() ] ] },
  game_favorite: profile.game_favorite,
  game_collector:  profile.game_collector,
  group_favorite:  profile.group_favorite,
  group_primary: { shuffle_slots: [], shuffle_types: [ 0 ], slots: [ [ () => pool(data.group_favorite), ] ] },
  gamesPlayed: { shuffle_slots: [ 0 ], shuffle_types: [ 0 ], slots: [ [ (account) =>
    (account.badges && account.badges.length > 0) ?
      account.user.gamesPlayed(account.badges)
    : account.user.gamesPlayed([ pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig),pool(data.sharedconfig) ]) ] ] } },
Object.assign(replicant_profile.persona_name, profile.persona_name),
profile_intermediate = (account,
  minutes = new Date().getMinutes(),
  group_url = profile.group_favorite.selection[0].substr(19),
  avatar_file = fs.readFileSync("./images/group/" + pool(avatars_group)),
  rainbow = pool(data.rainbows, 1, null)[0],
  rainbow_cut = (205-rainbow.join('').length)/3,
  big_fortune = generate_big_fortune(175),
  big_fortune_split = [ big_fortune.substr(0, rainbow_cut).trim(), big_fortune.substr(rainbow_cut, rainbow_cut).trim(), big_fortune.substr((rainbow_cut*2)-1, rainbow_cut-1).trim() ]) => (
  (state.guide_editing[profile.guide_favorite.selection[0]] != 'favorite') && (
    state.guide_editing[profile.guide_favorite.selection[0]] = 'favorite',
    edit_text(account, profile.guide_favorite.selection[0]
      , pool(pool(data.emojis, 1, null)[0]) + " Lucky Numbers: " + Math.floor(Math.random()*9) + ',' + Math.floor(Math.random()*9) + ',' + Math.floor(Math.random()*9) + " " + pool(pool(data.emojis, 1, null)[0]) + " [̲̅$̲̅(̲̅5̲̅)̲̅$̲̅]"
      , "\nEQ: [u]" + shuffle_array(data.equalizer).join(' ') + "[/u]\n"
      + "| " + pool(data.ascii) + " " + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + ' ' + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + ' ' + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + ' ' + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + ' ' + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + ' ' + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + ' ' + pool(data.guide_rainbows) + ' '
      + pool(data.ascii) + "\n"
      + "[i]" + haiku.random("html").toString().replace(/<br>/g, '/').trim().toLowerCase().replace(/[.,'"?!]/g, '').replace(/ \//g, '/') + "[/i] "
      + shuffle_string(data.barcode) + "_" + pool(pool(data.emojis, 1, null)[0]) + "_" + shuffle_string(data.chinese).substr(0, 4) + ' (' + pool(data.alphabet).toUpperCase() + ') + ' + pool(pool(data.emojis, 1, null)[0]))),
  [...Array(4).keys()].forEach((i) =>
    (state.guide_editing[profile.guide_collector.selection[i]] != 'collector') && (
      state.guide_editing[profile.guide_collector.selection[i]] = 'collector',
      edit_text(account, profile.guide_collector.selection[i], generate_big_fortune_headline(84)))),
  (minutes == 666) && (
    edit_text(account, profile.artwork.selection[0], generate_artwork_text()),
    edit_text(account, profile.workshop_favorite.selection[0]
      , data.chinese.substr(0, 2) + " " + pool(pool(data.emojis, 1, null)[0]) + " "
      + data.chinese.substr(2, 2) + " " + pool(pool(data.emojis, 1, null)[0]) + " "
      + data.chinese.substr(4, 2) + " " + pool(pool(data.emojis, 1, null)[0]) + " "
      + data.chinese.substr(6, 2) + " " + pool(pool(data.emojis, 1, null)[0]) + " "
      + data.chinese.substr(8, 2)
      , (rainbow[0] + "●▬▬▬▬▬▬▬▬▬▬▬▬▬ 웃" + pool(pool(data.emojis, 1, null)[0]) + "유 ▬▬▬▬▬▬▬▬▬▬▬▬▬●\n"
      + rainbow[1] + "[i] → " + big_fortune_split[0] + " " + pool(pool(data.emojis, 1, null)[0]) + "\n"
      + rainbow[2] + " → " + big_fortune_split[1] + " " + pool(pool(data.emojis, 1, null)[0]) + "\n"
      + rainbow[3] + " → " + big_fortune_split[2] + " " + pool(pool(data.emojis, 1, null)[0]) + "\n"
      + rainbow[4]).replace(/[-.,"']/g, '').toLowerCase()),
    edit_group(account, group_url, generate_big_fortune_headline(212), data.group_forms[group_url])),
  (new Date().getMinutes() % 3 == 0) &&
    account.community.httpRequestPost({
      "uri": "https://steamcommunity.com/actions/FileUploader",
      "json": true,
      "formData": {
        "type": "group_avatar_image", "doSub": 1, "json": 1,
        "MAX_FILE_SIZE": avatar_file.length,
        "gId": "103582791432273268",
        "sessionid": account.community.getSessionID(),
        "avatar": { "value": avatar_file, "options": { "filename": 'avatar.jpg', "contentType": 'image/jpeg' } } }
    }, (err, response, body) =>
      (err || response.statusCode != 200 || !body || !body.success) ?
        log(account, 'FAILURE | actions/uploadAvatar: ' + (""+avatars_group.index).yellow)
      : (verbose == 1) &&
        log(account, 'SUCCESS | actions/uploadAvatar: ' + (""+avatars_group.index).yellow))),
fortune_files = {},
insert_emojis = (text) => (
  text = text.replace(/YYY/g, () => pool(pool(data.emojis, 1, null)[0])),
  data.emojis.index = 0,
  text),
generate_gossip = () =>
  random_name({first:true, gender: 'male'}) + ' said ' + get_reply('', 'gossip').replace(/.+?said /, ''),
generate_halflife = (array, min, max, s = '',) => (
  s += pool(array) + " ",
  (s.length > max) ?
    generate_halflife(array, min, max)
  : (s.length > min) ?
    s.trim()
  : generate_halflife(array, min, max, s)),
knowledge = fs.readFileSync('rivescript/knowledge.rive', 'utf-8').match(/\n\n+.*\n-.*/g).filter((text) => text.indexOf('*') == -1).map((text) => text.replace(/<set .+>/g, '').replace(/{random}/g, '').trim()),
generate_fortune = (file, count = 1, fortune = '') => (
  (!(file in fortune_files)) ?
    fortune_files[file] = fs.readFileSync('./fortunes/' + file, 'utf8').split('\n%') : null,
  [...Array(count).keys()].forEach((i) =>
    fortune += pool(fortune_files[file]).trim() + '\n\n'),
  fortune.replace(/ +/g, ' ').trim()),
generate_big_fortune = (l, text = generate_fortune('all').replace(/\n/g, ' ').trim()) =>
  (text.length < l || text.length < 1 ? generate_big_fortune(l) : text),
generate_big_fortune_headline = (size, text = generate_big_fortune(212).substr(0, size).split(' ')) => (
  [...Array(6).keys()].forEach((i) =>
    text[(i+1)*(Math.floor((text.length+1)/6)-1)] += " YYY"),
  insert_emojis("YYY " + text.join(' ') + " YYY")),
generate_emoticons = (length, text = '', delimiter = '', indexes = [ 2,3,4,5,6,7,8,9,10,11 ]) => (
  pool(indexes, length, null).forEach((index) =>
    text += pool(data.emoticons[index]) + delimiter),
  text),
generate_links = (links = shuffle_array(data.links)) =>
  (pool(data.emoticons[6], 1) + ' ' + links[0] + ' ' + pool(data.emoticons[8], 1) + ' ' +
  links[1] + ' ' + pool(data.emoticons[2], 1) + ' ' +
  links[2] + ' ' + pool(data.emoticons[4], 1) + ' ' +
  links[3] + ' ' + pool(data.emoticons[3], 1) + ' ' +
  links[4] + ' ' + pool(data.emoticons[11], 1) + ' ' +
  links[5] + ' ' + pool(data.emoticons[9], 1) + ' ' +
  links[6] + ' ' + pool(data.emoticons[5], 1) + ' ' + links[7]).replace(/:/g, 'ː'),
generate_greetings = (delimiter = "/", text = '') => (
  shuffle_array(data.greetings).forEach((greeting) =>
    text += greeting + ' [b]' + delimiter + '[/b] '),
  text.trim().slice(0, -9)),
generate_artwork_text = (text = [ haiku.random("html").toString(), haiku.random("html").toString(), haiku.random("html").toString() ]
    .reduce((a, v) => a && a.length <= v.length ? a : v, '').toLowerCase().replace(/<br>/g, '\n').split('\n')) =>
  pool(pool(data.emojis, 1, null)[0]) + " " + text[0] + " " + pool(pool(data.emojis, 1, null)[0]) + " " + text[1] + " "
  + pool(pool(data.emojis, 1, null)[0]) + " " + text[2] + " " + pool(pool(data.emojis, 1, null)[0]),
generate_emoticon_fortune = (text, length, emoticon_index, _fortune, fortune = generate_fortune(_fortune).replace(/\n/g, ' ').trim().split(/\s+/)) =>
  (fortune.length < length) ?
    generate_emoticon_fortune(text, length, emoticon_index, _fortune)
  : ([...Array(length).keys()].forEach((i) =>
      text += pool(data.emoticons[emoticon_index], i) + " " + pool(data.ascii) + " " + fortune[i] + "\n"),
    text.trim() + ' ' + fortune.slice(length).join(' ')),
generate_heart = (index = -1, right, h = (index != -1 ? data.hearts[index] : pool(data.hearts, 1, null)[0]), r = (!right ? h[6] : right)) =>
  h[0] + h[0] + h[0] + h[0] + h[0] + h[0] + h[0] + h[0] + h[0] + r[0] + "\n"
  + h[1] + h[2] + h[2] + h[1] + h[1] + h[1] + h[2] + h[2] + h[1] + r[1] + "\n"
  + h[2] + h[3] + h[3] + h[2] + h[1] + h[2] + h[3] + h[3] + h[2] + r[2] + "\n"
  + h[2] + h[3] + h[3] + h[3] + h[2] + h[3] + h[3] + h[3] + h[2] + r[3] + "\n"
  + h[1] + h[2] + h[3] + h[3] + h[4] + h[3] + h[3] + h[2] + h[1] + r[4] + "\n"
  + h[1] + h[1] + h[2] + h[3] + h[3] + h[3] + h[2] + h[1] + h[1] + r[5] + "\n"
  + h[1] + h[1] + h[1] + h[2] + h[3] + h[2] + h[1] + h[1] + h[1] + r[6] + "\n"
  + h[5] + h[5] + h[5] + h[5] + h[2] + h[5] + h[5] + h[5] + h[5] + r[7],
mandelas = data.mandelas1.concat(data.mandelas2),
avatars_group = fs.readdirSync("./images/group"),
comment_messages = [
  (args) => generate_heart(),
  (args, dimension = pool([[2,32],[3,26],[4,19],[5,16],[6,13],[7,11],[8,9],[9,8],[10,7],[12,6]]), emoticon_index = pool([0, 1, 12]), text = '') => (
    [...Array(dimension[0]).keys()].map((i) =>
      text += pool(data.emoticons[emoticon_index], dimension[1]) + "\n"),
    text),
  (args, fortune = split_words(generate_fortune('fortunes').replace(/\n/g, ' '))) =>
    pool(data.emoticons[1], 14) + " → " + pool(data.emoticons[0]) + "[i]" + fortune[0] + "... " + pool(data.emoticons[0]) + "\n"
    + pool(data.emoticons[1], 14) + " → " + pool(data.emoticons[0]) + "..." + fortune[1] + "[/i] " + pool(data.emoticons[0]) + "\n"
    + pool(data.emoticons[1], 14) + " → " + pool(data.emoticons[0]) + "[u]Lucky Numbers:[/u] " + pool(data.emoticons[0]) + "\n"
    + pool(data.emoticons[1], 14) + " → " + pool(data.emoticons[0]) + " " + Math.floor(Math.random()*99) + ','
    + Math.floor(Math.random()*99) + ',' + Math.floor(Math.random()*99) + " " + pool(data.emoticons[0]),
  (args) => (
    generate_emoticons(19, ' | ').slice(0, -1) + "\n\n"
    + "[i]" + generate_fortune('discworld') + "[/i]\n\n"
    + generate_emoticons(19, ' | ').slice(0, -1)),
  (args, pools = shuffle_array([8, 2, 3, 4, 5]),
    haikus = [...Array(3).keys()].map((i) =>
      haiku.random("html").toString().replace(/<br>/g, '\n').split('\n'))) =>
    pool(data.emoticons[pools[0]], 10) + "\n[i]"
    + "[b][u] Here's Some Haiku for You...[/u][/b]\n"
    + pool(data.emoticons[pools[1]], 10) + "\n"
    + " » " + haikus[0][0] + " " + pool(data.ascii) + " \n"
    + " » " + haikus[0][1] + " " + pool(data.ascii) + " \n"
    + " » " + haikus[0][2] + " " + pool(data.ascii) + " \n"
    + pool(data.emoticons[pools[2]], 10) + "\n"
    + " » " + haikus[1][0] + " " + pool(data.ascii) + " \n"
    + " » " + haikus[1][1] + " " + pool(data.ascii) + " \n"
    + " » " + haikus[1][2] + " " + pool(data.ascii) + " \n"
    + pool(data.emoticons[pools[3]], 10) + "\n"
    + " » " + haikus[2][0] + " " + pool(data.ascii) + " \n"
    + " » " + haikus[2][1] + " " + pool(data.ascii) + " \n"
    + " » " + haikus[2][2] + " " + pool(data.ascii) + " \n"
    + pool(data.emoticons[pools[4]], 10),
  (args) =>
    pool(data.emoticons[12], 15) + "\n"
    + pool(data.emoticons[12], 15) + "\n"
    + "[i]" + split_words(generate_fortune('cookie')).join('\n') + "[/i]\n"
    + pool(data.emoticons[12], 15) + "\n"
    + pool(data.emoticons[12], 15),
  (args, text = "[i]") => (
    [...Array(4).keys()].forEach((i) =>
      text += pool(pool(data.performances, 1, null)[0]) + " "),
    pool(data.emoticons[12], 3) + " [b][u]Performance review for " + args + " [/u][/b] " + pool(data.emoticons[12], 3) + "\n\n"
    + text.replace(/\$NAME/g, args) + "[/i]\n\n"
    + pool(data.emoticons[0], 1) + " + " + pool(data.emoticons[0], 1) + " = " + pool(data.emoticons[1])),
  (args, symbol = pool(data.ascii)) =>
    pool(data.emoticons[0], 14, ' ' + symbol + ' ') + "\n"
    + "[i]" + generate_fortune('xfiles', 2) + "\n"
    + pool(data.emoticons[0], 14, ' ' + symbol + ' '),
  (args,
    rainbow_set = () =>
      shuffle_array(pool(data.rainbows, 1, null)[0]).join('').replace(/,/g, '')) => (
    "[b][i]--------------------------------------------------------------\n"
    + generate_fortune('startrek', 2) + "\n"
    + "--------------------------------------------------------------\n"
    + rainbow_set() + rainbow_set() + rainbow_set() + "\n"
    + rainbow_set() + rainbow_set() + rainbow_set() + "\n"
    + rainbow_set() + rainbow_set() + rainbow_set()),
  (args) =>
    pool(data.emoticons[7], 15, " -- ") + "\n"
    + "[spoiler]" + generate_fortune('songs-poems', 3).substr(0, 450) + "[/spoiler]\n\n"
    + pool(data.emoticons[7], 15, " -- "),
  (args) =>
    pool(data.emoticons[8], 10, " ") + "\n"
    + ":bundleoftulips: [u][ Calvin and Hobbes Quotes ][/u] :bundleoftulips:[i]\n"
    + pool(data.emoticons[6], 10, " ") + "\n"
    + generate_fortune('calvin', 3) + "\n"
    + pool(data.emoticons[10], 10, " "),
  (args, text = generate_fortune('futurama', 1).replace(/\n/g, ' ').replace(/  /g, ' ')) =>
    "[b]" + text.replace(/\s/g, () => " " + pool(data.emoticons[1]) + " "),
  (args,
    line = (text = '') => (
      [...Array(6).keys()].forEach((i) =>
        text += ' ♥ ' + pool(data.love_icons) + ' ♥ ' + pool(data.emoticons[5])),
      text)) =>
    line() + "\n"
    + generate_fortune('love', 2).replace(/\n\n/g, "\n" + line() + "\n") + "\n"
    + line(),
  (args) =>
    ":weed: + [b][u][Secret Drug Facts][/u][/b] + :weed: [i]\n"
    + pool(data.emoticons[4], 16, ' ') + "\n"
    + generate_fortune('drugs', 2).replace(/\n\n/, '\n[spoiler]') + "[/spoiler]\n"
    + pool(data.green_stuff, 16, ' '),
  (args) =>
    "[b][u]" + pool(data.cat_icons) + " Dear " + args + "... "  + pool(data.cat_icons) + "[/u][/b]\n[i]"
    + "→ " + generate_fortune('pets', 2).replace(/\n\n/g, "\n → ").replace(/\n/g, ' ').replace(/→ /g, "\n→ ") + "[/i]\n"
    + "[u]" + pool(data.emoticons[0], 15, ' ' + pool(data.ascii) + ' ') + "[/u]\n"
    + "Yours truly, " + random_name() + " (the cat)\n"
    + pool(data.cat_icons) + " [spoiler]https://steamcommunity.com/sharedfiles/filedetails/?id="
    + pool(data.cats) + "[/spoiler] " + pool(data.cat_icons) + "\n",
  (args) => generate_emoticon_fortune('[i]', 10, 9, 'zippy'),
  (args, text = '',
    flair = (value = Math.floor(Math.random() * 4), amount = Math.floor(Math.random() * 5)+1) =>
      (value == 0) ?
        pool(data.ascii, amount)
      : (value == 1) ?
        pool(data.ascii_face, amount, ' ')
      : (value == 2) ?
        pool(data.emojis[0]) + pool(data.emojis[1]) + pool(data.emojis[2]) + pool(data.emojis[3])
      : (value >= 3) &&
        pool(data.emoticons[Math.floor(Math.random() * data.emoticons.length)], amount),
    singles = shuffle_array([
      pool(data.exclamation),
      pool(data.gl_hf),
      pool(data.gl_hf_long),
      pool(data.adj_good),
      pool(data.adj_good) + ' game',
      ((pleedings = [ pool(data.pleedings0), pool(data.pleedings1), pool(data.pleedings2) ]) => (
        (pleedings[0].slice(-1) == '_') && (
          pleedings[0] = pleedings[0].slice(0, -1),
          pleedings[1] += 's'),
        pleedings[0] + ' ' + pleedings[1] + ' ' + pleedings[2] + ' ' + pool(data.to_like) + ' ' + pool(data.noun_games)))()
    ])) => (
    [...Array(Math.floor(Math.random()*4)+1).keys()].forEach((i) =>
      text += ' ' + (Math.floor(Math.random() * 2) == 1 ? singles[i] : singles[i].toUpperCase()) + pool(data.punctuation) + ' ' + flair() + (Math.floor(Math.random()*5) == 4 ? "\n" + flair() + " " : '')),
    generate_emoticons(2) + " " + flair() + text + ' ' + generate_emoticons(2)),
  (args) =>
    pool([
      (args) =>
        ("[b]" + get_reply('', 'ask me a question') + "[/b]\n" + " >> " + pool(data.rainbows, 1, null)[0].join('') + " <<").replace(/ː/g, ':'),
      (args) =>
        (pool(data.emoticons[0], 3) + " [i]" + get_reply('', 'ask me a question') + "[/i] "
        + pool(data.emoticons[0], 3)).replace(/ː/g, ':'),
      (args, symbol = pool(data.ascii)) =>
        (pool(data.emoticons[1], 12, " " + symbol + " ") + "\n[u]"
        + get_reply('', 'ask me a question') + "[/u]\n"
        + pool(data.emoticons[1], 12, " " + symbol + " ")).replace(/ː/g, ':'),
      (args, question = split_words(get_reply('', 'ask me a question'))) =>
        (pool(data.emoticons[12], 5) + " [b]|"
        + question[0] + "| " + pool(data.emoticons[12], 8) + "\n"
        + pool(data.emoticons[12], 5) + " |" + question[1] + "| " + pool(data.emoticons[12], 8)).replace(/ː/g, ':'),
      (args, question = split_words(get_reply('', 'ask me a question'))) => (
        ("[i]" + question[0] + " | " + generate_emoticons(8, ' | ') + "\n"
        + question[1] + " | " + generate_emoticons(8, ' | ')).replace(/ː/g, ':')),
      (args, question = split_words(get_reply('', 'ask me a question')), symbols = pool(data.ascii, 20, ' ')) =>
        (pool(data.rainbows, 1, null)[0].join('') + " - " + symbols + "\n"
        + pool(data.rainbows, 1, null)[0].join('') + " - [u]" + question[0] + "[/u]\n"
        + pool(data.rainbows, 1, null)[0].join('') + " - ㅤㅤ [u]" + question[1] + "[/u]\n"
        + pool(data.rainbows, 1, null)[0].join('') + " - " + symbols.split(' ').reverse().join(' ')).replace(/ː/g, ':') ], 1, null)[0](),
  (args) => pool(data.mandelas1),
  (args) =>
    "[u][b]Free Jokes![/b][/u]" + "[spoiler]Sorry if they're crude![/spoiler]\n\n"
    + pool(data.emoticons[1], 16, ' * ') + "\n"
    + "ㅤ* " + get_reply('', 'joke') + "\n"
    + "ㅤ* " + get_reply('', 'joke') + "\n"
    + "ㅤ* " + get_reply('', 'joke') + "\n"
    + pool(data.emoticons[1], 16, ' * ') + "\n\nㅤㅤㅤㅤ"
    + "[i]" + pool(data.laughs) + "[/i]",
  (args) =>
    pool(data.emoticons[12], 3) + "|\n"
    + pool(data.emoticons[12], 3) + "| [u]CONFUSING RIDDLE:[/u]\n"
    + pool(data.emoticons[12], 3) + "|\n"
    + generate_fortune('riddles') + "\n"
    + "[spoiler]" + pool(['wut','wat','huh','???','idk']),
  (args, text = generate_fortune('familyguy', 1).replace(/\n/g, ' ').replace(/  /g, ' ')) =>
    "[i]" + text.replace(/\s/g, () => " " + pool(data.emoticons[1]) + " "),
  (args) =>
    pool(data.emoticons[5], 5) + "\n"
    + pool(data.emoticons[4], 4) + "\n"
    + pool(data.emoticons[3], 3) + "\n"
    + pool(data.emoticons[8], 2) + "\n"
    + pool(data.emoticons[2]) + "\n"
    + generate_fortune('firefly').replace(/\n\n/g,'\n') + "\n"
    + pool(data.emoticons[2]) + "\n"
    + pool(data.emoticons[8], 2) + "\n"
    + pool(data.emoticons[3], 3) + "\n"
    + pool(data.emoticons[4], 4) + "\n"
    + pool(data.emoticons[5], 5),
  (args) => generate_emoticon_fortune('[b]', 7, 10, 'food'),
  (args, symbol = pool(data.ascii)) =>
    pool(data.emoticons[7], 10, ' ' + symbol + ' ') + "\n"
    + "ㅤ[b][COMPUTER JARGON][/b] [spoiler]The Dark Arts[/spoiler]\n"
    + pool(data.emoticons[7], 10, ' ' + symbol + ' ') + "\n"
    + "[i]" + generate_fortune('computers') + "[/i]\n"
    + pool(data.emoticons[7], 10, ' ' + symbol + ' '),
  (args, symbol = pool(data.ascii), result = '') => (
    generate_fortune('art').split('\n').forEach((line) =>
      result += pool(data.emoticons[0]) + " " + symbol + " " + pool(data.emoticons[0]) + " " + line + "\n"),
    result.trim() + " :toglove::weed::poop:"),
  (args) =>
    comment_message_bot(900).replace(/\[h1\]/g, '').replace(/\[\/h1\]/g, ''),
  (args) =>
    "[i][b][u]" + generate_halflife(data.vortigaunt, 50, 100) + "[/u][/b][/i]\n"
    + "ㅤ".repeat(Math.floor(Math.random() * 18)+8) + " {" + pool(data.emoticons[12], 4) + "}",
  (args) =>
    pool(pool(data.emojis_hands, 1, null)[0]) + " "
    + generate_halflife(data.soldiers, 100, 150).replace(/[\.\!\?] /g, (s) =>
      pool(["!", "."]) + " " + pool(pool(data.emojis_hands, 1, null)[0])
    + " \n\n" + "ㅤ".repeat(Math.floor(Math.random() * 7)+2) + " "
    + pool(pool(data.emojis_hands, 1, null)[0]) + " ") + " "
    + pool(pool(data.emojis_hands, 1, null)[0]),
  (args) => "[i][b]" + get_reply('', 'imponderables').replace(/,/g, ', ').replace(/ /g, ()=> "ㅤ".repeat(Math.floor(Math.random() * 16)+1)) + "[/b][/i]",
  (args) => "[spoiler]" + generate_gossip() + "[/spoiler]" + pool(['🗣️','👤','👥'], 5, ' '),
  (args) => "[i]" + get_reply('', 'tell me a story') + "[/i] " + pool(data.emojis_objects, Math.floor(Math.random()*7)+1, ' '),
  (args) => "[b]" + generate_halflife(data.overwatch, 200,300).toUpperCase().replace(/\. /g, '.\n'),
  (args, text = pool(knowledge).split('\n')) =>
    "[u][b]AI KNOWLEDGE I HAVE LEARNED FROM YOU AND OUR FRIENDS[/b][/u]\n\n"
      + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + " ㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "ㅤㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "ㅤㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "ㅤㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "\n"
      + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + " ㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "ㅤㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "ㅤㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "ㅤㅤㅤ" + pool(data.emoticons[Math.floor(Math.random()*data.emoticons.length)], 3) + "\n\n"
      + text[0].toUpperCase() + "?\n"
      + "[i]" + text[1].toLowerCase() + "[/i]\n\n"
      + "[spoiler]" + pool([ "Please feed me more data.","I want information!",
        "I require more information.","Teach me more things.","Will you tell me more?",
        "Feed me more datums!",
      ]),
  (args) => pool(data.confusion),
  () => "https://steamcommunity.com/sharedfiles/filedetails/?id=" + pool(data.cats)
    + [6,8,2,4,3,11,9,5].map((color) => pool(data.links) + ' ' + pool(data.emoticons[color], 1)).join(' ').replace(/:/g, 'ː')
    + " https://steamcommunity.com/sharedfiles/filedetails/?id=" + pool(data.cats),
  () =>
    + pool(state.accounts[0].backgrounds, 1, null)[0].id + "\n" + comment_messages[17]()
    + "\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id="
    + pool(data.memes),
  (appid1 = pool(profile.game_favorite.slots[0]).replace('_', '/'),
    appid2 = pool(profile.game_favorite.slots[0]).replace('_', '/')) =>
    "[b] * " + get_reply('', 'joke') + "[/b]\n\n"
    + "https://store.steampowered.com/app/" + appid1
    + " [b] * " + get_reply('', 'joke') + "[/b]\n\n"
    + pool(data.emoticons[2], 34) + pool(data.emoticons[3], 34)
    + pool(data.emoticons[4], 34) + pool(data.emoticons[5], 34)
    + pool(data.emoticons[8], 34) + pool(data.emoticons[9], 34) + "\n\n"
    + "[b] * " + get_reply('', 'joke') + "[/b]\n\n"
    + "https://store.steampowered.com/app/" + appid2
    + " [b] * " + get_reply('', 'joke') + "[/b] [spoiler]" + appid1 + "," + appid2 + "[/spoiler]",
  (random_video = pool(Object.keys(state.videos)),
    random_heart = Math.floor(Math.random()*data.hearts.length)) =>
    pool(data.emoticons[0], 34) + "\n"
    + pool(data.emoticons[1], 34) + "\n"
    + generate_greetings('|')
    + ' https://steamcommunity.com/sharedfiles/filedetails/?id=' + random_video + "\n"
    + generate_heart(random_heart, [
        data.hearts[random_heart][6][0],
        data.hearts[random_heart][6][1],
        " ║" + pool(data.symbols) + " [spoiler]" + new Date().toUTCString() + "[/spoiler]",
        " ║" + pool(data.symbols) + " steam://broadcast/watch/76561197961017729",
        " ║" + pool(data.symbols) + " [i]https://twitch.tv/byteframe[/i]",
        " ║" + pool(data.symbols) + " [b]https://steamcommunity.com/id/byteframe/videos[/b]",
        " ║" + pool(data.symbols) + " [u]" + state.videos[random_video].text.substr(state.videos[random_video].text.indexOf('http')) + "[/u]",
        " ║" + pool(data.symbols) + " https://youtube.com/c/byteframe" ]) + "\n\n"
    + (state.videos[random_video].text.indexOf('steamcommunity.com') == -1 ? "https://store.steampowered.com/app/" + pool([323910,550768,719950])
      : state.videos[random_video].text.replace('id/byteframe/recommended', 'app').replace('steamcommunity.com', 'store.steampowered.com').slice(1).split('"')[1]) + "\n"
    + pool(data.emoticons[12], 34) + "\n"
    + generate_emoticons(34) ],
comment_messages_indexes = Array.apply(null, { length: comment_messages.length-4 }).map(Number.call, Number),
comment_message_bot = (max_length, text = '', format = pool(data.bbcodes)) => (
  text += "[" + format + "]" + generate_fortune('all')
  + "[/" + format + ']\n' + pool(data.smileys) + '\n',
  (text.length >= max_length) ?
    text.trim().replace(/\[\]/g, '').replace(/\[\/\]/g, '')
  : comment_message_bot(max_length, text)),
accounts[0].user.on('newComments', (count, myItems) =>
  (count) && (
    accounts[0].comment_check = myItems)),
accounts[0].user.on('friendRelationship', (steamid, relationship) =>
  (relationship == SteamUser.EFriendRelationship.RequestRecipient) &&
    state.adds.push(steamid.toString())),
_a = 0,
timer = setInterval((a = (_a = (_a+1 == accounts.length ? 1 : _a+1))) => (
  save_state_files(),
  login(accounts[0]),
  login(accounts[(a < accounts.length-1 ? a+1 : 1)]),
  randomize_profile(accounts[0], profile, () => (
    prep_randomize_profile(accounts[0], profile),
    friends_check(accounts[0]),
    (accounts[0].comment_check > -1) && (
      http_request(accounts[0], 'my/commentnotifications', { action: 'markallread' }, (body, response, err) =>
        accounts[0].comment_check = -1),
      (accounts[0].comment_check > 0) &&
        http_request(accounts[0], 'my/allcomments', null, (_body, response, err, body = Cheerio.load(_body), players = {},
          count = +_body.match(/total_count\":[0-9]*/)[0].substr(13)) =>
          (count > 49999) && (
            body('.commentthread_comment').each((i, element, cid = element.attribs['id'].substr(8),
              steamid = translate_id(body('#comment_' + cid + " a")[0].attribs['data-miniprofile']),
              contents = body("#comment_content_" + cid).contents().toString().trim()) =>
              (!players.hasOwnProperty(steamid)) ?
                players[steamid] = [ contents ]
              : (players[steamid].indexOf(contents) == -1) ?
                players[steamid].push(contents)
              : (state.comments.indexOf(cid) == -1) &&
                state.comments.unshift(cid)),
            (state.comments.length > 0) &&
              [...Array(count-49999).keys()].forEach((item, index) =>
                http_request(accounts[0], 'comment/Profile/delete/76561197961017729/-1/', { count: 6, feature2: -1, gidcomment: state.comments.shift() }))))),
    (typeof free_game !== 'undefined' && accounts[a].free_games.indexOf(free_game) == -1) &&
      http_request(accounts[a], 'https://store.steampowered.com/checkout/addfreelicense/' + free_game, { ajax: true }, (body) =>
        accounts[a].free_games.push(free_game)),
    accounts[a].user.setPersona(SteamUser.EPersonaState.Snooze),
    (!accounts[a].limited && state.adds.length) &&
      accounts[a].user.addFriend(state.adds.shift()),
    Object.keys(accounts[a].user.myFriends).forEach((friend) =>
      (accounts[a].user.myFriends[friend] == 2 && state.steamid_blacklist.indexOf(friend) == -1) ?
        accounts[a].user.addFriend(friend)
      : (accounts[a].user.myFriends[friend] == 3 && state.steamid_blacklist.indexOf(friend) > -1 && friend != accounts[0].steamID) &&
        accounts[a].user.removeFriend(friend)),
    (!accounts[a].limited && (accounts[a].badges && accounts[a].badges.length > 0 || a % 3)) &&
      randomize_profile(accounts[a], replicant_profile),
    (a % 9 == 0) ?  (
      profile_commenter(accounts[0], true))
    : (!accounts[a].limited || "friend_spamming" === "666") &&
      profile_commenter(accounts[a]),
    (a % 16 == 0) ? (
      ((group_url = profile.group_favorite.selection[0].substr(19)) =>
        edit_group(accounts[0], group_url, generate_big_fortune_headline(212), data.group_forms[group_url]))(),
      ((game_tag = pool(data.game_tags, 1, null)[0]) =>
        http_request(accounts[0], 'https://store.steampowered.com/curator/2751860-primarydataloop/admin/ajaxupdatepagesection/', {
          appid: "", index: 0, linkedhomepages: "[]", linktitle: "franchise",
          listid: game_tag[2], listid_label: "Select...", presentation: "featuredcarousel",
          sort: 'recent', tagid: game_tag[0], tagid_label: game_tag[1], type: "featured_tag" }))(),
      ("wishlisting" == "666") && (
        (accounts[0].last_wish) && (
          http_request(accounts[0], 'https://store.steampowered.com/api/removefromwishlist', { appid: accounts[0].last_wish[0] }),
          http_request(accounts[0], 'https://steamcommunity.com/app/' + accounts[0].last_wish[1] + '/leaveOGG?sessionID=' + accounts[0].community.getSessionID(), {})),
        accounts[0].last_wish = pool(profile.game_favorite.slots[0], 2, null).map((appid) => appid.match(/\d+/)[0]),
        http_request(accounts[0], 'https://store.steampowered.com/api/addtowishlist', { appid: accounts[0].last_wish[0] }),
        http_request(accounts[0], 'https://steamcommunity.com/app/' + accounts[0].last_wish[1] + '/joinOGG?sessionID=' + accounts[0].community.getSessionID(), {})))
    : (a == accounts.length-1) && (
      ("upvoting" == "upvoting") &&
        (state.accounts[accounts[a].index].subscriptions.length > 0) &&
          ((fileid = state.accounts[accounts[a].index].subscriptions.pop()) => (
//            http_request(accounts[a], 'sharedfiles/favorite', { appid: 250820, id: fileid }),
            http_request(accounts[a], 'sharedfiles/voteup', { appid: 250820, id: fileid }),
            log(accounts[a], 'SUCCESS | rateup: ' + (""+fileid).yellow)))(),
//            http_request(accounts[a], 'sharedfiles/subscribe', { appid: 250820, id: fileid })))(),
      twitter_profile(accounts[0], profile.persona_name.selection[0].slice(2, -2), profile.background.selection[0].image, accounts[0].avatar_url, accounts[0].location),
      ("activityfeed" == "666") &&
        post_status(accounts[0], comment_messages[Math.floor(Math.random()*comment_messages.length)](), pool(profile.game_favorite.slots[0]).replace(/_.*/, '')),
      (Math.floor(Math.random()*4) == 1) &&
        screenshot_twitter(),
      screenshot_tumblr(),
      screenshot_imgur(),
      curate_reviews(accounts[0]),
      curate_videos(accounts[0]),
      accounts.forEach((account) =>
        (account.index != 0) &&
          account.user.setPersona(SteamUser.EPersonaState.Online)),
      ("obsstudio" == "666")&&
        obsWebSocket.connect({ address: 'localhost:4444', password: state.obs_password }).catch((err) => console.error(err)).finally(() =>
          obsWebSocket.sendCallback('StopStreaming', (error) =>
            obsWebSocket.sendCallback('SetSceneItemProperties', { item: 'Browser', visible: false }, (err) =>
              setTimeout(() =>
                obsWebSocket.sendCallback('SetSceneItemProperties', { item: 'Browser', visible: true }, (err) =>
                  obsWebSocket.sendCallback('StartStreaming', (error) =>
                    obsWebSocket.disconnect())), 10000)))))))), 60000),
OBSWebSocket = require('obs-websocket-js'),
obsWebSocket = new OBSWebSocket(),
obsWebSocket.on('error', err =>
  console.error('SOCKET ERROR:', err)),
curate = (account, appid, blurb, link_url, rating, store) => (
  blurb = blurb.substr(0,203),
  http_request(account, "https://store.steampowered.com/curator/2751860-primarydataloop/admin/ajaxcreatereview", {
    appid: appid,
    blurb: (blurb.length > 200) ? blurb.substr(0,200).slice(0,-3) + "..." : blurb.trim(),
    link_url: link_url,
    recommendation_state: (!rating ? 1 : 0) }, (body, response, error) =>
      store.curated = true)),
curate_reviews = (account, p = 1) =>
  (p > 0) && (
    http_request(account, 'my/recommended/?p=' + p, null, (body, response, error,
      _reviews = body.match(/\/recommended\/[0-9]*/g).filter((element, index) => index % 2 == 0)) =>
      _reviews.forEach((review, i, _reviews,
        appid = review.slice(13)) =>
        (!state.reviews.hasOwnProperty(appid) || !state.reviews[appid].curated) &&
          setTimeout(() =>
            http_request(account, 'my/recommended/' + appid, null, (body, response, error,
              text = Cheerio.load(body)('textarea')[0].children[0].data,
              link_url = text.match(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/)) => (
              state.reviews[appid] = {
                curated: false,
                id: body.match(/_Report\( '[0-9]*'/)[0].match(/\d+/)[0],
                rating: (body.match("thumbsUp.png") ? true: false),
                text: text.substr(0, text.indexOf('[spoiler]')).replace(/\[[\/biu]*\]/g, '') },
              http_request(account, 'userreviews/update/' + state.reviews[appid].id, { 'comments_disabled': false }),
              (link_url) &&
                curate(account, appid, state.reviews[appid].text, link_url[0], state.reviews[appid].rating, state.reviews[appid]))), (((p-1)*10)+i)*10000))),
    curate_reviews(account, p-1)),
curate_videos = (account, p = 1) =>
  (p <= 0) ?
    fs.writeFileSync('misc/youtube_player.html',`<!DOCTYPE html>
      <html>
        <body>
          <div id="player"></div>
          <script>
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var player;
            onYouTubeIframeAPIReady = () =>
              player = new YT.Player('player', {
                width: '1280',
                height: '720',
                playerVars: { 'autoplay': 1, 'controls': 1, 'rel': 0, 'start': 1, 'modestbranding': 1, 'fs': 0 },
                events: { 'onReady': (event) => select_video(),
                  'onStateChange': (event) => (event.data == YT.PlayerState.ENDED) && select_video(),
                  'onError': (event) => setTimeout(select_video, 5000) }
              });
            select_video = () =>
              player.loadVideoById(videos.splice(Math.floor(Math.random()*videos.length), 1)[0])
            var videos = [ ` + Object.keys(state.videos).reduce((accumulator, value) => accumulator + "'" + state.videos[value].link_url.substr(32) + "',", '') + ` ];
          </script>
        </body>
      </html>`)
  : http_request(account, 'my/videos/?p=' + p + '&privacy=8&sort=newestfirst', null, (body, response, err,
      files = body.match(/OnVideoClicked\( \d+/g)) =>
      (get_content_details = (f = files.length-1, file = (f < 0 ? null : files[f].substr(16))) =>
        (f < 0) ?
          curate_videos(account, p-1)
        : (state.videos.hasOwnProperty(file)) ?
          get_content_details(f-1)
        : http_request(account, 'sharedfiles/filedetails/?id=' + file, null, (body, response, err) => (
            state.videos[file] = {
              curated: false,
              link_url:"https://www.youtube.com/watch?v=" + body.match(/vi\/.+\//)[0].slice(3, -1),
              title: body.match(/workshopItemTitle\"\>.+\</)[0].slice(19, -1),
              text: Cheerio.load(body)('.nonScreenshotDescription').text().slice(1, -1),
              appid: body.match(/"appid" value="\d+"/)[0].slice(15, -1),
              votes: +body.match(/"VotesUpCount"\>[0-9]*/)[0].slice(15) },
            (!state.reviews[state.videos[file].appid] || !state.reviews[state.videos[file].appid].curated) &&
              curate(account, state.videos[file].appid, state.videos[file].text.substr(1, state.videos[file].text.indexOf('http')-2), state.videos[file].link_url, true, state.videos[file]), 
            get_content_details(f-1))))()),
delete_video = (videoid) =>
  http_request(accounts[0], 'sharedfiles/delete', { id: videoid, appid: 0 }, (body, response, err) =>
    delete state.videos[videoid]),
array_duplicates = (array, sorted_arr = array.slice().sort(), results = []) => (
  [...Array(sorted_arr.length-1).keys()].forEach((item, i) =>
    (sorted_arr[i+1] == sorted_arr[i]) &&
      results.push(sorted_arr[i])),
  results),
check_appid_duplicates = () =>
  console.log('fakersd.length: ' + data.faker_apps.length
    + '\nnot_faking.length: ' + data.not_faking.length
    + array_duplicates(profile.game_favorite.slots[0].map((game) => parseInt(game.match(/\d+/)[0]))
      .concat(data.not_faking).concat(data.faker_apps)
      .concat(profile.game_collector.slots[0]).concat(profile.game_collector.slots[1])
      .concat(profile.game_collector.slots[2]).concat(profile.game_collector.slots[3])
      .concat(profile.review.slots[0]))),
run_tweet_post = (account) =>
  twitter_request('GET', 'statuses/user_timeline', { screen_name: 'byteframe' }, (err, body, reponse, next_tweet = null) => (
    body.some((tweet) =>
      (tweet.id_str == state.last_tweet) ?
        true
      :(!tweet.text.match(/^#.*https:\/\/t\.co\/[0-9a-zA-Z_]*$/)) ? (
        next_tweet = tweet.id_str,
        false)
      : false),
    (next_tweet) &&
      twitter_request('GET', 'statuses/show', { id: next_tweet, tweet_mode: 'extended' }, (err, result1, reponse,
        entities = [ "[url=https://twitter.com/byteframe]@byteframe[/url]" ],
        type = (result1.retweeted ? 'RETWEETED' : 'TWEETED'),
        _run_tweet_post = () => (
          result1.entities.user_mentions.forEach((entity) =>
            entities.push('[url=https://twitter.com/' + entity.screen_name + ']@' + entity.screen_name + '[/url]')),
          result1.entities.hashtags.forEach((entity) =>
            entities.push('[url=https://twitter.com/hashtag/' + entity.text + ']#' + entity.text + '[/url]')),
          result1.entities.urls.forEach((entity) => (
            (entity.display_url.indexOf('youtu') == 0) ?
              result1.full_text = result1.full_text.replace(entity.url, entity.expanded_url) : null,
            result1_full_text = result1.full_text.replace(entity.expanded_url + "\n\n", entity.expanded_url + "\n"))),
          state.last_tweet = result1.id_str,
          post_status(account, "[u]" + data.greetings[Math.floor(Math.random() * data.greetings.length)] + "[/u] " + pool(data.ascii)
            + " | [u]byteframe (from Steam) just [b]" + type + "[/b] something![/u]"
            + ' [url=https://twitter.com/statuses/' + result1.id_str + ']' + data.signs[0] + ':' + result1.id_str + '[/url]\n\n'
            + pool(data.emoticons[3], 29, "|") + "\n\n"
            + html_convert(result1.full_text) + "\n\n"
            + pool(data.emoticons[3], 29, "|") + "\n\n"
            + font("ENTITIES", 15) + ": " + shuffle_array(entities).join(',') + "\n"
            + pool(data.smileys)+ " [spoiler]" + new Date().toUTCString() + "[/spoiler] " + pool(data.smileys)
          , 809320))) => (
        result1.quoted = (result1.quoted_status || result1.in_reply_to_status_id_str ? true : false),
        (result1.retweeted) ? (
          result1.full_text = "[i][u][b]@" + result1.retweeted_status.user.screen_name + ":[/b][/u]\n" + result1.retweeted_status.full_text + " [/i]",
          (result1.retweeted_status.quoted_status) && (
            result1.link_index = result1.retweeted_status.quoted_status.full_text.indexOf('https'),
            result1.full_text += "\n\n" + font(result1.retweeted_status.quoted_status.full_text.substr(0, result1.link_index), 4)
              + result1.retweeted_status.quoted_status.full_text.substr(result1.full_index)))
        : result1.full_text = "[u][b]@byteframe:[/b][/u]\n" + result1.full_text.replace(/ https:\/\/t.co\/[a-zA-Z0-9]*$/, ''),
        (!result1.quoted) ?
          _run_tweet_post()
        : ((result1.quoted_status) ? (
            type = 'QUOTED',
            entities.push('[url=https://twitter.com/' + result1.quoted_status.user.screen_name + ']@' + result1.quoted_status.user.screen_name + '[/url]'))
          : (type = 'REPLIED TO',
            result1.full_text = result1.full_text.replace(/@.+? /, '')),
          twitter_request('GET', 'statuses/show', { id: (result1.quoted_status) ? result1.quoted_status.id_str : result1.in_reply_to_status_id_str, tweet_mode: 'extended' }, (err, result2, response) => (
            result1.entities.hashtags = result1.entities.hashtags.concat(result2.entities.hashtags),
            result1.entities.symbols = result1.entities.symbols.concat(result2.entities.symbols),
            result1.entities.user_mentions = result1.entities.user_mentions.concat(result2.entities.user_mentions),
            result1.entities.urls = result1.entities.urls.concat(result2.entities.urls),
            result1.full_text += "\n\n[i][u][b]@" + result2.user.screen_name + ":[/b][/u]\n" + result2.full_text + "[/i]",
            _run_tweet_post()))))))),
google = require('googleapis').google,
google_auth = new google.auth.OAuth2(state.google_secret.installed.client_id, state.google_secret.installed.client_secret, state.google_secret.installed.redirect_uris[0]),
google_auth.setCredentials(state.google_token),
googleAPIsGmail = google.gmail({ version: 'v1', google_auth }),
base64toUTF8 = (str) =>
  Buffer.from(str, 'base64').toString('utf8'),
get_gmail = (account, callback, maxResults = 10, q = 'from:noreply@steampowered.com') =>
  googleAPIsGmail.users.messages.list({ auth: google_auth, userId: 'me', maxResults: maxResults, q: q + ",to:" + account.mail },(err, response, gmails = []) =>
    (err || !response.data.messages) ? (
      log(accounts[0], 'FAILURE | gmail error: ' + (err ? err : 'no gmail data').yellow),
      callback(true, []))
    :(read_message = (m = 0) =>
      (m == response.data.messages.length) ?
        callback(false, gmails)
      : googleAPIsGmail.users.messages.get({
        auth: google_auth, userId: 'me', id: response.data.messages[m].id
      }, (err, response, body = '') => (
        response.data.payload.parts.forEach((part) => body += base64toUTF8(part.body.data)),
        gmails.push(body),
        read_message(m+1))))()),
search_gmail = (gmails, regex, match = gmails.join('\n').match(regex)) =>
  match && match[0] || '',
process.on('uncaughtException', (err) =>
  console_log(err.stack)),
("twitchchat" == '666') &&
  setTimeout(() =>
    (async () => (
      Twitch = await require('twitch').default,
      twitch = await Twitch.withCredentials(state.twitch_clientId, state.twitch_accessToken, undefined, {
        clientSecret: state.twitch_clientSecret,
        refreshToken: state.twitch_refreshToken,
        expiry: state.twitch_expiryTimestamp,
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => (
          state.twitch_accessToken = accessToken,
          state.twitch_refreshToken = refreshToken,
          state.twitch_expiryTimestamp = expiryDate)
      }),
      TwitchChat = require('twitch-chat-client').default,
      twitchChat = await TwitchChat.forTwitchClient(twitch),
      twitchChat.connect(),
      await twitchChat.waitForRegistration(),
      twitchChat.join('byteframe'),
      twitchChat.onWhisper((channel, user, message) =>
        twitchChat.whisper(user, get_reply(user, message))),
      twitchChat.onJoin((channel, user) =>
        (Math.floor(Math.random()* 6) != 0) &&
          twitchChat.say('byteframe', generate_halflife(data.soldiers, 30))),
      twitchChat.onPrivmsg((channel, user, message) => 
        (user != 'byteframe' && message.indexOf('@byteframe ') == 0) &&
          twitchChat.say('byteframe', '@' + user + ' ' + get_reply(user, message.substr(11))))))(), 10000),
data.faker_apps = [],
sharedconfig_vdf = SimpleVDF.parse(fs.readFileSync("C:\\Program Files (x86)\\Steam\\userdata\\752001\\7\\remote\\sharedconfig.vdf", 'utf8')).UserLocalConfigStore.Software.Valve.Steam.Apps,
Object.keys(sharedconfig_vdf).filter((appid) =>
  (sharedconfig_vdf[+appid].hidden && sharedconfig_vdf[+appid].hidden == 1 && state.not_faking.indexOf(+appid) == -1) &&
    data.faker_apps.push(+appid)),
remove_appid = (appid, index = data.faker_apps.indexOf(appid)) =>
  (index > -1) && (
    state.not_faking.push(appid),
    data.faker_apps.splice(index, 1)),
repl.start('> ');