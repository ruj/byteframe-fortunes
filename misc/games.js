// generate ascii art
text_files = {},
text_dir = fs.readdirSync('./text'),
generate_text = (file = pool(text_dir)) => (
  (!(file in text_files)) ?
    text_files[file] = fs.readFileSync('./text/' + file, 'utf8')
      .replace(/^ $/m, '').replace(/(\r\n|\r|\n){3,}/g, '\n\n').split('\n\n').filter((n) => n): null,
  pool(text_files[file]));

// apply listeners, catch chat triggers and instantiate player states
const adventurejs = require("adventurejs");
adventure_states = {},
friend_message_echo_handlers.push((steamid, msg, account) =>
  handle_games_request(steamid, msg, account)),
friend_message_handlers.push((steamid, msg, account) =>
  handle_games_request(steamid, msg, account)),
check_credits = (userid, price) =>
  config.games[userid].credits >= price,
handle_games_request = (userid, msg, account) => {
  if (account.active_chat) {
    return;
  }
  if (typeof config.games[userid] == 'undefined') {
    config.games[userid] = { credits: 1000, blackjack: { state: 2, deck: [] } };
  }
  if (msg.indexOf('@') == 0) {
    if (typeof config.games[userid].adventure == 'undefined') {
      config.games[userid].adventure = adventurejs.makeState();
      msg = '@';
    } else if (!adventure_states.hasOwnProperty(userid)) {
      config.games[userid].adventure = adventurejs.makeState(config.games[userid].adventure);
    }
    adventure_states[userid] = 0;

    // handle input and advance game
    var text = config.games[userid].adventure.advance(msg.substr(1))
      , j = 0;
    for (var i = 0; i < text.length; i++) {
      if (text[i].length > 1) {
        break;
      }
      j++;
    }
    text = text.slice(j);
    j = 0;
    for (i = text.length-1; i > 0; i--) {
      if (text[i].length > 1) {
        break;
      }
      j++;
    }
    if (j > 0) {
      text = text.slice(0,-j);
    }
    account.send_chat(userid, "/code " + text.map((line) => "\"| " + line + Array(64-line.length).join(" ") + " |\"").join("\n"), null, 0);
  } else if (msg.indexOf('!') != 0) {
    return;
  }
  var trigger = msg.substr(1, (msg+" ").indexOf(' ')-1)
    , args = (msg+" ").substr(msg.indexOf(' ')).trim();

  // tell a joke
  if (trigger == "joke") {
    if (!check_credits(userid, 10)) {
      return account.send_chat(userid, "/quote I don't perform stand-up comedy for free!");
    }
    config.games[userid].credits -= 10;
    account.send_chat(userid, "/me Accessing Joke Matrix! 💲 " + config.games[userid].credits, () =>
      account.send_chat(userid, "/spoiler " + jokes[Math.floor(Math.random()*jokes.length)], null, 0));

  // print a haiku
  } else if (trigger == "haiku") {
    if (!check_credits(userid, 5)) {
      return account.send_chat(userid, "/quote go away person / you dont have any money / no haiku for you");
    }
    config.games[userid].credits -= 5;
    account.send_chat(userid, "/me Counting the syllables...! 💲 " + config.games[userid].credits, () =>
      account.send_chat(userid, "/spoiler " + jokes[Math.floor(Math.random()*jokes.length)], null, 0));

  // show artwork
  } else if (trigger == "art") {
    if (!check_credits(userid, 15)) {
      return account.send_chat(userid, "/quote I am an artist, but I won't starve! Shoo!");
    }
    if (args == '') {
      args = text_dir[Math.floor(Math.random()*text_dir.length)];
    } else if (args == 'help') {
      return account.send_chat(userid, 'art categories\n\n: ' + text_dir.join(', '), null, 0);
    } else if (text_dir.indexOf(args) == -1) {
      return account.send_chat(userid, 'invalid art category: ' + args);
    }
    config.games[userid].credits -= 15;
    account.send_chat(userid, "/me Drawing you a picture of " + args + "! 💲 " + config.games[userid].credits, () =>
      account.send_chat(userid, "/pre " + generate_text(args), null, 0));

  // gamble on the slots
  } else if (trigger == "slots") {
    if (!check_credits(userid, 50)) {
      return account.send_chat(userid, "/quote Not enough credits, get out of the casino!");
    }
    config.games[userid].credits -= 50;
    account.send_chat(userid, "/me Spinning the wheel! 💲 " + config.games[userid].credits, () => {
      setTimeout(() => {
        var slots_symbols = { 1: '🍊', 2: '🍉', 3: '☘️', 4: '🍋', 5: '🍫', 6: '🥓', 7: '🥗', 8: '🍒', 9: '🍇' }
          , line = [ Math.floor(Math.random()*9)+1, Math.floor(Math.random()*9)+1, Math.floor(Math.random()*9)+1 ]
          , slots_results = 0
          , string = 'You lost!';
        if (line[0] == line[1] && line[1] == line[2]) {
          slots_results = 100*line[0];
        } else {
          var line2 = line.slice().sort();
          for (var i = 0; i < line2.length-1; i++) {
            if (line2[i+1] == line2[i]) {
              slots_results = (100*line[0])/2;
            }
          }
        }
        slots_results = [ slots_results, "[ " + slots_symbols[line[0]] + " | " + slots_symbols[line[1]] + " | " + slots_symbols[line[2]] + " ]" ];
        if (slots_results[0] != 0) {
          string = 'You won ' + slots_results[0] + ' credits!';
          config[account.user.steamID.toString()].payouts += slots_results[0];
          config.games[userid].credits += slots_results[0];
        }
        string = slots_results[1] + " " + string;
        account.send_chat(userid, string);
        config[account.user.steamID.toString()].game_string = "Slots: " + slots_results[1] + " >> 💰: 666" /*+ config[account.user.steamID.toString()].payouts*/;
        account.user.gamesPlayed(config[account.user.steamID.toString()].game_string)
      }, Math.floor(Math.random() * 3000));
    });

  // play a round of blackjack
  } else if (trigger == "blackjack" || trigger == "hit" || trigger == 'stay') {
    draw = () => {
      if (config.games.blackjack_deck.length == 0) {
        [...Array(6).keys()].forEach((i) => {
          [ 'A','2','3','4','5','6','7','8','9','10','J','Q','K' ].forEach((face) => {
            [ '✤','♦','♥','♠' ].forEach((suit) => {
              config.games.blackjack_deck.push(face + suit);
            });
          });
        });
        shuffle_array(config.games.blackjack_deck);
      }
      return config.games.blackjack_deck.pop();
    };
    if (config.games[userid].blackjack.state == 2) {
      if (!check_credits(userid, 75)) {
        return account.send_chat(userid, "/quote Not enough credits, try the slots!");
      }
      config.games[userid].blackjack.state = 0;
      config.games[userid].blackjack.player_hand = [ draw(), draw() ];
      config.games[userid].blackjack.dealer_hand = [ draw(), draw() ];
      account.send_chat(userid, "/me Dealing the cards! 💲 " + config.games[userid].credits);
    }
    var new_state = 2
      , counts = [];
    (blackjack = (action = trigger) => {
      count_card = (card, total) => {
        value = 10;
        if (card[0] != 'J' && card[0] != 'Q' && card[0] != 'K') {
          value = card[0];
        }
        total[0] += (card[0] == 'A' ? 11 : value);
        total[1] += (card[0] == 'A' ? 1 : value);
      };
      var text = 'You: '
        , player_total = []
        , dealer_total = [];
      config.games[userid].blackjack.player_hand.forEach((card) => {
        text += "[" + card[0] + card[1] + "]";
        count_card(card, player_total);
      });
      text += " - Dealer: ";
      config.games[userid].blackjack.dealer_hand.forEach((card) => {
        text += "[" + card[0] + card[1] + "]";
        count_card(card, dealer_total);
      });
      text += " | ";
      if (dealer_total[0] == 21 || dealer_total[1] == 21) {
        account.send_chat(userid, text + ' Dealer has blackjack! :(');
      } else if (player_total[0] == 21 || player_total[1] == 21) {
        payout_credits(200);
        account.send_chat(userid, text + 'Player has blackjack and wins 200 credits! :)');
      } else if (player_total[1] > 21) {
        account.send_chat(userid, text + 'Player went bust! :(');
      } else if (dealer_total[1] >= 21) {
        payout_credits(150);
        account.send_chat(userid, text + 'Dealer went bust! Player wins 150 credits! :)');
      } else if (action == "hit") {
        config.games[userid].blackjack.player_hand.push(draw());
        return blackjack('blackjack');
      } else if (config.games[userid].blackjack.state == 0) {
        new_state == 1;
        return account.send_chat(userid, text + '!hit or !stay ?');
      } else if (action == "stay") {
      } else if (action == "blackjack") {
        return account.send_chat(userid, "/quote Please use !hit or !stay.");
      }
      config.games[userid].blackjack.state = new_state;
    })();

  // print help screen or error message
  } else if (trigger == "help") {
    account.send_chat(userid, '/code Hello! Welcome to primarydataloop!\n'
      + 'My name is ' + random_name({first: true, gender: 'male'}) + " " + random_name({last: true, gender: 'male'}) + ". How may I help you?\n\n"
      + 'CREDITS: ' + config.games[userid].credits + "\n\n"
      + 'Commands:\n'
      + '!haiku (5 credits) "Prints a pretty poem."\n'
      + '!joke (10 credits) "Life got you down? Buy a funny joke!"\n'
      + '!art (15 credits) "We read your mind and show you what\s inside."\n'
      + '!slots (50 credits) "Gamble for more credits!"\n'
      + '!blackjack (50 credits) "Gamble for more credits!"\n'
      + '!comment (100 credits) "Drop a deuce on a profile for a hundo."\n'
      + '!like (150 credits) "Need a +1 on your lame anime art?"\n'
      + '!follow (250 credits) "Start a cult!"\n'
      + '!enter (400 credits) "Get a goon in your group!"\n\n'
      + 'Services:\n'
      + '!email "Access electronic mail."\n'
      + '!users "Show user directory."\n'
      + '!guestbook "View/Sign user log."\n'
      + '!system "Perform control functions."\n'
      + '--------------------------------------------\n'
      + 'Other: @(adventure), $(files), %(calculator)\n'
      + '--------------------------------------------\n'
      + '>> Earth Time: ' + new Date().toUTCString(), null, 10);
  } else {
    account.send_chat(userid, 'Unknown Chat Trigger!');
  }
};