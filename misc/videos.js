//------------------------------------------------------------------------------ FindDuplicateKeysInState
Object.keys(state.videos).length
Object.keys(state.videos).forEach((video1) =>
  Object.keys(state.videos).forEach((video2) =>
    (state.videos[video1].link_url == state.videos[video2].link_url && video1 != video2) &&
      console.log(state.videos[video1].title + "|" + video1 + "|" + video2)))
//------------------------------------------------------------------------------ GeneratePlaylistBatchDownloader
googleAPIsYoutube = google.youtube({ version: 'v3', google })
googleAPIsYoutube.playlists.list({auth: google_auth, channelId: 'UCDDJ2AawF4Z67glwPW6pNDg', part: 'snippet', maxResults: 50}, (err, response) =>
  (err) ?
    console.error(err)
  : (global.response = response, console.dir(response)))
playlists = response.data.items,
batch = '',
response.data.items.forEach((item) =>
  batch += '"C:\\\\Program Files\\mpv-x86_64-20170913\\youtube-dl.exe" -J --flat-playlist https://www.youtube.com/playlist?list=' + item.id + ' > ' + item.snippet.title.replace(/ /g, '_') + ".json\n")
fs.writeFileSync('playlists/get_playlists.bat', batch);
fs.mkdirSync('playlists');
//------------------------------------------------------------------------------ FindPlaylistedButMussingInState
fs.readdirSync('playlists').forEach((playlist) => (
  console.log(playlist),
  JSON.parse(fs.readFileSync('playlists/' + playlist)).entries.forEach((entry) => (
    bfound = false,
    Object.keys(state.videos).some((video1) =>
      (state.videos[video1].link_url == 'https://www.youtube.com/watch?v=' + entry.url) &&(
        bfound = true)),
    (!bfound) &&
      console.log(entry)))))
//------------------------------------------------------------------------------ FindDuplicatesInPlaylists
playlisted = [];
fs.readdirSync('playlists').forEach((playlist, i) => (
  JSON.parse(fs.readFileSync('playlists/' + playlist)).entries.forEach((entry) => (
    playlisted.push(entry.url)))))
array_duplicates(playlisted);
console.log(playlisted.length);
//------------------------------------------------------------------------------ GenerateLinksForUnplaylisted
uploaded = [];
Object.keys(state.videos).forEach((video) =>
  uploaded.push(state.videos[video].link_url.substr(32))),
console.log(uploaded.length),
html = '';
uploaded.forEach((video) =>
  (playlisted.indexOf(video) == -1) &&
    (html += ('<a href="https://www.youtube.com/watch?v=' + video + '">' + video +"</a>\n" )))
fs.writeFileSync('missing.html', html)
//------------------------------------------------------------------------------ YoutubeBannerResearch
function getChannel(auth) {
  var service = google.youtube('v3');
  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'byteframe1'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var channels = response.data.items;
    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  });
}
function setChannel() {
  googleAPIsYoutube.channels.update({
    auth: gmail,
    part: 'brandingSettings',
    forUsername: 'byteframe1'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    global.response = response;
  });
}
youtube_profile = () =>
  im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-1.jpg', (err, stdout) =>
    im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-2.jpg', (err, stdout) =>
      im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-3.jpg', (err, stdout) =>
        im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-4.jpg', (err, stdout) =>
          im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-5.jpg', (err, stdout) =>
            im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-6.jpg', (err, stdout) =>
              im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-7.jpg', (err, stdout) =>
                im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-8.jpg', (err, stdout) =>
                  im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-9.jpg', (err, stdout) =>
                    im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-10.jpg', (err, stdout) =>
                      im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-11.jpg', (err, stdout) =>
                        im_combine(['+append', '-adaptive-resize', 'x100' ], select_screenshots(21), './im_out-12.jpg', (err, stdout) =>
                          im_combine([ '-append' ], [ './im_out-1.jpg', './im_out-2.jpg' ], 'im_out-a.jpg', (err, stdout) =>
                            im_combine([ '-append' ], [ './im_out-a.jpg', './im_out-3.jpg' ], 'im_out-b.jpg', (err, stdout) =>
                              im_combine([ '-append' ], [ './im_out-b.jpg', './im_out-4.jpg' ], 'im_out-c.jpg', (err, stdout) =>
                                im_combine([ '-append' ], [ './im_out-c.jpg', './im_out-5.jpg' ], 'im_out-d.jpg', (err, stdout) =>
                                  im_combine([ '-append' ], [ './im_out-d.jpg', './im_out-6.jpg' ], 'im_out-e.jpg', (err, stdout) =>
                                    im_combine([ '-append' ], [ './im_out-e.jpg', './im_out-7.jpg' ], 'im_out-f.jpg', (err, stdout) =>
                                      im_combine([ '-append' ], [ './im_out-f.jpg', './im_out-8.jpg' ], 'im_out-g.jpg', (err, stdout) =>
                                        im_combine([ '-append' ], [ './im_out-g.jpg', './im_out-9.jpg' ], 'im_out-h.jpg', (err, stdout) =>
                                          im_combine([ '-append' ], [ './im_out-h.jpg', './im_out-10.jpg' ], 'im_out-i.jpg', (err, stdout) =>
                                            im_combine([ '-append' ], [ './im_out-i.jpg', './im_out-11.jpg' ], 'im_out-j.jpg', (err, stdout) =>
                                              im_combine([ '-append' ], [ './im_out-j.jpg', './im_out-12.jpg' ], 'im_out-youtube.jpg', (err, stdout) => console.log('done'))))))))))))))))))))))))