//------------------------------------------------------------------------------ ReviewVoteUp
http_request(a(i), 'https://steamcommunity.com/userreviews/rate/$REVIEWID', { rateup: true });
//------------------------------------------------------------------------------ Following
: (a % 31 == 0) ?
  accounts[0].friends('my/following', (steamids) =>
    (steamids.length) &&
      accounts[0].follow(steamids[0], 'unfollow', () =>
        (config.byteframe.follows.indexOf(steamids[0]) == -1) &&
          accounts[a].follow(steamids[0], 'follow',() =>
            config.byteframe.follows.push(steamids.shift()))))
accounts.forEach((account, i) =>
  setTimeout((account) => follow(account, accounts[0].steamID), 2500*i, account));
(accounts[0].followers > 969 && config.byteframe.nonfollowers.indexOf(accounts[a]) == -1) ? (
  config.byteframe.nonfollowers.push(accounts[a].steamID),
  follow(accounts[a], accounts[0].steamID, 'unfollow'))
: (accounts[0].followers < 969 && config.byteframe.nonfollowers.indexOf(accounts[a]) > -1) && (
  config.byteframe.nonfollowers = config.byteframe.nonfollowers.filter((item) => item !== accounts[a].steamID),
  follow(accounts[a], accounts[0].steamID)),
  (body.indexOf('Followers') > -1) && (
    account.followers = body.substr(body.indexOf('Followers')-50).match(/\d+/)[0])
//------------------------------------------------------------------------------ EarlierFriendsCheck
run_friends_check = (account,
  friends = Object.keys(account.user.myFriends).filter((friend) => account.user.myFriends[friend] == 3 || account.user.myFriends[friend] == 6)
    , removed = config.friends_log[account.user.steamID].last_friends.diff(friends)
    , added = friends.diff(config.friends_log[account.user.steamID].last_friends)) =>
  (friends.length) && (
    (!config.friends_log[account.user.steamID].hasOwnProperty('friends_diff')) ?
      config.friends_log[account.user.steamID].friends_diff = []
    : null,
    lines = (action, players, callback) =>
      (!players.length) ?
        callback();
      : account.user.getPersonas(players, (personas, date = new Date()) =>
        Object.keys(personas).forEach((persona) =>
          config.friends_log[account.user.steamID].friends_diff.push(
            [ date.getFullYear() + "-" + pad(date.getMonth()+1) + "/" + pad(date.getDate()) +
              "-" + pad(date.getHours()) + ":" + pad(date.getMinutes()),
            action, friends.length, persona, personas[persona].player_name.replace(
              /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '') ]));
        callback());
    lines(false, removed, () =>
      lines(true, added, () =>
        (added.length || removed.length) &&
          config.friends_log[account.user.steamID].last_friends = friends)));
//------------------------------------------------------------------------------ FollowCurator
timers = [];
timers.forEach((timer) => clearTimeout(timer));
accounts.forEach((account, i) =>
  timers.push(setTimeout(() =>
    http_request(account, 'https://store.steampowered.com/curators/ajaxfollow', { 'clanid': 2751860 }), 3000*i)));
