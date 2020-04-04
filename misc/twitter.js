//------------------------------------------------------------------------------ PeriscopeSpamer
request('https://pscp.tv/byteframe_' , (err, response, body) =>
  twitter_request('POST', 'statuses/update', { status: generate_hashtags() + '\n' + body.match(/https:\/\/www\.pscp\.tv\/w\/[0-9A-Za-z]*/)[0] }))
//------------------------------------------------------------------------------ VideoSpammer
twitter_video_post = true,
(twitter_video_post) ? (
  twitter_video_post = false,
  video_twitter())
: (twitter_video_post = true,
  screenshot_twitter()),
//------------------------------------------------------------------------------ TwitterProcedureal
Twitter = require('twitter'),
twitter = new Twitter({
  consumer_key: config.twitter.twitter_consumer_key,
  consumer_secret: config.twitter.twitter_consumer_secret,
  access_token_key: config.twitter.twitter_access_token_key,
  access_token_secret: config.twitter.twitter_access_token_secret
}),
run_twitter_profile = (account, twitter_name, background_url, avatar_url, location) => {
  account.http_request(background_url, null, (body1, response, error1) => {
    account.http_request(avatar_url, null, (body2, response, error2) => {
      twitter_request('POST', 'account/update_profile_banner.json', { banner: base64(body1) }, (err, body, response) => {
        twitter_request('POST', 'account/update_profile_image.json', { image: base64(body2) }, (err, body, response) => {
          twitter_request('POST', 'account/update_profile.json', {
            name: twitter_name,
            url: 'https://steamcommunity.com/id/byteframe?l=' +
              [ 'bulgarian','czech','danish','dutch','english','finnish','french','german','greek','hungarian','italian','japanese','koreana','norwegian','polish','portuguese','brazilian','romanian','russian','schinese','spanish','swedish','tchinese','thai','turkish','ukrainian' ][Math.floor(Math.random() * 26)],
            location: location,
            description: generate_artwork_text(),
            profile_link_color: ((letters = '0123456789ABCDEF', color = '') => {
              for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
              }
              return color;
            })()
          });
        });
      });
    }, "GET", false);
  }, "GET", false);
};
twitter_request = (method, endpoint, data = {}, callback = null) => {
  var output_func = (err, body, response) => {
    var result = endpoint + ": " + (method + '-' + response.statusCode.toString()).yellow;
    if (err) {
      result = "FAILURE |" + "000".gray.inverse + "| " + result + ("=" + err.message).yellow;
    } else {
      result = "SUCCESS |" + "000".gray.inverse + "| " + result;
      if (callback !== null ) {
        callback(err, body, response);
      }
    }
    if (result.indexOf('FAILURE') > -1 || verbose) {
      console.log(result.replace('POST-', 'POST'.inverse + '-'));
    }
  };
  (method == 'GET') ?
    twitter.get(endpoint, data, output_func)
  : twitter.post(endpoint, data, output_func);
},
screenshots = [],
screenshots_vdf = SimpleVDF.parse(fs.readFileSync("./screenshots.vdf", 'utf8')).screenshots,
Object.keys(screenshots_vdf).forEach((gameid) =>
  (gameid != 'shortcutnames') &&
    Object.keys(screenshots_vdf[gameid]).forEach((screenshot) =>
      (screenshots_vdf[gameid][screenshot].Permissions == '8' && config.twitter.screenshots.indexOf(screenshots_vdf[gameid][screenshot].hscreenshot) == -1) &&
        screenshots.push(screenshots_vdf[gameid][screenshot]))),
shuffle_array(screenshots),
run_screenshot_tweet = (screenshot = screenshots.shift()) =>
  twitter_request('POST', 'media/upload', { media: fs.readFileSync('/mnt/Datavault/Work/Steam/screenshots/760/remote/' + screenshot.filename) }, (err, body, response) =>
    twitter_request('POST', 'statuses/update', { status: '#VirtualReality #VR #htcvive #mMR #OculusRift #AR #SteamVR #games ', media_ids: body.media_id_string }, (err, body, response) =>
      config.twitter.screenshots.push(screenshot.hscreenshot))),
