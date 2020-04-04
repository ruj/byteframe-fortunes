//------------------------------------------------------------------------------ ItemsEvent
this.new_items = false;
this.new_items_timer = -1;
this.user.on('newItems', (count) => {
  this.new_items = true;
  if (count > 0) {
    clearTimeout(this.new_items_timer);
    this.new_items_timer = setTimeout((count) => {
      this.log('SESSION | newItems: ' + ("{" + count + "} https://steamcommunity.com/" + this.profile_url() + "/inventory").yellow);
    }, 5000, count);
  }
});
clear_item_notification() {
  if (this.new_items) {
    this.new_items = false;
    this.http_request(this.profile_url() + "/inventory");
  }
}
//------------------------------------------------------------------------------ TradeOfferManager
this.user.on('webSession', (sessionID, cookies) =>
  this.tradeOfferManager.setCookies(cookies));
SteamTradeOfferManager = require('steam-tradeoffer-manager'),
  this.tradeOfferManager = new SteamTradeOfferManager({
    "steam": this.user,
    "community": this.community,
    "dataDirectory": null,
    "domain": "primarydataloop",
    "language": "en"
  });
//------------------------------------------------------------------------------ RunTradeOffer
inventories = [ [ 753,6 ],[ 753,7 ],[ 440,2 ],[ 227300,2 ],[ 264710,186865 ] ],
run_trade_offer = (account, receiver, sending = [], i = 0) =>
  account.tradeOfferManager.getInventoryContents(inventories[i][0], inventories[i][1], true, (err, inventory) => (
    (err) &&
      account.log("FAILURE | getInventoryContents: " + ("id=" + inventories[i] + ",error=" + err).yellow),
    (i < inventories.length-1) ?
      run_trade_offer(account, receiver, sending.concat(inventory), i+1)
    : (!sending.length) ?
      account.log("SESSION | run_trade_offer: " + ("no items").yellow)
    : ((offer = account.tradeOfferManager.createOffer("https://steamcommunity.com/tradeoffer/new/?partner=16471780&token=6MrQi4mC")) => (
      offer.addMyItems(sending.concat(inventory)),
      offer.send((err, status) =>
        (err) ?
          account.log("FAILURE | offer.send: " + ("error=" + err).yellow)
        : (status != 'pending') ?
          account.log("SESSION | offer.send: " + ("complete=" + status).yellow)
        : account.community.acceptConfirmationForObject("identitySecret", offer.id, (err) =>
          (get_gmail_confirmation = (attempt = 0) =>
            get_gmail((err, gmails, link = search_gmail(gmails, "https://steamcommunity.com/tradeoffer/" + offer.id + "/confirm?accountid", '"').replace(/&amp;/g, '&')) =>
              (link == 'false') ?
                (attempt == 8) ?
                  account.log("FAILURE | get_gmail: " + ("noLink=" + offer.id).yellow)
                : setTimeout(() => get_gmail_confirmation(attempt+1), 1000)
              : account.http_request(link, {}, (body, response, error) =>
                (!body.indexOf('has been confirmed')) ?
                  account.log("FAILURE | http_request: " + ("noConfirm=" + link.substr(119,20) + "|" + offer.id).yellow)
                : receiver.tradeOfferManager.getOffer(offer.id, (err, offer) =>
                    (err) ?
                      account.log("FAILURE | getOffer: " + ("error=" + err).yellow)
                    : offer.getUserDetails((err, me, them) =>
                      offer.accept(false, (err, status) =>
                        account.log("SUCCESS | offer.accept: " + (status + "=" + me.escrowDays + "/" + them.escrowDays + "_days").yellow)))))))()))))()));
//------------------------------------------------------------------------------