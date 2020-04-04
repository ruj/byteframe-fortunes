"cat_apps": [
  500580,451010,330180,253110,384740,329860,418960,474980,742980,895750,914150,
  677290,336380,384120,369400,686180,350610,95700,343780,706980,913150,913120,
  510740,565190,492270,453340,491000,645500,656970,715440,667430,911270,863780,
  496120,236290,328550,637880,748110,772410,918180 ],
"question_apps": [ 716920,771320,628570,701280,99200,549280,727860,648780,664420,686550 ],
"meme_apps": [ 748600,833920 ],
running_video_post = false,
run_status_poster = (account, date = new Date()) => {
  if (Date.now() > config.status_poster.cat_time) {
    if (config.status_poster.cat >= byteframe.cats.length) {
      config.status_poster.cat = 0;
    }
    account.post_status("https://steamcommunity.com/sharedfiles/filedetails/?id=" +
      byteframe.cats[config.status_poster.cat] + generate_links() + " https://steamcommunity.com/sharedfiles/filedetails/?id=" + byteframe.cats[config.status_poster.cat+1]
      , byteframe.cat_apps[Math.floor(Math.random() * byteframe.cat_apps.length)]);
    config.status_poster.cat_time = Date.now()+16200000;
    config.status_poster.cat += 2;
  } else if (Date.now() > config.status_poster.meme_time) {
    if (config.status_poster.joke >= jokes.length) {
      config.status_poster.joke = 0;
    }
    var app1 = profile.game_favorite.slots[0][Math.floor(Math.random()*profile.game_favorite.slots[0].length)],
      app2 = profile.game_favorite.slots[0][Math.floor(Math.random()*profile.game_favorite.slots[0].length)];
    account.post_status(
      "[b] * " + jokes[config.status_poster.joke] + "[/b]\n\n" +
      "https://store.steampowered.com/app/" + app1.replace('_', '/') + 
      " [b] * " + jokes[config.status_poster.joke+1] + "[/b]\n\n" +
      pool(byteframe.emoticons[2], 35) +
      pool(byteframe.emoticons[3], 35) +
      pool(byteframe.emoticons[4], 35) +
      pool(byteframe.emoticons[5], 35) +
      pool(byteframe.emoticons[8], 35) +
      pool(byteframe.emoticons[9], 35) + "\n\n" +
      "[b] * " + jokes[config.status_poster.joke+2] + "[/b]\n\n" +
      "https://store.steampowered.com/app/" + app2.replace('_', '/') +
      " [b] * " + jokes[config.status_poster.joke+3] + "[/b] [spoiler]" + app1 + " | " + app2 + "[/spoiler]"
      , byteframe.meme_apps[Math.floor(Math.random() * byteframe.meme_apps.length)]);
    config.status_poster.meme_time = config.status_poster.cat_time+3600000;
    config.status_poster.joke = config.status_poster.joke+5;
  } else if (Date.now() > config.status_poster.question_time) {
    account.post_status(
      "https://steamcommunity.com/id/byteframe/inventory/#753_6_" +
        byteframe.backgrounds[Math.floor(Math.random()*byteframe.backgrounds.length)].id +
      "\n" + pool(comment_messages_question, 1, null)[0]() +
      "\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=" +
        byteframe.memes[Math.floor(Math.random()*byteframe.memes.length)],
      byteframe.question_apps[Math.floor(Math.random() * byteframe.question_apps.length)]);
    config.status_poster.question_time = config.status_poster.cat_time+7200000;
  }
  if (date.getUTCDay() != config.status_poster.video_day && !running_video_post) {
    running_video_post = true;
    var videos = [];
    (request_video_list = (p = 1) => {
      account.http_request('my/videos/?p=' + p + '&privacy=8', null, (body, response, err) => {
        var links = Cheerio.load(body)('a.profile_media_item');
        if (links.length) {
          links.each((i, element) => videos.push(element.attribs.href));
          var index = videos.indexOf(config.status_poster.last_video);
          if (index == -1 || index == videos.length-1) {
            return request_video_list(p+1);
          }
        }
        var f = videos.length-1;
        if (config.status_poster.last_video !== 0 && config.status_poster.last_video != videos[0]) {
          f = videos.indexOf(config.status_poster.last_video)-1;
        }
        account.http_request(videos[f], null, (body, response, err) => {
          body = Cheerio.load(body)('.nonScreenshotDescription').text().slice(2, -1).split('"')[1];
          var review = body
            , random_heart = Math.floor(Math.random()*byteframe.hearts.length)
            , text = '';
          if (body.indexOf('steamcommunity.com') == -1) {
            body = "https://store.steampowered.com/app/" + [323910,550768,719950][Math.floor(Math.random()*3)];
          } else {
            body = body.replace('id/byteframe/recommended', 'app'
              ).replace('steamcommunity.com', 'store.steampowered.com');
          }
          pool(emoticons_trade, 35, null).forEach((trade_pool) => {
            text = text + pool(trade_pool, 1) + '';
          });
          post = [ pool(byteframe.emoticons[0], 35) + "\n" +
            pool(byteframe.emoticons[1], 35) + "\n" +
            generate_greetings('|') + byteframe.greetings[byteframe.greetings.length-1] + " " +
            videos[f] + " " +
            generate_heart(byteframe.hearts, [
              byteframe.hearts[random_heart][6][0],
              byteframe.hearts[random_heart][6][1],
              " ║" + pool(decoration.symbols) + " [spoiler]" + new Date().toUTCString() + "[/spoiler]",
              " ║" + pool(decoration.symbols) + " steam://broadcast/watch/76561197961017729",
              " ║" + pool(decoration.symbols) + " " + comment_luck(),
              " ║" + pool(decoration.symbols) + " [b]https://steamcommunity.com/id/byteframe/videos[/b]",
              " ║" + pool(decoration.symbols) + " [u]" + review + "[/u]",
              " ║" + pool(decoration.symbols) + " https://youtube.com/c/byteframe",
            ], random_heart) + "\n" +
            body + "\n" +
            pool(byteframe.emoticons[12], 35) + "\n" +
            text ];
          account.post_status(post[0], [755770,689750,428690][Math.floor(Math.random()*3)], (err) => {
            config.status_poster.video_day = new Date().getUTCDay();
            config.status_poster.last_video = videos[f];
            running_video_post = false;
          });
        });
      });
    })();
  }
};
status_posts = [
  [ () => "https://steamcommunity.com/sharedfiles/filedetails/?id=" + pool(byteframe.cats)
    + [6,8,2,4,3,11,9,5].map((color) => pool(byteframe.links) + ' ' + pool(byteframe.emoticons[color], 1)).join(' ').replace(/:/g, 'ː')
    + " https://steamcommunity.com/sharedfiles/filedetails/?id=" + pool(byteframe.cats),
    () => pool(byteframe.cat_apps) ],
  [ () => "https://steamcommunity.com/id/byteframe/inventory/#753_6_"
    + pool(byteframe.backgrounds, 1, null)[0].id
    + "\n" + comment_messages[pool([17, 18, 19, 20, 21, 22])]()
    + "\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id="
    + pool(byteframe.memes),
    () => pool(byteframe.question_apps) ],
  [ (appid1 = pool(profile.game_favorite.slots[0]).replace('_', '/'),
    appid2 = pool(profile.game_favorite.slots[0]).replace('_', '/')) =>
    "[b] * " + get_reply('', 'joke') + "[/b]\n\n"
    + "https://store.steampowered.com/app/" + appid1
    + " [b] * " + get_reply('', 'joke') + "[/b]\n\n"
    + pool(byteframe.emoticons[2], 34) + pool(byteframe.emoticons[3], 34)
    + pool(byteframe.emoticons[4], 34) + pool(byteframe.emoticons[5], 34)
    + pool(byteframe.emoticons[8], 34) + pool(byteframe.emoticons[9], 34) + "\n\n"
    + "[b] * " + get_reply('', 'joke') + "[/b]\n\n"
    + "https://store.steampowered.com/app/" + appid2
    + " [b] * " + get_reply('', 'joke') + "[/b] [spoiler]" + appid1 + "," + appid2 + "[/spoiler]",
    () => pool(byteframe.meme_apps) ],
  [ (random_video = pool(Object.keys(config.byteframe.videos)), random_heart = Math.floor(Math.random()*byteframe.hearts.length)) =>
    pool(byteframe.emoticons[0], 34) + "\n"
    + pool(byteframe.emoticons[1], 34) + "\n"
    + generate_greetings('|')
    + ' https://steamcommunity.com/sharedfiles/filedetails/?id=' + random_video + "\n"
    + generate_heart(random_heart, [
        byteframe.hearts[random_heart][6][0],
        byteframe.hearts[random_heart][6][1],
        " ║" + pool(decoration.symbols) + " [spoiler]" + new Date().toUTCString() + "[/spoiler]",
        " ║" + pool(decoration.symbols) + " steam://broadcast/watch/76561197961017729",
        " ║" + pool(decoration.symbols) + " [i]https://twitch.tv/byteframe[/i]",
        " ║" + pool(decoration.symbols) + " [b]https://steamcommunity.com/id/byteframe/videos[/b]",
        " ║" + pool(decoration.symbols) + " [u]" + config.byteframe.videos[random_video][1].substr(config.byteframe.videos[random_video][1].indexOf('http')) + "[/u]",
        " ║" + pool(decoration.symbols) + " https://youtube.com/c/byteframe" ]) + "\n\n"
    + (config.byteframe.videos[random_video][1].indexOf('steamcommunity.com') == -1 ? "https://store.steampowered.com/app/" + pool([323910,550768,719950])
      : config.byteframe.videos[random_video][1].replace('id/byteframe/recommended', 'app').replace('steamcommunity.com', 'store.steampowered.com').slice(1).split('"')[1]) + "\n"
    + pool(byteframe.emoticons[12], 34) + "\n"
    + generate_emoticons(34),
    () => pool([755770,689750,428690]) ],
  [ () => comment_message_bot(6000).replace(/\[\/*h1\]/g, ''),
    () => pool(profile.game_favorite.slots[0]).match(/\d+/)[0] ] ];