//------------------------------------------------------------------------------ AssortedPreprocessing
// translate scids data array to object map
var screenshots = [];
function map_array() {
  scids.forEach(function(scid, index) {
    var screenshot = {
      scid: scid[0],
      file: scid[1],
      tag: scid[2],
      count: scid[3],
      name1: scid[4],
      name2: scid[5],
        url: scid[6],
        dir: 'dir',
      scid2: 'scid2'
    };
    if (typeof scid[0] == "undefined") {
      console.log('missing field 0: ' + scid[2]);
    }
    if (typeof scid[1] == "undefined") {
      console.log('missing field 1: ' + scid[2]);
    }
    if (typeof scid[2] == "undefined") {
      console.log('missing field 2: ' + scid[2]);
    }
    if (typeof scid[3] == "undefined") {
      console.log('missing field 3: ' + scid[2]);
    }
    if (typeof scid[4] == "undefined") {
      console.log('missing field 4: ' + scid[2]);
    }
    if (typeof scid[5] == "undefined") {
      console.log('missing field 5: ' + scid[2]);
    }
    if (scid[4] == scid[5]) {
      console.log('!!! DUPLICATE NAME !!! ' + screenshot.name1 + " #" + index);
    }
    if (scid[5] === '') {
      scid[5] = scid[4];
    }
    screenshot.name2 = scid[5];
    if (/^{[ov\d\/]*}/.test(scid[1])) {
      screenshot.name2 = scid[5] + ' ' + scid[1].replace(/\/.*/, '}')
    }
    if (typeof(screenshot.url) == "undefined" && /^{\d/.test(scid[1])) {
      screenshot.url = 'http://store.steampowered.com/app/' + scid[1].slice(1, -1);
    } else if (typeof(screenshot.url) == "undefined") {
      screenshot.url = '(Unknown)';
    }
    var dir = directories.find(function(directory) {
      return directory[1] === screenshot.name2;
    });
    if (typeof dir == 'undefined') {
      console.log(screenshot);
    }
    screenshot.dir = dir[0];
    screenshot.scid2 = temp_scids.find(function(temp_scid) {
      return temp_scid.innerText.toUpperCase() == screenshot.name2.toUpperCase();
    }).attributes['onclick'].textContent.slice(54, -5);
    if (/^[a-z]/.test(screenshot.name2)) {
      console.log('!!! LOWERCASE NAME !!! ' + screenshot.name1 + " #" + index);
    }
    if (screenshot.name2.indexOf(" - ") > -1) {
      console.log('!!! CONTAINS DASH !!! ' + screenshot.name1 + " #" + index);
    }
    screenshots.push({
      name: screenshot.name2,
       dir: screenshot.dir,
        id: screenshot.scid2,
      file: screenshot.file,
       url: screenshot.url
    });
  });
}
// print screenshot details
var current = 0;
function detail_screenshot(c = 0) {
  if (c != 0) {
    current = c;
  }
  console.log(screenshots[current].scid);
  console.log(screenshots[current].file);
  console.log(screenshots[current].tag);
  console.log(screenshots[current].count);
  console.log(screenshots[current].name1);
  console.log("\"" + screenshots[current].name2 + "\"");
  console.log(screenshots[current].url);
  console.log(current + '/' + screenshots.length);
  current++;
}
function list_names(i = 0) {
  for (; i < screenshots.length; i++) {
    if (screenshots[i].name1 != screenshots[i].name2.replace(/ {.*}/, '')) {
      console.log(screenshots[i].name2.replace(/ {.*}/, '') +
        ' || "' + screenshots[i].name1 + '"');
    } else {
      console.log(screenshots[i].name2.replace(/ {.*}/, ''));
    }
  }
}
// create shortcuts.vdf with only name
function build_shortcuts_vdf() {
  var shortcut_count = 0;
  var Builder = require("node-steam-shortcuts").Builder, fs = require("fs"),
    shortcuts = [];
  screenshots.forEach(function(screenshot, i) {
    if (shortcuts.findIndex(function(shortcut) {
      return shortcut.appname == screenshot.name2;
      }) > -1) {
      console.log('duplicate name: ' + screenshot.name2);
    } else {
      shortcut_count++;
      shortcuts.push({
        appname: screenshot.name2,
        exe: "C:\\Games\\" + screenshot.name2 + ".exe",
        StartDir: "C:\\Games",
      });
    }
  });
  var vdf = Builder.build(shortcuts);
  fs.writeFile("shortcuts.vdf", vdf, function(err){
    if (err) {
      return console.error("oops:",err);
    }
  });
  console.log('shortcut_count: ' + shortcut_count);
}
// build directory structure from scid names to directory names
function build_directory_structure() {
  var old = 'remote/';
  var fs = require('fs-extra');
  if (!fs.existsSync('new')) {
    fs.mkdirSync('new');
  }
  screenshots.forEach(function(screenshot) {
    var directory = directories.find(function(directory) {
      return directory[1] === screenshot.name2;
    });
    if (!fs.existsSync('new/' + directory[0])) {
      console.log('mkdir: new/' + directory[0] + ' | "' + directory[1] + '"');
      fs.mkdirSync('new/' + directory[0]);
      fs.mkdirSync('new/' + directory[0] + "/screenshots");
    }
    var files = fs.readdirSync(old + '/' + screenshot.scid + "-" + screenshot.count);
    files.forEach(function(file) {
      file = file.replace(/--.*\./, '.');
      console.log(screenshot.scid + "-" + screenshot.count + "/" + file);
      fs.copySync(old + '/' + screenshot.scid + "-" + screenshot.count + "/" + file,
        'new/' + directory[0] + '/screenshots/' + file.replace(/--.*\.jpg$/, '.jpg'));
      fs.copySync(old + '/' + screenshot.scid + "-" + screenshot.count + "/" + file,
        'new/' + directory[0] + '/screenshots/' + file.replace(/--.*\.jpg$/, '.jpg') +
        file.replace('.jpg', "_vr.jpg"));
    });
  });
}
// compare directory arrays (this also implies actual directories are ok)
function compare_directory_arrays() {
  var bash_code = `
    {
      echo "var new_directories = ["
      sed -e "s/^\t\t\"/  [ \"/" -e "s/\"\t\t\"/\", \"/" -e 's/$/, ],/' shortcutnames
      echo "];"
    } > new_directories.js
  `;
  directories.forEach(function(directory) {
    var found = new_directories.find(function(new_directory) {
      return new_directory[0] == directory[0] && new_directory[1] == directory[1];
    });
    if (typeof found == 'undefined') {
      console.log(directory);
    }
  });
}
// find spelling differences between new_scids to directories
var new_scids = [];
var temp_scids;
function check_new_scids() {
  jQuery.ajax({
    url: 'http://steamcommunity.com/id/byteframe/screenshots'
  }).done(function(response) {
    new_scids = jQuery(response).find('div[id^=sharedfiles_filterselect_app_option_]');
    new_scids.each(function(index, item) {
      if (index > 0) {
        var directory = directories.find(function(directory) {
          return directory[1] == item.textContent;
        });
        if (typeof directory == "undefined") {
          console.log(item.textContent);
        }
      }
    })
    temp_scids = jQuery.makeArray(new_scids);
  });
}
function print_json() {
  var sorted_shit = screenshots.sort(function(a, b) {
    return parseInt(a.id.substr(3)) - parseInt(b.id.substr(3));
  });
  var last_screenshot = '';
  var count = 0;
  sorted_shit.forEach(function(screeenshot) {
    count++;
    
    if (screeenshot.name != last_screenshot) {
      console.log(V_ToJSON(screeenshot));
    count++;
    }
    last_screenshot = screeenshot.name;
  });
  console.log(count);
}
// open 25 tabs to view screenshots
function start_opening_tabs() {
  var sc_index = GM_getValue('sc_index', 0);
  unsafeWindow.count = 0;
  unsafeWindow.proceed = function() {
    GM_setValue('sc_index', sc_index);
    for (i = sc_index; i < sc_index+25; i++) {
      GM_openInTab('http://steamcommunity.com/id/byteframe/screenshots/?appid=' +
        appids[i]);
      count++;
    }
    sc_index = i;
  };
}
//------------------------------------------------------------------------------ BashExtractGames
SRC=/home/byteframe/150_GB_SATA_25
DST=/run/media/byteframe/Games
unset UNKNOWN
find ${SRC}/ -maxdepth 2 -type f -iname "*.rar" -or -iname "*.zip" -or -iname "*.7z" \
  | grep -v __UNPLAYED > ${SRC}/filelist.tmp
while read FILE; do
  FILE="${FILE/${SRC}\//}"
  DIR="${FILE%\/*}"
  FILE="${FILE##*\/}"
  mkdir -p "${DST}/${DIR}"
  if [ ! -e "${DST}"/"${DIR}"/"${FILE}" ] ; then
    cp -v "${SRC}/${DIR}/${FILE}" "${DST}/${DIR}/${FILE}"
  fi
  mkdir -p "${DST}/${DIR}/${FILE%.*}"
  if [ ${FILE##*.} = "rar" ]; then
    COMMAND="unrar x"
  elif [ ${FILE##*.} = "zip" ]; then
    COMMAND="unzip"
  elif [ ${FILE##*.} = "7z" ]; then
    COMMAND="7z x"
  else
    UNKNOWN="${UNKNOWN}___${FILE}"
    echo "UNKNOWN FILE TYPE: ${FILE}"
    continue
  fi
  cd "${DST}/${DIR}/${FILE%.*}"
  echo "extracting: ${FILE}"
  ${COMMAND} "${DST}/${DIR}/${FILE}"
done < ${SRC}/filelist.tmp
//------------------------------------------------------------------------------ OldBashChecks
FILE=/mnt/Datavault/Work/pdl-idler/FRIENDS/AAA_SCREENSHOTS.html
// dir/file counts (10000-690/total = 2695-161 normal + 7305+529 scid)
ls -1 | wc -l ; ls -1 | grep sc | wc -l ; ls -1 | grep -v sc | wc -l
find . -name *.jpg | wc -l
// get/check counts from dir names (10000)
let TOTAL=0
for DIR in $(ls -1); do
  COUNT=${DIR#*-}
  let TOTAL+=COUNT
done
echo $TOTAL
// get list count without steamvr individual (10000)
let TOTAL=0
for INT in $(cat ${FILE} | grep -v 250820 | grep -o ", [0-9]*" | grep -o \[0-9]*); do
  let TOTAL+=${INT}
done
echo $TOTAL
// spot duplicate appids
for ID in $(grep -o "\"{[0-9][0-9/]*}" ${FILE}); do
   ID=${ID:1};
   if [ $(grep "\"${ID}\"" ${FILE} | wc -l) != 1 ] \
   && [ $(grep "\"${ID}\"" ${FILE} | wc -l) != 0 ]; then
     echo $ID
   fi;
done | sort
//------------------------------------------------------------------------------ BashDuplicates
cd C:\Program\ Files\ \(x86\)/Steam/userdata/752001/760/remote
mkdir -p deleted
for DIR in *; do
  if [ ${DIR} != 'deleted' ]; then
    if [ ! -z "$(ls -A ${DIR}/screenshots/*_vr.jpg 2> /dev/null)" ]; then
      for FILE in "${DIR}/screenshots/*_vr.jpg"; do
        if [ ! -e "${FILE/_vr.jpg/.jpg}" ]; then
          mkdir -p deleted/${DIR}
          mv -v "${FILE}" deleted/${DIR}
        fi
      done
    fi
  fi
done
//------------------------------------------------------------------------------ NodeScript
fs = require('fs'),
colors = require('colors'),
request = require('request'),
Cheerio = require('cheerio'),
vdf = require('simple-vdf'),
process.on('SIGINT', process.exit, 0);
process.on('uncaughtException', (err) => console.log(err.stack)),
readline = require('readline').createInterface({ input: process.stdin, output: process.stdout }).on('line', (input) => eval(input)),
screenshots_vdf = vdf.parse(fs.readFileSync('C:\\Program Files (x86)\\Steam\\userdata\\752001\\760\\screenshots.vdf', 'utf8')).screenshots,
remotecache_vdf = vdf.parse(fs.readFileSync('C:\\Program Files (x86)\\Steam\\userdata\\752001\\760\\remotecache.vdf', 'utf8'))['760'],
vdf_counts = {},
total_vdf_count = 0,
// find screenshot files in cloud but not in vdf
screenshot_files = [],
Object.keys(screenshots_vdf).forEach((appid) =>
  Object.keys(screenshots_vdf[appid]).forEach((key) =>
    screenshot_files.push(screenshots_vdf[appid][key].filename))),
Object.keys(remotecache_vdf).forEach((key) =>
  (key.indexOf("_vr.jpg") == -1 && key.indexOf("/thumbnails/") == -1 && screenshot_files.indexOf(key) == -1) &&
    console.log(key)),
// create culled remotecache vdf files
(cull_remotecache = () => (
  new_remotecache = { "760": {} },
  culled_remotecache = { "760": {} },
  Object.keys(remotecache_vdf).forEach((key) => (
    new_remotecache['760'][key] = remotecache_vdf[key],
    (key.match(/\d\d\d\d\d\d\d\d\d\d\d\d*\//)
    && key.indexOf('16098203768142692352') == -1
    && key.indexOf('17794472699079163904') == -1) && (
      new_remotecache['760'][key].syncstate = 3,
      culled_remotecache['760'][key] = remotecache_vdf[key])),
  fs.writeFileSync('new_remotecache.vdf', vdf.stringify(new_remotecache)))))(),
// count vdf files and check for cloud status
moving = false,
path = "C:\\Program Files (x86)\\Steam\\userdata\\752001\\760\\remote\\",
Object.keys(screenshots_vdf).forEach((appid) =>
  (appid != 'shortcutnames') && (
    vdf_counts[appid] = [0,0,0],
    Object.keys(screenshots_vdf[appid]).forEach((file) => (
      vdf_counts[appid][1]++,
      (screenshots_vdf[appid][file].Permissions == 8) ? (
        vdf_counts[appid][0]++,
        total_vdf_count++,
        (!moving && !(screenshots_vdf[appid][file].filename in remotecache_vdf)) &&
          console.error("no upload reference in remotecache: " + screenshots_vdf[appid][file].filename))
      : (screenshots_vdf[appid][file].Permissions == 2) ?
        (screenshots_vdf[appid][file].filename in remotecache_vdf) &&
          console.error("unknown upload reference in remotecache: " + screenshots_vdf[appid][file].filename)
      : console.error("invalid permissions: " + screenshots_vdf[appid][file].filename),
      // move files and/or check filesystem existance
      (moving) ?
        (screenshots_vdf[appid][file].Permissions == 8 && fs.existsSync(path + screenshots_vdf[appid][file].filename)) &&
          fs.renameSync(path + screenshots_vdf[appid][file].filename, path + screenshots_vdf[appid][file].filename + ".pdl")
      :((fs.existsSync(path + screenshots_vdf[appid][file].filename + ".pdl")) &&
          fs.renameSync(path + screenshots_vdf[appid][file].filename + ".pdl", path + screenshots_vdf[appid][file].filename),
        (!fs.existsSync("C:\\Program Files (x86)\\Steam\\userdata\\752001\\760\\remote\\" + screenshots_vdf[appid][file].filename)) &&
          console.log('2D not on filesystem: ' + screenshots_vdf[appid][file].filename),
        (screenshots_vdf[appid][file].vrfilename && !fs.existsSync("C:\\Program Files (x86)\\Steam\\userdata\\752001\\760\\remote\\" + screenshots_vdf[appid][file].vrfilename)) &&
          console.log('VR not on filesystem: ' + screenshots_vdf[appid][file].vrfilename)))))),
// get web appids and cross check
webcache = {},
(fs.existsSync('config-screenshots.json')) && (
  webcache = JSON.parse(fs.readFileSync('config-screenshots.json', 'utf8'))),
process.once('exit', (code) => fs.writeFileSync('config-screenshots.json', JSON.stringify(webcache, null, 2))),
web_appids = {},
request('https://steamcommunity.com/id/byteframe/screenshots?view=grid', (error, response, body) => (
  web_appids.size = body.match(/Showing \d+ - \d+ of \d+/)[0].match(/\d+/g)[2],
  screenshot_web = Cheerio.load(body)('div.ellipsis'),
  screenshot_web.each((i, item) =>
    (i >= 3 && i < screenshot_web.length-2) ?
      web_appids[screenshot_web[i].attribs['onclick'].match(/\d+/)[0]] = 0 : null),
  delete web_appids['592408'],
  delete web_appids['409142'],
  Object.keys(web_appids).forEach((appid) =>
    (!appid in vdf_counts) &&
      console.error("no web appid in vdf: " + appid)),
  Object.keys(vdf_counts).forEach((appid) =>
    (vdf_counts[appid][0] > 0 && web_appids[appid] != 0 && appid != '17794472699079163904' && appid != '16098203768142692352') &&
      console.error("no vdf appid in web: " + appid)),
  // count web totals
  total_shas = [],
  verbose = false,
  (check_web_counts = (i = 0, shas = [], appid = Object.keys(web_appids)[i]) => (
    handle_appid = (data) => (
      vdf_counts[appid][2] = data.length,
      total_shas = total_shas.concat(data),
      ((result = "["+ appid + "]: " + vdf_counts[appid][0] + "/" + vdf_counts[appid][1] + "|" + vdf_counts[appid][2]) => (
        check_web_counts(i+1),
        (vdf_counts[appid][0] == vdf_counts[appid][1] && vdf_counts[appid][1] == vdf_counts[appid][2]) ? (
          webcache[appid] = data,
          (verbose) &&
            console.error((result + " >> COMPLETE").green))
        : (vdf_counts[appid][0] != vdf_counts[appid][2]) ? (
          console.error((result + " >> UPLOADED MISCOUNT").red),
          delete webcache[appid])
        : (vdf_counts[appid][1] != vdf_counts[appid][2]) ?
          (verbose) &&
            console.error((result + " >> INCOMPLETE").yellow)
        : console.error((result + " >> UNKNOWN").CYAN)))()),
    // record image checksums
    (i < Object.keys(web_appids).length-1) ?
      (webcache.hasOwnProperty(appid)) ?
        handle_appid(webcache[appid])
      : (request_screenshot_list = (p = 1) =>
        request('https://steamcommunity.com/id/byteframe/screenshots/?p=' + p + '&appid=' + appid + '&view=grid', (error, response, body, files = Cheerio.load(body)('.imgWallItem  ')) =>
          (files.length) ? (
            files.each((i, element, sha = element.attribs.style.replace(/.*\/ugc\/\d+\//, '').substr(0, 40)) =>
              shas.push(sha)),
            request_screenshot_list(p+1))
          : handle_appid(shas)))()
    // print final results
    :(console.log("total_shas_count+2+87: " + (""+(total_shas.length+2+87)).magenta),
      console.log("vdf_counts.length: " + (""+Object.keys(vdf_counts).length).blue + ", web_appids.length: " + (""+Object.keys(web_appids).length).magenta),
      console.log("total_vdf_count: " + (""+(total_vdf_count-2)).blue + ", web_appids.size: " + (""+(web_appids.size-1)).magenta))))()));
//------------------------------------------------------------------------------