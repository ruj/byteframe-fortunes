VoteUp2 = (account, _item_id, item_id = _item_id.slice(0, -2)) => (
  (shared_files.indexOf(item_id) == -1) &&
    shared_files.push(item_id),
  send_group_chat(account, '37338', '12023431', "# " + account.index + ' https://steamcommunity.com/sharedfiles/filedetails/?id=' + item_id),
  file(account, item_id, 'voteup', () =>
    vote(account, true))),
VoteUpCommentThread = (account, _thread, thread = _thread.slice(1, -3).split('_')) =>
  (account.user.myFriends[thread[1]] == 3 && thread[1] != accounts[0].steamID) ?
    account.http_request('comment/' + thread[0] + '/voteup/' + thread[1] + '/' + thread[2] + "/",
      { vote: 1, count: thread[0] == 'UserReceivedNewGame' ? 3 : 6, newestfirstpagination: true }, (body, response, error) => (
        account.log('SUCCESS | voteup: ' + ('https://steamcommunity.com/profiles/' + (thread[0] == 'UserReceivedNewGame' ? 'friendactivitydetail/3/' : 'status/') + thread[2]).yellow),
        vote(account, true), 'POST', true, 0 , true))
  : vote(account),
vote = (account, delayed = false, item = null) =>
  (account.votes.length) && (
    (item == null) && (
      item = account.votes.shift()),
    (account.voted.indexOf(item) > -1) ?
      vote(account, delayed)
    : (delayed) ?
      setTimeout(vote, Math.random()*(14000-7000)+7000, account, false, item)
    :(account.voted.push(item),
      item = item.split('('),
      eval(item[0])(account, item[1]))),
  vote = (delayed = false) =>
    (account.votes.length) &&
      (delayed) ?
        setTimeout(eval, Math.random()*(10000-5000)+5000, account.votes.shift())
      : eval(account.votes.shift()),
run_activity_rater = (account, html = "", favorite = true, callback = null) => (
  (!account.votes) ? (
    account.votes = [],
    account.voted = [],
    account.cycle = 0)
  : (account.cycle == cycles && shared_files.length && favorite) &&
    file(account, shared_files[Math.floor(Math.random()*shared_files.length)]),
  (++account.cycle == cycles+1) && (
    account.cycle = 0,
    account.blotter_url = ''),
  account.http_request('my/ajaxgetusernews/' + account.blotter_url, null, (body, response, err,
    init = (account.votes.length) ? false : true) =>
    (!body) ?
      account.log("FAILURE | my/ajaxgetusernews/" + account.blotter_url + ": GET-200=NO FEED BODY".yellow)
    : (account.blotter_url = body.next_request.substr(body.next_request.indexOf('?')),
      (callback) &&
        callback(body.blotter_html + html),
      body = Cheerio.load(body.blotter_html + html),
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
        vote(account))));
  (!account.votes) ? (
    account.votes = [],
    account.voted = [],
    account.cycle = 0)
  : (account.cycle == cycles && shared_files.length && favorite) &&
    account.file(shared_files[Math.floor(Math.random()*shared_files.length)]),
  (++account.cycle == cycles+1) && (
    account.cycle = 0,
    account.blotter_url = ''),
  account.http_request('my/ajaxgetusernews/' + account.blotter_url, null, (body, response, err,
    init = (account.votes.length) ? false : true) =>
    (!body) ?
      account.log("FAILURE | my/ajaxgetusernews/" + account.blotter_url + ": GET-200=NO FEED BODY".yellow)
    : (account.blotter_url = body.next_request.substr(body.next_request.indexOf('?')),
      (callback) &&
        callback(body.blotter_html + html),
      body = Cheerio.load(body.blotter_html + html),
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
        vote(account))));
run_activity_rater = (account, html = "") => (
  (!account.votes) && (
    account.votes = [],
    account.cycle = 0),
  (account.cycle == cycles && shared_files.length) &&
    account.file(shared_files[Math.floor(Math.random()*shared_files.length)]),
  get_user_news(account, (blotter_html,
    body = Cheerio.load(blotter_html + html),
    init = (account.votes.length) ? false : true) => (
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
      vote()))),
get_user_news = (account, callback) => (
  (++account.cycle == cycles+1) && (
    account.cycle = 0,
    account.blotter_url = ''),
  account.http_request('my/ajaxgetusernews/' + account.blotter_url, null, (body, response, err) =>
    (!body) ?
      account.log("FAILURE | my/ajaxgetusernews/" + account.blotter_url + ": GET-200=NO FEED BODY".yellow)
    : (account.blotter_url = body.next_request.substr(body.next_request.indexOf('?')),
      callback(body.blotter_html))));