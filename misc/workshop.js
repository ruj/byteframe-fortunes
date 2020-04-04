//------------------------------------------------------------------------------ EditReview
edit_reviews = (account, r = 0) => {
  var review_data = byteframe.review_data;
  if (r == review_data.length) {
    return console.log('done');
  } else if (review_data[r].edited || !review_data[r].showcasing) {
    return edit_reviews(account, r+1);
  }
  review_data[r].new_text = generate_links() + "\n"
    + pool_emoticon() + " " + review_data[r].text + " " + pool_emoticon();
  review_data[r].new_text = review_data[r].new_text.replace(/[.] /g, ".유 ");
  review_data[r].new_text = review_data[r].new_text.replace(/[?] /g, "?유 ");
  review_data[r].new_text = review_data[r].new_text.replace(/! /g, "!유 ");
  review_data[r].new_text = review_data[r].new_text.replace(/, /g, ",유 ");
  review_data[r].new_text = review_data[r].new_text.replace(/[.]\[/g, ".유 [");
  review_data[r].new_text = review_data[r].new_text.replace(/[?]\[/g, "?유 [");
  review_data[r].new_text = review_data[r].new_text.replace(/!\[/g, "!유 [");
  review_data[r].new_text = review_data[r].new_text.replace(/,\[/g, ",유 [");
  review_data[r].new_text = review_data[r].new_text.replace(/\n\n/g, "유\n\n");
  while (true) {
    if (review_data[r].new_text.indexOf("유") == -1) {
      break;
    }
    review_data[r].new_text = review_data[r].new_text.replace('유', " " + pool_emoticon());
  }
review_data[r].new_text =   review_data[r].text;
  account.http_request('https://steamcommunity.com/userreviews/update/' + review_data[r].id, {
    received_compensation: false, review_text: review_data[r].new_text, voted_up: review_data[r].rating
  }, (body, reponse, error) => {
    console.log(r + " -- https://steamcommunity.com/id/byteframe/recommended/" + review_data[r].appid);
    edit_reviews(account, r+1);
  });
};
//------------------------------------------------------------------------------ CheckContentFiles
check_content_files = (account, content_files = {}, page = 1, base = 'my/videos', url = base + "/?p=" + page + '&privacy=8&sort=oldestfirst') =>
  http_request(account, url, null, (body, response, err, files = body.match(/OnVideoClicked\( \d+/g)) =>
    (typeof files !== 'undefined' && !files.length) ?
      console_log('done: ' + content_files.length)
    : (get_content_details = (f = files.length-1) =>
      (f < 0 || content_files[files[f].substr(16)]) ?
        check_content_files(account, content_files, page+1, base)
      : http_request(account, 'sharedfiles/filedetails/?id=' + files[f].substr(16), null, (body, response, err) => (
          content_files[files[f].substr(16)] = [ body.match(/workshopItemTitle\"\>.+\</)[0].slice(19, -1)
            , Cheerio.load(body)('.nonScreenshotDescription').text().slice(1, -1)
            , body.match(/"appid" value="\d+"/)[0].slice(15, -1)
            , 0 ],
          console.dir(content_files[files[f].substr(16)]),
          get_content_details(f-1))))());
//------------------------------------------------------------------------------ GenericFunction
file = (account, id, action = 'favorite', callback = null) =>
  http_request(account, 'sharedfiles/' + action + '?' + id, { id: id, appid: 0 }, (body, response, err) =>
    (callback !== null) &&
      callback(body), true)
//------------------------------------------------------------------------------ SubcribeAllPage
jQuery('div.subscribeIcon').each((index, icon) => icon.click());
//------------------------------------------------------------------------------ AddVideo
http_request(accounts[0], 'my/videos/', { videos: [ 'youtube_id' ], action: 'add', app_assoc: '250820' });
account.http_request('my/videos/add', { action: "add", sessionid: account.community.sessionID, videos: [ "qQpxmGnzYa0" ], app_assoc: "602630", other_assoc: "" });
accounts[0].http_request('/my/videos/add', {   "action": "add", "videos[]": "pQwRiDhikL4",  "app_assoc": "", "other_assoc": "byteframe" })
jQuery.post('https://steamcommunity.com/id/byteframe/videos/add', {
  "action": "add",
  "videos[]": "pQwRiDhikL4",
  "app_assoc": 440,
  "other_assoc": ""
});
//------------------------------------------------------------------------------ GetPeople1
people = [];
Object.keys(accounts[0].user.myFriends).forEach((friend, n, name = find_name(accounts[0], friend)) => (name.length < 13) && people.push([friend, name]));
//------------------------------------------------------------------------------ GetPeople2
people = [];
Object.keys(accounts[0].user.users).forEach((friend, n) =>
  (accounts[0].user.users[friend].persona_state == 3) &&
    people.push([friend, accounts[0].user.users[friend].player_name]));
//------------------------------------------------------------------------------ GetPeopleJQuery
people = [];
jQuery(".friend_block_v2").each((n, block) =>
  people.push([block.dataset.steamid, block.outerText.split('\n')[0]]));
people.forEach((person, n, array, name = person[1].trim()) =>
  (name.length < 13 && name.length > 4 && name.indexOf('"') == -1) &&
    console.log("[ \"" + person[0] + "\", \"" + person[1] + "\" ],"))
//------------------------------------------------------------------------------ AddContributorsSimple
data.guides.forEach((guide_id, n) =>
  setTimeout(() =>
    http_request(accounts[0], 'sharedfiles/addcontributor/', { id: guide_id, steamid: '76561198050000229'}), n*3500))
//------------------------------------------------------------------------------ AddContributorComplex BUGGED!?
last_index = 0;
(contribute = (n, characters = 0) =>
  (n < data.guides.length) && (
    last_index = n,
    (characters < 42) ? (
      person = pool(people, 1, null)[0],
      http_request(accounts[0], 'sharedfiles/addcontributor/', { id: data.guides[n], steamid: person[0]}, (body, response, err) =>
        setTimeout(() => contribute(n, characters + person[1].length), 4444)))
    : contribute(n+1)))(last_index);
//------------------------------------------------------------------------------ SetVisibility
data.guide_favorite.concat(data.guide_favorite_showcase).forEach((guide_id) =>
  setTimeout(() =>
    http_request(accounts[0], 'sharedfiles/itemsetvisibility', { id: guide_id, visibility: 2}), n*1500))
//------------------------------------------------------------------------------ RateAccordingly
verbose = true;
[...Array(69).keys()].forEach((i) =>
  setTimeout(() => login(a(i)), 1234*i)),
guide_votes = {};
new_guides = data.guides.slice(0);
new_guides.forEach((guide) =>
  guide_votes[guide] = []);
frequency = 2000;
shuffle_array(new_guides),
(rate_accordingly = (n = 0, id = new_guides[n]) =>
  (n < new_guides.length-1) &&
    http_request(accounts[0], 'sharedfiles/filedetails/?id=' + id + '&preview=true', null, (body, response, error,
      ratings = +body.match(/\d* ratings/)[0].match(/\d*/)[0],
      action = (ratings > 69 ? 'down' : 'up'),
      ratings_needed = Math.abs(69 - ratings)) => (
      console.log(id + ": " + ratings + "|" + ratings_needed + "|" + action),
      (rate = (m = 0) =>
        (m == ratings_needed || action == 'down') ?
          rate_accordingly(n+1)
        :[...Array(69).keys()].some((i) =>
          (!a(i).limited && guide_votes[id].indexOf(a(i).index) == -1) ? (
            http_request(a(i), 'sharedfiles/vote' + action + '?' + id , { "id": id , "appid": 0 }, (body, response, err) => (
              setTimeout((err) =>
                (err) ?
                  rate(m)
                : (guide_votes[id].push(a(i).index),
                  rate(m+1)), frequency, err)), true),
            true)
          : false))())))()
//------------------------------------------------------------------------------ SmatterFavorite
smatter = [ 1780348952,1780350483,1780351096,1780351340,1780351371,1780351492,
  1780351538,1780351583,1780351613,1780352505,1780351718,1780351777,
  1780351799,1780351845,1780351875,1780352205,1780352231,1780352403 ];
smatter.forEach((id, n) =>
  setTimeout((id) =>
    [...Array(Math.floor(Math.random()*(12-8)+8)).keys()].forEach((i) => (
      http_request(a(i), 'sharedfiles/voteup', { "appid": 0, "id": id }),
      http_request(a(i), 'sharedfiles/favorite', { "appid": 0, "id": id }))), 9999*n, id))
//------------------------------------------------------------------------------ GatherVideos
temp_videos = {},
check_videos = (p = 49) =>
  (p > 0) &&
    http_request(accounts[0], 'my/videos/?p=' + p + '&privacy=8&sort=newestfirst', null, (body, response, err,
      files = body.match(/OnVideoClicked\( \d+/g)) => (
      files.forEach((file) =>
        temp_videos[file.substr(16)] = ''),
        check_videos(p-1))))()
        Object.keys(state.videos).forEach((video1) =>
          (!temp_videos.hasOwnProperty(video1)) &&
            console.log(video1))
//------------------------------------------------------------------------------ VideoStats
(videoStats = function() {
  (function request_video_list(p = 1) {
    jQuery.get('//steamcommunity.com/my/videos/?p=' + p
    ).fail(function() {
      setTimeout(request_video_list, 5000, p);
    }).done(function(response) {
      console.log(`page: ${p}`);
      videos = [];
      jQuery(response).find('a.profile_media_item').each(function(i, element) {
        videos.push(element.href);
      });
      (function request_video_details(f = 0) {
        if (f == videos.length) {
          request_video_list(p+1);
        } else {
          jQuery.get(videos[f]
          ).fail(function() {
            setTimeout(request_video_details, 5000, f);
          }).done(function(response) {
            response = jQuery(response).find('.nonScreenshotDescription'
              )[0].innerText.split('\n')[2].slice(0, -1);
            console.log(response);
            request_video_details(f+1);
          });
        }
      })();
    });
  })();
})();
//------------------------------------------------------------------------------ YoutubeJQuery
if (typeof jq === 'undefined') {
  var jq = document.createElement('script');
  jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
  document.getElementsByTagName('head')[0].appendChild(jq);
  setTimeout(function() {
    loaded = 1;
    jQuery.noConflict();
    proceed();
  }, 2000);
} else {
  proceed();
}
function proceed() {
  var videos = jQuery('.vm-thumbnail-container a.yt-uix-sessionlink');
  (function youtube_video(v = videos.length-1) {
    if (v == -1) {
      console.log('youtube_page(p-1);');
    }
    jQuery.get(videos[v].href).done(function(response) {
      var title = jQuery(response).find('h1.title').innerText;
      var description = jQuery(response).find('#description')[0].innerText.split('\n');
      console.log(title + " | " + description[0] + " | " + description[2]);
      youtube_video(v--);
    });
  })();
}
} else if (loaded == 0){
    console.log('still loading');
} else if (loaded == 1){
  (function youtube_page(p = 19) {
    if (p == -1) {
      return true;
    }
    jQuery.get('https://www.youtube.com/my_videos?o=U&pi=' + p,
    ).done(function(response) {
      var videos = jQuery(response).find('.vm-thumbnail-container a.yt-uix-sessionlink');
      (function youtube_video(v = videos.length-1) {
        if (v == -1) {
          youtube_page(p-1);
        }
        console.log(videos[v].href);
        return 1;
        jQuery.get(videos[v].href).done(function(response) {
          var title = jQuery(response).find('h1.title')[0].innerText;
          var description = jQuery(response).find('#description')[0].innerText.split('\n');
          console.log(title);
          console.log(description[0]);
          console.log(description[2]);
        });
      })();
    });
  })();
}
//------------------------------------------------------------------------------ RemoteStorageApp
(get_page = (p = 0) => {
  account.http_request('https://store.steampowered.com/account/remotestorageapp?appid=760&index=' + p*50, {}, (body, response, error) => {
    if (err) {
      console.error('ERROR');
      return setTimeout(get_page, 5000, p);
    }
    Cheerio.load(body)('tr').each((index, item) => { console.dir(item.children[4].data); });
      .data.trim().replace(' Download', '').replace(/\s\s+/g, '||'));    });
  });
})();
//------------------------------------------------------------------------------ VideoProcessing
videos0 = [];
(request_video_list = (p = 1) => {
  console_log('requesting video page... #' + p);
  jQuery.get('//steamcommunity.com/my/videos/?p=' + p).fail(function() {
    setTimeout(request_video_list, 5000, p);
  }).done(function(response) {
    response = jQuery(response).find('a.profile_media_item');
    if (!response.length) {
      return console_log('videos0: ' + videos0.length);
    }
    response.each(function(i, element) {
      videos0.push(element.href);
    });
    request_video_list(p+1);
  });
})();
videos1 = videos0.slice();
videos1.splice(391,1);
console_log('videos1: ' + videos1.length);
videos2 = [];
(request_video_details = (f = 0) => {
  if (f == videos1.length) {
    return console.log('videos2: ' + videos2.length);
  }
  jQuery.get(videos1[f]).fail(function() {
    setTimeout(request_video_details, 5000, f);
  }).done(function(response) {
    if (f % 25 == 0) {
      console.log(f);
    }
    videos2.push(response);
    request_video_details(f+1);
  });
})();

videos3 = [];
(process_video_details = (f = 0) => {
  if (f == videos2.length) {
    return console.log('videos3: ' + videos3.length);
  }
  if (f % 50 == 0) {
    console.log(f);
  }
  var response = videos2[f];
  var my_link = jQuery(response).find('.nonScreenshotDescription'
    )[0].innerText.split('\n')[2].slice(0, -1);
  if (my_link.indexOf('steam') > -1 && my_link.indexOf('0') > -1) {
    my_link = my_link.match(/\d+/g)[0];
  }
  var name = jQuery(response).find('div.workshopItemTitle')[0].innerText;
  var appid_link = jQuery(response).find('div.breadcrumbs a')[0].href;
  if (appid_link != 'https://steamcommunity.com/app/0') {
    appid_link = jQuery(response).find('div.screenshotAppName a')[0].href.match(/\d+/g)[0];
  } else {
    appid_link = 'NONSTEAM=' + jQuery(response).find('div.breadcrumbs a')[0].innerText;
  }
  var ytlink = response.substr(response.indexOf('/vi/')+4,15)
  videos3.push({name: name, my_link: my_link, appid_link: appid_link, steam_link: videos1[f], ytlink: ytlink});
  process_video_details(f+1);
})();

videos4 = [];
videos3.forEach((video3) => {
  if (video3.appid_link.indexOf('NONSTEAM') == -1)
    videos4.push(video3.appid_link);
});
var sorted_arr = videos4.slice().sort();
var results = [];
for (var i = 0; i < sorted_arr.length - 1; i++) {
  if (sorted_arr[i + 1] == sorted_arr[i]) {
    results.push(sorted_arr[i]);
  }
}
console.log(results);
//------------------------------------------------------------------------------ GetReviewPageJQuery
(get_review_page = (p = 1) => {
  jQuery.get(get_url() + '/recommended?p=/' + p).done((response1) => {
    (get_review = (r = 0) => {
      jQuery.get(jQuery(response1).find('div.title a')[r].href).done((response2) => {
        var modalContentLink = jQuery('div#ReviewText a.modalContentLink')[0];
        if (typeof modalContentLink !== 'undefined') {
          ylink = 'https://youtu.be/' + jQuery(modalContentLink).find('img')[0].src.replace(/^.*vi\//, '').replace(/\/.*/, ''),
          jQuery('div#ReviewEdit textarea').text(jQuery('div#ReviewEdit textarea').text().replace(
            /http.*:\/\/steamcommunity.com\/sharedfiles\/filedetails\/\?id=[0-9]*/, ylink));
          jQuery('span#SaveReviewBtn').click();
        }
        revid: jQuery('div.responsive_page_template_content script')[0].innerHTML
        score: (jQuery('span.btnv6_blue_hoverfade.btn_small_thin.ico_hover')[0].id == 'OwnerVoteUpBtn') ? true : false,
        video.revid = video.revid.slice(video.revid.indexOf("'")+1, video.revid.indexOf("',"));
        setTimeout(() => {
          jQuery.post('//steamcommunity.com/userreviews/update/' + revid, {
            received_compensation: false,
            voted_up: score,
            sessionid: g_sessionID,
            review_text: rtext
          }).done(function(response) {
            console.log('review ' + review.slots[0][r] + ": " + r + '/' + review.slots[0].length);
          });
        }, 10000);
      });
    })();
  });
})();
//------------------------------------------------------------------------------ GetReviews
(get_reviews = (p = 1) =>
  (p != 0) &&
    http_request(accounts[0], 'my/recommended/?p=' + p, null, (body, response, error,
      _reviews = body.match(/https\:\/\/steamcommunity.com\/id\/byteframe\/recommended\/[0-9]*/g).filter((element, index) => index % 2 == 0)) =>
        setTimeout(() => (get_review = (r = 0) =>
          (r == _reviews.length) ?
            setTimeout(() => get_reviews(p-1), 3000)
          : http_request(accounts[0], _reviews[r], null, (body, response, error, appid = _reviews[r].substr(52)) => (
              (!config.reviews.hasOwnProperty(appid)) && (
                config.reviews[appid] = {
                  currated: false,
                  rating: (body.match("thumbsUp.png") ? true: false),
                  text: Cheerio.load(body)('textarea')[0].children[0].data }),
              get_review(r+1))))(), 1000)))(1)
//------------------------------------------------------------------------------ VideoRater
shuffle_array(Object.keys(state.videos).slice(-50)).some((video) =>
  (config.state[video][2] != 0 && state.videos[video][3] < Math.floor(Math.random()*(99-33)+33)) && (
    file(accounts[a], video, 'voteup', () =>
      config.byteframe.videos[video][3]++),
    true))
//------------------------------------------------------------------------------