//------------------------------------------------------------------------------ LunarMouse
door_index = 1,
  (!accounts[a].door_index || accounts[a].door_index < door_index) &&
    http_request(accounts[a], 'https://store.steampowered.com/sale/lunarnewyear2020', {}, (body) =>
      http_request(accounts[a], 'https://store.steampowered.com/saleaction/ajaxopendoor', { door_index: door_index, authwgtoken: body.match(/authwgtoken&quot;:&quot;[a-z0-9]*&quot;,/)[0].slice(24, -7) }, (body) =>
        accounts[a].door_index = door_index)),
//------------------------------------------------------------------------------ Holiday
run_holiday = (account) => {
  var date = new Date();
  date.setHours(date.getHours()-13);
  var door_total = (date.getMonth() == 11 ? date.getDate()-19 : date.getDate()+12);
  date.setHours(date.getHours()+13);
  for (var i = 0; i < door_total; i++) {
    if (typeof config.byteframe.holiday[account.user.steamID] == 'undefined') {
      config.byteframe.holiday[account.user.steamID] = { doors: [] };
    }
    if (config.byteframe.holiday[account.user.steamID].doors.indexOf(i) == -1) {
      config.byteframe.holiday[account.user.steamID].doors.push(i);
      account.http_request("https://store.steampowered.com/promotion/opencottagedoorajax?door=" + i, {
        door_index: i, open_door: true, t: '2018-' + (date.getMonth()+1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
      });
    }
  }
};
//------------------------------------------------------------------------------ SaleAwardVote2018
var awards = [
  { voteid: 29, appid: 0, developerid: [ '32989758','33075774','33028765','1541443','32978945','1012195','33273264','6859167','33042543','112393' ][Math.floor(Math.random()*10)] },
  { voteid: 26, developerid: 0, appid: [ '578080','582010','379430','863550','812140' ][Math.floor(Math.random()*5)] },
  { voteid: 27, developerid: 0, appid: [ '611670','438100','620980','611660','617830' ][Math.floor(Math.random()*5)] },
  { voteid: 28, developerid: 0, appid: [ '271590','275850','238960','570','413150' ][Math.floor(Math.random()*5)] },
  { voteid: 30, developerid: 0, appid: [ '292030','264710','750920','552520','374320' ][Math.floor(Math.random()*5)] },
  { voteid: 31, developerid: 0, appid: [ '218620','381210','359550','730','728880' ][Math.floor(Math.random()*5)] },
  { voteid: 32, developerid: 0, appid: [ '612880','812140','394360','289070','377160' ][Math.floor(Math.random()*5)] },
  { voteid: 33, developerid: 0, appid: [ '227300','252950','524220','427520','244850' ][Math.floor(Math.random()*5)] } ];
awards.forEach((award) => {
  this.http_request('https://store.steampowered.com/salevote', award);
});
//------------------------------------------------------------------------------
sale_awards_vote = (account, awards = [
  { voteid: 34, developerid: 0, appid: [ '814380','883710','1172380','1085660','601150' ][Math.floor(Math.random()*5)] },
  { voteid: 35, developerid: 0, appid: [ '629730','578620','991260','732690' ][Math.floor(Math.random()*5)] },
  { voteid: 36, developerid: 0, appid: [ '230410','359550','730','271590','570' ][Math.floor(Math.random()*5)] },
  { voteid: 37, developerid: 0, appid: [ '632360','1046930','813780','755790','221100' ][Math.floor(Math.random()*5)] },
  { voteid: 38, developerid: 0, appid: [ '736260','646570','557340','457140','703080' ][Math.floor(Math.random()*5)] },
  { voteid: 39, developerid: 0, appid: [ '752590','632470','939960','1097840','606880' ][Math.floor(Math.random()*5)] },
  { voteid: 40, developerid: 0, appid: [ '629760','678960','594650','617290','976310' ][Math.floor(Math.random()*5)] },
  { voteid: 41, developerid: 0, appid: [ '683320','779340','361420','460950','848450' ][Math.floor(Math.random()*5)] } ]) =>
  (!account.limited) &&
    awards.forEach((award) =>
      http_request(account, 'https://store.steampowered.com/salevote', award));
//------------------------------------------------------------------------------ JoinTeam
accounts.forEach((account, i) =>
    setTimeout((account) =>
      http_request(account, 'https://store.steampowered.com/grandprix/ajaxjointeam/', { teamid: pool([1,2,3,4,5]) }), 2500*i, account));
//------------------------------------------------------------------------------ Discover
discover = (account, cycle = 3) =>
  (!account.limited) &&
    [...Array(cycle).keys()].forEach((item, i) =>
      setTimeout(() =>
        http_request(account, 'https://store.steampowered.com/explore/generatenewdiscoveryqueue', { "queuetype": 0 }, (body, reponse, error) =>
          body.queue.forEach((appid, index) =>
            http_request(account, 'https://store.steampowered.com/app/10', { "appid_to_clear_from_queue": appid }))), i*5000));
//------------------------------------------------------------------------------ NominationsFall2019
gamesPlayed: { shuffle_slots: [ 0 ], shuffle_types: [ 0 ], slots: [ [ (account) =>
  account.user.gamesPlayed([ 440 ]) ] ] } },