run_tweet_post = (account) => {
  twitter_request('GET', 'statuses/user_timeline', { screen_name: 'byteframe'}, (err, body, reponse) => {
    var next_tweet = null;
    body.some((tweet) => {
      if (tweet.id_str == config.twitter.last_tweet) {
        return true;
      }
      if (!tweet.text.match(/^https:\/\/t\.co\/[0-9a-zA-Z_]*$/)) {
        next_tweet = tweet.id_str;
      }
    });
    if (next_tweet) {
      twitter_request('GET', 'statuses/show', { id: next_tweet, tweet_mode: 'extended' }, (err, result1, reponse) => {
        var entities = [ "[url=https://twitter.com/byteframe]@byteframe[/url]" ]
          , type = 'TWEETED';
        _run_tweet_post = () => {
          result1.entities.user_mentions.forEach((entity) => {
            entities.push('[url=https://twitter.com/' + entity.screen_name + ']@' + entity.screen_name + '[/url]');
          });
          result1.entities.hashtags.forEach((entity) => {
            entities.push('[url=https://twitter.com/hashtag/' + entity.text + ']#' + entity.text + '[/url]');
          });
          result1.entities.urls.forEach((entity) => {
            if (entity.display_url.indexOf('youtu') == 0) {
              result1.full_text = result1.full_text.replace(entity.url, entity.expanded_url);
            }
            result1_full_text = result1.full_text.replace(entity.expanded_url + "\n\n", entity.expanded_url + "\n");
          });
          account.post_status("[u]" + byteframe.greetings[Math.floor(Math.random() * byteframe.greetings.length)] + "[/u] " + pool(decoration.ascii) +
            " | [u]byteframe (from Steam) just [b]" + type + "[/b] something![/u]" +
              ' [url=https://twitter.com/statuses/' + result1.id_str + ']' + decoration.signs[0] + ':' + result1.id_str + '[/url]\n\n' +
            pool(byteframe.emoticons[3], 29, "|") + "\n\n" +
            html_convert(result1.full_text) + "\n\n" +
            pool(byteframe.emoticons[3], 29, "|") + "\n\n" +
            font("ENTITIES", 15) + ": " + shuffle_array(entities).join(',') + "\n" +
            pool(decoration.smileys)+ " [spoiler]" + new Date().toUTCString() + "[/spoiler] " + pool(decoration.smileys)
          , 809320, (post_id) => {
            config.twitter.last_tweet = result1.id_str;
          });
        };
        if (result1.retweeted) {
          type = 'RETWEETED';
          result1.full_text = "[i][u][b]@" + result1.retweeted_status.user.screen_name + ":[/b][/u]\n" + result1.retweeted_status.full_text + "[/i]";
        } else {
          result1.full_text = "[u][b]@byteframe:[/b][/u]\n" + result1.full_text.replace(
            / https:\/\/t.co\/[a-zA-Z0-9]*$/, '');
          if (result1.quoted_status || result1.in_reply_to_status_id_str) {
            if (result1.quoted_status) {
              type = 'QUOTED';
              entities.push('[url=https://twitter.com/' + result1.quoted_status.user.screen_name + ']@' + result1.quoted_status.user.screen_name + '[/url]');
            } else {
              type = 'REPLIED TO';
              result1.full_text = result1.full_text.replace(/@.+? /, '')
            }
            return twitter_request('GET', 'statuses/show', { id: (result1.quoted_status) ? result1.quoted_status.id_str : result1.in_reply_to_status_id_str, tweet_mode: 'extended' }, (err, result2, response) => {
              result1.entities.hashtags = result1.entities.hashtags.concat(result2.entities.hashtags);
              result1.entities.symbols = result1.entities.symbols.concat(result2.entities.symbols);
              result1.entities.user_mentions = result1.entities.user_mentions.concat(result2.entities.user_mentions);
              result1.entities.urls = result1.entities.urls.concat(result2.entities.urls);
              result1.full_text += "\n\n[i][u][b]@" + result2.user.screen_name + ":[/b][/u]\n" + result2.full_text + "[/i]";
              _run_tweet_post();
            });
          }
        }
        _run_tweet_post();
      });
    }
  });
};
//------------------------------------------------------------------------------