//------------------------------------------------------------------------------ FriendsListCheckJquery
unsafeWindow.request_friends_list_xml = function(callback) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: '//steamcommunity.com/profiles/' + g_steamID + "/friends/?xml=1",
    onerror: function() { setTimeout(request_friends_list, 5000); },
    onload: function(response) {
      friends = [];
      jQuery(response.responseText).find('friend').each(function(index, friend) {
        friends.push(friend.innerHTML);
      });
      callback();
    }
  });
};
unsafeWindow.request_profile = function(steamid, callback) {
  jQuery.get('//steamcommunity.com/profiles/' + steamid
  ).fail(function() {
    setTimeout(request_profile, 5000, steamid, callback);
  }).done(function(response) {
    var profile = { persona: '?', tp: '?????', cf: '???', tf: '????', cg: '??' };
    if (jQuery(response).find('span.actual_persona_name').length) {
      profile.persona = jQuery(response).find('span.actual_persona_name')[0].innerText;
    }
    if (jQuery(response).find('a.commentthread_allcommentslink').length) {
      profile.tp = jQuery(response).find(
        'a.commentthread_allcommentslink')[0].innerText.slice(9, -9).replace(',', '');
    }
    if (jQuery(response).find('a[href^=javascript\\:ShowFriendsInCommon]').length) {
      profile.cf = jQuery(response).find(
        'a[href^=javascript\\:ShowFriendsInCommon]')[0].innerText.slice(0, -8);
    }
    if (jQuery(response).find('a[href$=friends\\/]').last().children().length > 1) {
      profile.tf = jQuery(response).find(
        'a[href$=friends\\/]').last().children()[1].innerHTML.trim().replace(',', '');
    }
    if (jQuery(response).find('a[href$=groupscommon\\/]').length) {
      profile.cg = jQuery(response).find(
        'a[href$=groupscommon\\/]')[0].text.split(' ')[0];
    }
    callback(profile);
  });
};
var date = new Date();
function lines(action, players, callback, p = 0) {
  if (p == players.length) {
    callback()
  } else {
    request_profile(players[p], function(profile) {
      var line = pad(date.getMonth()+1) + "/" + pad(date.getDate()) +
        "-" + pad(date.getHours()) + ":" + pad(date.getMinutes()) +
        " (" + action + ")=" + friends.length +
        " '<a href=\"http://steamcommunity.com/profiles/" + players[p].steamid +
        "\">http://steamcommunity.com/profiles/" + players[p].steamid +
        "</a>', // " + profile.persona;
      diff += "\n" + line + "<br/>";
      console.log(line.replace(/<\/?[^>]+(>|$)/g, "").substr(12));
      lines(action, players, callback, p+1);
    });
  }
}
//------------------------------------------------------------------------------ FriendsListCheckConversion
var removed = config[account.user.steamID.toString()].last_friends.diff(friends)
  , added = friends.diff(config[account.user.steamID.toString()].last_friends);