(!accounts[a].nominate_2019) && (
  accounts[a].nominate_2019 = true,
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 1180020, categoryid: 1, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 1063530, categoryid: 2, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 440, categoryid: 3, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 909100, categoryid: 4, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 1094030, categoryid: 5, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 1175140, categoryid: 6, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 1114030, categoryid: 7, source: 1, writein: 0 }),
  http_request(accounts[a], 'https://store.steampowered.com/steamawards/nominategame', { nominatedid: 1115980, categoryid: 8, source: 1, writein: 0 }),
  http_request(accounts[a], 'my/recommended', { appid: 440, action: 'delete' }, (body, response, err) =>
    http_request(accounts[a], 'https://store.steampowered.com/friends/recommendgame', { appid: 440, steamworksappid: 440, comment: generate_fortune('all'), rated_up: true, is_public: true, language: 'english', received_compensation: 1, disable_comments: 0 }, (body, response, err) => console.dir(response)), true)),
//----------------------------------------------------------------------------- WintterQuests2019
winter_quests = (account) =>
  (!account.limited) && (
    http_request(account, 'https://store.steampowered.com/recommender/' + account.steamID + '/results?sessionid=' + account.community.getSessionID() + '&steamid=' + account.steamID + '&include_played=0&algorithm=0&reinference=0&model_version=0'),
    http_request(account, 'https://store.steampowered.com/api/addtowishlist', { appid: 823500 }),
    http_request(account, 'https://store.steampowered.com/api/addtowishlist', { appid: 546560 }),
    http_request(account, 'https://store.steampowered.com/api/addtowishlist', { appid: 615120 }),
    http_request(account, 'https://store.steampowered.com/labs/divingbell'),
    http_request(account, 'https://store.steampowered.com/labs/search/'),
    http_request(account, 'https://store.steampowered.com/labs/trendingreviews'),
    http_request(account, 'https://store.steampowered.com/holidayquests/ajaxclaimitem/', { type: 1 }),
    http_request(account, 'https://store.steampowered.com/holidayquests/ajaxclaimitem/', { type: 2 }),
    http_request(account, 'https://store.steampowered.com/labs/trendingreviews'),
    http_request(account, 'https://store.steampowered.com/steamawards/2019/'),
    http_request(account, 'https://steamcommunity.com/broadcast/getbroadcastmpd' , { steamid: '76561197960266962', broadcastid: 0, viewertoken: 0 }, 'GET'),
    http_request(accounts[a], 'https://store.steampowered.com/holidayquests/ajaxclaimitem/', { type: 2 }),
    http_request(accounts[a], 'https://store.steampowered.com/holidaymarket/ajaxredeemtokens/', { itemid: pool([3,4,5,73,74,75]) }),
    http_request(accounts[a], 'https://store.steampowered.com/holidaymarket/ajaxredeemtokens/', { itemid: pool([6,23,77,72,35,34,33,32,31,30,29,28,27,26,25,24,22,7,21,20,19,18,17,16,15,14,13,12,11,10,9,8,78]) }),
    send_chat(account, '76561197976737508', ":steamsad:")),
//----------------------------------------------------------------------------- Discover2019
discover = (account, cycle = 3) => (
  http_request(account, 'https://store.steampowered.com/holidayquests', {}, (body, response, error) =>
    log(account, 'SUCCESS| winter tokens: ' + body.match(/rewards_tokens_amt\"\>\d*/)[0])),
  (!account.limited) &&
    [...Array(cycle).keys()].forEach((item, i) =>
      setTimeout(() =>
        http_request(account, 'https://store.steampowered.com/explore/generatenewdiscoveryqueue', { "queuetype": 0 }, (body, reponse, error) =>
          body.queue.forEach((appid, index) =>
            http_request(account, 'https://store.steampowered.com/app/10', { "appid_to_clear_from_queue": appid }))), i*5000))),