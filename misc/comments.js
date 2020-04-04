//------------------------------------------------------------------------------ GetComments
comments = {},
get_comments = (account, p = 1) =>
  http_request(account, 'my/allcomments?ctp=' + p, null, (_body, response, err, body = Cheerio.load(_body)) => (
    body('.commentthread_comment').each((i, element, cid = element.attribs['id'].substr(8)) =>
      comments[cid] = {
        steamid: translate_id(body('#comment_' + cid + " a")[0].attribs['data-miniprofile']),
        timestamp: body('#comment_' + cid + " span")[0].attribs['data-timestamp'],
        contents: body("#comment_content_" + cid).contents().toString().trim() }),
    console.log('processed_page: ' + p),
    (p == 1 || !_body.match('pagebtn disabled')) ?
      setTimeout(get_comments, 250, account, p+1)
    : (fs.writeFileSync('comments1.json', JSON.stringify(comments, null, 2)) &&
      console.log('done'))));
get_comments(accounts[0]);
//------------------------------------------------------------------------------ ProcessComments
new_comments = {},
process_comments1 = (comments = JSON.parse(fs.readFileSync('comments1.json', 'utf8')),
  max = Object.keys(comments).length) => {
  for (var c = 0; c < max; c++) {
    if (c % 100 == 0) console.log(c);
    var steamid = comments[Object.keys(comments)[c]].steamid;
    if (!new_comments.hasOwnProperty(steamid)) {
      new_comments[steamid] = [];
    }
    new_comments[steamid].push({
      id: Object.keys(comments)[c],
      steamid: steamid,
      timestamp: comments[Object.keys(comments)[c]].timestamp,
      contents: comments[Object.keys(comments)[c]].contents
    });
  }
  fs.writeFileSync('comments2.json', JSON.stringify(new_comments, null, 2));
  console.log('done');
};
process_comments2 = (comments = JSON.parse(fs.readFileSync('comments2.json', 'utf8')),
  new_comments = [],
  max = Object.keys(comments).length) => {
  for (var c = 0; c < max; c++) {
    var texts = [];
    var steamid = Object.keys(comments)[c];
    comments[steamid].forEach((comment) => {
      if (texts.indexOf(comment.contents) == -1) {
        texts.push(comment.contents);
      } else {
        new_comments.push(comment.id);
      }
    });
  }
  fs.writeFileSync('comments3.json', JSON.stringify(new_comments, null, 2));
  console.log('done');
};
//------------------------------------------------------------------------------ RenaCommentScript
var match = "*://steamcommunity.com/profiles/* + *://steamcommunity.com/id/*"
var comment = `
:icon: - :icon: - :icon: - :icon: - :icon: - :icon:
~ Have a very nice day $NAME! ~
:icon: - :icon: - :icon: - :icon: - :icon: - :icon:
`;
jQuery(document).keyup(function(event) {
  if (event.which == 27) {
    jQuery('textarea.commentthread_textarea').each(function(index, item) {
      if (jQuery(item).val() === '$$$') {
        jQuery(item).val(comment.trim().replace(
          '$NAME', jQuery('.actual_persona_name')[0].innerText));
        jQuery(item).click();
        return false;
      }
    });
  }
});
//------------------------------------------------------------------------------