if (!config[account.user.steamID.toString()].hasOwnProperty('friends_diff')) {
  config[account.user.steamID.toString()].friends_diff = [];
      config[account.user.steamID.toString()].friends_diff.push([
      config[account.user.steamID.toString()].last_friends = friends;
fs = require('fs');
diff = fs.readFileSync('2.diff', 'utf8');
console.log("[");
diff.split('\n').forEach((line) => {
  if (/=\d\d\d\d/.test(line)) {
    date = line.substr(0,11);
    action = (line.indexOf("(add)") ? true : false);
    total = parseInt(line.match(/=\d\d\d\d/)[0].substr(1));
    steamid = line.match(/76561[0-9]*/)[0];
    player = line.match(/\/\/ .*/)[0].substr(3).replace('<br/>', '').replace(/\\/g, '').replace(/"/g, '');
    console.log('  [ "2018-' + date + '", ' + action + ", " +total + " ,\"" + steamid + "\", \"" + player + '" ], ');
  }
});
console.log("]");
diff += "\n" + pad(date.getMonth()+1) + "/" + pad(date.getDate()) +
"-" + pad(date.getHours()) + ":" + pad(date.getMinutes()) +
" (" + action + ")=" + friends.length +
" '<a href=\"http://steamcommunity.com/profiles/" + persona +
"\">http://steamcommunity.com/profiles/" + persona +
"</a>', // " + personas[persona].player_name.replace(
  /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '') + "<br/>";
line = line.replace(/'\<a .*profiles\//, '[/b]| [u]').replace(
'(add)=', " - [" + pool_elements(green_icons) + '] [b] ').replace(
'(<font color="red">DEL</font>)=', " - [" + pool_elements(red_icons) + '] [b]').replace(
'</a>\', \/\/ ', "[/u] | " + pool_elements(emoticon_static[1]) + " = [i]\"").replace(
"<br/>", "\"");
var nameLength = line.substr(line.indexOf('=')+2).length
if (nameLength > 22) {
  line = line.slice(0, -(nameLength-22));
}
friend_activity += line + "[/i]\n";
//------------------------------------------------------------------------------ EditGroupProcedure
edit_group = (group, text) => {
  http_request('groups/' + group + '/edit', {}, (body, response, err) => {
    var data = Cheerio.load(body)("#editForm").serializeArray();
    data[3].value = text;
    http_request('groups/' + group + '/edit', data);
  });
};
//------------------------------------------------------------------------------ StatusPostRemnants
if (Date.now() > config.cat_time) {
  if (config.cat >= byteframe.cats.length) {
    config.cat = 0;
    byteframe.cats[config.cat] + " https://steamcommunity.com/sharedfiles/filedetails/?id=" + byteframe.cats[config.cat+1]
  config.cat_time = Date.now()+16200000;
  config.cat += 2;
} else if (Date.now() > config.meme_time) {
  if (config.joke >= jokes.length) {
    config.joke = 0;
    "[b] * " + jokes[config.joke] + "[/b]\n\n" +
    " [b] * " + jokes[config.joke+1] + "[/b]\n\n" +
    "[b] * " + jokes[config.joke+2] + "[/b]\n\n" +
    " [b] * " + jokes[config.joke+3] + "[/b] [spoiler]" + app1 + " | " + app2 + "[/spoiler]"
  config.meme_time = config.cat_time+3600000;
  config.joke = config.joke+5;
} else if (Date.now() > config.question_time && account.backgrounds.pool.length) {
  config.question_time = config.cat_time+7200000;
if (date.getUTCDay() != config.video_day) {
  var index = videos.indexOf(config.last_video);
  if (config.last_video !== 0 && config.last_video != videos[0]) {
    f = videos.indexOf(config.last_video)-1;
      config.video_day = new Date().getUTCDay();
      config.last_video = videos[f];
//------------------------------------------------------------------------------ CommunitySpammerFixed
ToggleManageFriends();
jQuery("#manage_friends").after('<div class="commentthread_entry"><div class="commentthread_entry_quotebox"><textarea rows="1" class="commentthread_textarea" id="comment_textarea" placeholder="Add a comment" style="overflow: hidden; height: 20px;"></textarea></div><div class="commentthread_entry_submitlink" style=""><a class="btn_grey_black btn_small_thin" href="javascript:CCommentThread.FormattingHelpPopup( \'Profile\' );"><span>Formatting help</span></a> &nbsp; <span class="emoticon_container"><span class="emoticon_button small" id="emoticonbtn"></span></span><span class="btn_green_white_innerfade btn_small" id="comment_submit"><span>Post Comments to Selected Friends</span></span></div></div><div id="log"><span id="log_head"></span><span id="log_body"></span></div>');
new CEmoticonPopup( $J('#emoticonbtn'), $J('#commentthread_Profile_0_textarea') );
jQuery("#comment_submit").click(function() {
  const total = jQuery(".selected").length;
  const msg = jQuery("#comment_textarea").val();
  if (total > 0 && msg.length > 0) {
    jQuery("#log_head, #log_body").html("");
    jQuery(".selected").each(function(i) {
      let profileID = this.getAttribute("data-steamid");
      (function(i, profileID) {
        setTimeout(function() {
          jQuery.post("//steamcommunity.com/comment/Profile/post/" + profileID + "/-1/", { comment: msg, count: 6, sessionid: g_sessionID }, function(response) {
            if (response.success === false) {
              jQuery("#log_body")[0].innerHTML += "<br>" + response.error;
            } else {
              jQuery("#log_body")[0].innerHTML += "<br>Successfully posted comment on <a href=\"http://steamcommunity.com/profiles/" + profileID + "\">" + profileID + "</a>";
            }
          }).fail(function() {
            jQuery("#log_body")[0].innerHTML += "<br>Failed to post comment on <a href=\"http://steamcommunity.com/profiles/" + profileID + "\">" + profileID + "</a>";
          }).always(function() {
            jQuery("#log_head").html("<br><b>Processed " + (i+1) + " out of " + total + " friends.<b>");
          });
        }, i * 6000);
      })(i, profileID);
    });
  } else {
    alert("Please make sure you entered a message and selected 1 or more friends.");
  }
});
//------------------------------------------------------------------------------ StartProfileCommenter
const POST_MAX = 190;
var force_steamid = null;
ms_until_tomorrow = () => {
  var now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1, 0)-now;
};
calculate_delay = (minus = 0) => {
  return Math.max(90000, Math.floor((ms_until_tomorrow()-1800000)/(config.byteframe.post_free-minus)));
};
var cooldown_count = 0;
start_profile_commenter = (account) => {
  var date = new Date();
  if (config.byteframe.day != date.getUTCDay()) {
    config.byteframe.day = date.getUTCDay();
    config.byteframe.post_free = POST_MAX;
  }
  if (config.byteframe.post_free < 1) {
    return setTimeout(start_profile_commenter, ms_until_tomorrow(), account);
  }
  setTimeout(start_profile_commenter, calculate_delay(1), account);
  var friends = Object.keys(account.user.myFriends).filter((friend) => {
    return account.user.myFriends[friend] == 3 || account.user.myFriends[friend] == 6;
  });
  if (friends.indexOf(config.byteframe.last_steamid) >= friends.length) {
    config.byteframe.last_steamid = friends[0];
  }
  account.http_request('my/allcomments', null, (body, response, err) => {
    var last_replyer = -1
      , replies = Cheerio.load(body)('div.commentthread_comment_author').toArray().reverse().map((item, index) => {
          reply = Cheerio.load(item);
          return [ reply('a.actionlink')[0].attribs.href.substr(73, 19).match(/\d+/g)[0],
            translate_id(reply('a.commentthread_author_link')[0].attribs['data-miniprofile']) ];
        });
    (check_replies = (r) => {
      post_comments = (steamid, reply = '') => {
        account.http_request('profiles/' + steamid + '/allcomments' + reply, null, (body, response, err) => {
          increment_last_steamid = () => {
            if (steamid == config.byteframe.last_steamid) {
              config.byteframe.last_steamid = friends[friends.indexOf(config.byteframe.last_steamid)+1];
            }
          };
          check_comments = (body, steamid, count) => {
            if (steamid_blacklist.indexOf(steamid) > -1 || steamid == account.user.steamID
            || body.indexOf('commentthread_textarea') == -1) {
              return true;
            }
            var comments = body.match(/commentthread_author_link" href="https:\/\/.*?"/g);
            if (comments) {
              for (var i = 0; i < comments.length && i < count; i++) {
                if (comments[i].slice(33,-1) == 'https://steamcommunity.com/id/byteframe') {
                  return true;
                }
              }
            }
            return false;
          };
          if (check_comments(body, steamid, 6)) {
            increment_last_steamid();
            return check_replies(r+1);
          }
          var comment_message = pool_elements(comment_messages, 1, null)[0];
          (try_comment_message = () => {
            var msg = comment_message(body.match(/<title>.*<\/title>/)[0].slice(26,-28));
            if (msg.length > 975) {
              return try_comment_message();
            }
            increment_last_steamid();
            account.post_comment((!force_steamid ? steamid : force_steamid), msg, 3, -1, () => {
              config.byteframe.post_free--;
            });
          })();
        });
      };
      if (r < replies.length) {
        config.byteframe.reply = replies[r][0];
        if (replies[r][1] != last_replyer) {
          last_replyer = replies[r][1];
          return post_comments(replies[r][1], '?REPLY');
        }
        return check_replies(r+1);
      }
      post_comments(config.byteframe.last_steamid);
    })(replies.findIndex((reply) => { return reply[0] == config.byteframe.reply; })+1);
  });
};
//------------------------------------------------------------------------------ NodeCustomRequests
finish_request_haiku = (response) => {
  return Cheerio.load(response)("strong").text().replace(
    '\n\n\n', '\n').replace('\n\n', '\n').replace('\n\n', '\n').trim();
};
finish_request_bsdfortune = (response) => {
  return Cheerio.load(response)(".fortune p").text().replace('\n\n','').trim();
};
finish_request_subfushion = (response) => {
  var text = Cheerio.load(response).root().text();
  return text.substr(text.indexOf('-->')+3).trim().substr(5).trim();
};
requests = [
  { url: "http://smalltime.com/Haiku",
    translation: (response) => { return finish_request_haiku(response); } },
  { url: "http://bsdfortune.com/discworld.php",
    translation: (response) => { return finish_request_bsdfortune(response); } },
  { url: "http://www.behindthename.com/random/random.php?number=1&gender=m&surname=&randomsurname=yes&norare=yes&nodiminutives=yes&all=no&usage_eng=1",
    translation: (response) => { return Cheerio.load(response)(".heavyhuge").text().trim(); } },
  { url: "http://dfrench.hypermart.net/cgi-bin/bashFortune/mkFortune.cgi?FORTFILE=./fortunes.txt",
    translation: (response) => { return Cheerio.load(response)("table").text().trim(); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=cookie&number=1",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://smalltime.com/Haiku",
    translation: (response) => { return finish_request_haiku(response); } },
  { url: "http://smalltime.com/Haiku",
    translation: (response) => { return finish_request_haiku(response); } },
  { url: "http://bsdfortune.com/xfiles.php",
    translation: (response) => { return finish_request_bsdfortune(response); } },
  { url: "http://bsdfortune.com/xfiles.php",
    translation: (response) => { return finish_request_bsdfortune(response); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=startrek&number=2",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://www.bash.org/?random",
    translation: (response) => { return Cheerio.load(response)("td").eq(4).text(); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=calvin&number=2",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=futurama&number=2",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=love&number=2",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=drugs&number=2",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=pets&number=2",
    translation: (response) => { return finish_request_subfushion(response); } },
  { url: "http://subfusion.net/cgi-bin/quote.pl?quote=zippy&number=1",
    translation: (response) => { return finish_request_subfushion(response); } },
];
request_data = (callback) => {
  request_count = requests.length
  finish_request = (i, response = '') => {
    if (response !== '') {
      requests.data = response;
    } else if (typeof requests.data == 'undefined') {
      requests.data = 'request_data_error';
    }
    request_count--;
    if (request_count === 0) {
      callback();
    }
  };
  for (var i = 0; i < requests.length; i++) {
    ((i) => {
      http_request(requests.url, {}, (body, response, err) => {
        var translation = '';
        try {
          if (!err) {
            translation = requests.translation(body);
          }
        } catch (err) {
          console.error('request error: ' + i);
        }
        finish_request(i, translation);
      }, 'GET', true);
    })(i);
  }
};
//------------------------------------------------------------------------------ Following
account.http_request('my/following', null, (body, response, err, followed = Cheerio.load(body)('div.friend_block_v2')) =>
  (followed.length) && (
    followee = followed[Math.floor(Math.random()*followed.length)].attribs['data-steamid'],
  account.follow(followee, 'unfollow', () =>
    (config.byteframe.follows.indexOf(followee) == -1) &&
  accounts[a].follow(followee, 'follow',() =>
    config.byteframe.follows.push(followee)))))
//------------------------------------------------------------------------------ HandleInvite
accounts[a].handle_invite = (steamID) => (
  accounts[a].log('SESSION | friend: ' + ("https://steamcommunity.com/profiles/" + steamID).yellow),
  friends = Object.keys(accounts[a].user.myFriends).filter((key) => accounts[a].user.myFriends[key] == 3),
  (friends.length >= accounts[a].friends_max-2)
    ? ([...Array(friends.length-accounts[a].friends_max-2).keys()].forEach((index) =>
        accounts[a].user.removeFriend(friends[Math.floor(Math.random()*friends.length)])),
      setTimeout(accounts[a].user.addFriend(steamID), 1000))
  : accounts[a].user.addFriend(steamID))
//------------------------------------------------------------------------------ GroupChecks
accounts.forEach((account) =>
  (Object.keys(account.user.myGroups).indexOf('103582791460540139') == -1) &&
    console.log(account.name))
profile.group_favorite.slots[0]
["10358279146054065_XXX"].forEach((group) =>
  accounts.forEach((account) =>
    (Object.keys(account.user.myGroups).indexOf(group.substr(0, group.indexOf('_')-1)) == -1) && (
      console.log(account.name + " | " + group.substr(0, group.indexOf('_')-1)))))
[ "103582791460540047",
  "103582791460540139",
  "103582791460540021",
  "103582791460540093",
  "103582791460540715",
  "103582791460539768",
  "103582791460539840",
  "103582791460540553",
  "103582791460540514",
  "103582791460539942",
  "103582791460540677",
  "103582791460539976",
  "103582791460540693",
  "103582791460540576",
  "103582791460540634",
  "103582791460540654",
  "103582791460540604",
  "103582791460540491",
  "103582791460540181" ].forEach((group) =>
    accounts.forEach((account) =>
      (Object.keys(account.user.myGroups).indexOf(group) != -1) &&
        console.log(account.user.myGroups[group])))
//------------------------------------------------------------------------------ CuratorBulkBaseFills
timers.forEach((timer) => clearTimeout(timer));
timers = [];
timing = -1;
shuffle_array(Object.keys(state.videos)).forEach((video) =>
  ((!state.reviews.hasOwnProperty(state.videos[video].appid) || !state.reviews[state.videos[video].appid].curated) && !state.videos[video].curated) &&
    timers.push(setTimeout((blurb = state.videos[video].text.substr(1, state.videos[video].text.indexOf('http')-2).substr(0,203)) =>
      http_request(accounts[0], "https://store.steampowered.com/curator/2751860-primarydataloop/admin/ajaxcreatereview", {
        appid: state.videos[video].appid,
        blurb: (blurb.length > 200) ? blurb.substr(0,200).slice(0,-3) + "..." : blurb.trim(),
        link_url: state.videos[video].link_url,
        recommendation_state: 0 }, (body, response, error) => (
          console.log('https://steamcommunity.com/sharedfiles/filedetails/?id=' + video),
          state.videos[video].curated = true)), 15000*++timing)));
timing = -1;
shuffle_array(Object.keys(state.reviews)).forEach((r) =>
  (!state.reviews[r].curated && state.reviews[r].text.indexOf('https://') > -1) && (
    console.log('https://steamcommunity.com/id/byteframe/recommended/' + r),
    setTimeout((r,
      blurb = state.reviews[r].text.substr(0, state.reviews[r].text.indexOf('[spoiler]')).replace(/\[[\/biu]*\]/g, '').substr(0,203),
      link_url = state.reviews[r].text.match(/https:\/\/.+\..+\/.+/)) => 
      http_request(accounts[0], "https://store.steampowered.com/curator/2751860-primarydataloop/admin/ajaxcreatereview", {
        appid: r,
        blurb: (blurb.length > 200) ? blurb.substr(0,200).slice(0,-3) + "..." : blurb.trim(),
        link_url: link_url[0],
        recommendation_state: (!state.reviews[r].rating ? 1 : 0) }, (body, response, error) =>
          state.reviews[r].curated = true), 20000*++timing, r)));
//------------------------------------------------------------------------------