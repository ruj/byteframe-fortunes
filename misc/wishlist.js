//------------------------------------------------------------------------------ WishlistRedeemer1
var applist = [];
run_wishlist_redeemer = (account, limit = 1) => {
  account.http_request('https://store.steampowered.com/dynamicstore/userdata/', {}, (body, response, err) => {
    if (!body.rgWishlist.length) {
      return account.log('FAILURE | dynamicstore/userdata: ' + 'GET=empty data'.yellow);
    }
    account.userdata = body;
    add_to_wishlist = (i, callback = () => { ; }) => {
      if (i == 0) {
        return callback();
      } else if (applist.length == 0) {
        return account.http_request('https://api.steampowered.com/ISteamApps/GetAppList/v2', {}, (body, response, err) => {
          applist = body.applist.apps;
          add_to_wishlist(i, callback);
        });
      }
      var app = applist.splice(Math.floor(Math.random()*applist.length), 1)[0];
      if (account.userdata.rgWishlist.indexOf(app.appid) > -1
      || account.userdata.rgOwnedApps.indexOf(app.appid) > -1) {
        return add_to_wishlist(i, callback);
      }
      account.http_request('https://store.steampowered.com/app/' + app.appid, {}, (body, response, err) => {
        if (!Cheerio.load(body)('img.game_header_image_full').length) {
          return add_to_wishlist(i, callback);
        }
        account.http_request('https://store.steampowered.com/api/addtowishlist', { appid: app.appid }, (body, response, err) => {
          account.userdata.rgWishlist.push(app.appid);
          add_to_wishlist(i-1, callback);
        });
      });
    };
    var diff = account.userdata.rgWishlist.length-(34666-1);
    if (diff < 1) {
      return add_to_wishlist(Math.min(limit, Math.abs(diff)+1));
    }
    add_to_wishlist(1, () => {
      (remove_from_wishlist = (i) => {
        if (i != 0) {
          var app_index = Math.floor(Math.random()*account.userdata.rgWishlist.length);
          account.http_request('https://store.steampowered.com/api/removefromwishlist', { appid: account.userdata.rgWishlist[app_index] }, (body, response, err) => {
            account.userdata.rgWishlist.splice(app_index, 1);
            remove_from_wishlist(i-1);
          });
        }
      })(diff);
    });
  });
};
//------------------------------------------------------------------------------ WishlistRedeemer2
var applist = [];
run_wishlist_redeemer = (account, limit = 1, enforce = true, ogg = false) => {
  add_to_wishlist = (i, callback = () => { ; }) => {
    if (i == 0) {
      return callback();
    } else if (applist.length == 0) {
      return account.http_request('https://api.steampowered.com/ISteamApps/GetAppList/v2', null, (body, response, err) => {
        applist = body.applist.apps;
        add_to_wishlist(i, callback);
      });
    }
    var app = applist.splice(Math.floor(Math.random()*applist.length), 1)[0];
    if (!enforce) {
      account.http_request('https://store.steampowered.com/api/addtowishlist', { appid: app.appid });
      return add_to_wishlist(i-1, callback);
    }
    account.http_request('https://store.steampowered.com/app/' + app.appid, null, (body, response, err) => {
      if (account.userdata.rgWishlist.indexOf(app.appid) > -1
      || account.userdata.rgOwnedApps.indexOf(app.appid) > -1
      || body.indexOf('game_header_image_full') == -1) {
        return add_to_wishlist(i, callback);
      }
      account.http_request('https://store.steampowered.com/api/addtowishlist', { appid: app.appid }, (body, response, err) => {
        account.send_group_chat('37338', '12097209', 'https://store.steampowered.com/app/' + app.appid);
        account.userdata.rgWishlist.push(app.appid);
        add_to_wishlist(i-1, callback);
      });
      if (!ogg) {
        ogg = true;
        account.http_request('https://steamcommunity.com/app/' + app.appid + '/joinOGG?sessionID=' + account.community.getSessionID())
      }
    });
  };
  add_to_wishlist((enforce ? 0 : limit), () => {
    if (enforce) {
      account.http_request('https://store.steampowered.com/dynamicstore/userdata/', null, (body, response, err) => {
        if (!body.rgWishlist.length) {
          return account.log('FAILURE | dynamicstore/userdata: ' + 'GET=empty data'.yellow);
        }
        account.userdata = body;
        var diff = account.userdata.rgWishlist.length-34665;
        add_to_wishlist((diff < 0 ? Math.abs(diff)+1 : 1), () => {
          (remove_from_wishlist = (i) => {
            if (i > 0) {
              var app_index = Math.floor(Math.random()*account.userdata.rgWishlist.length);
              account.http_request('https://store.steampowered.com/api/removefromwishlist', { appid: account.userdata.rgWishlist[app_index] }, (body, response, err) => {
                account.userdata.rgWishlist.splice(app_index, 1);
                remove_from_wishlist(i-1);
              });
            }
          })(diff);
        });
      });
    }
  });
};