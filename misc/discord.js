//------------------------------------------------------------------------------ DiscordFunctional
Discord = require('discord.js'),
discord = new Discord.Client(),
discord = {},
discord_activity_types = [ 'PLAYING', 'STREAMING', 'LISTENING', 'WATCHING' ],
discord.active_chat = false,
discord.on('error', console.error),
discord.login(config.twitter.discord_key),
discord.once('ready', () => (
  discord.loggedOn = true,
  log(accounts[0], "SESSION | discord logon: " + discord.user.tag.yellow),
  discord.on('message', (msg,
    priv = (msg.channel instanceof Discord.DMChannel ? true : false),
    self = (msg.author.tag.match(/byteframe.*#0942/) ? true : false),
    user = (priv ? msg.channel.recipient.tag : (msg.mentions.users.first() ? msg.mentions.users.first().tag : '')),
    vector = (!self) ? '<<' : '^^') => (
    send_reply = (reply) => (
      discord.active_chat = true,
      msg.channel.startTyping(),
      setTimeout(() => (
        discord.active_chat = false,
        msg.channel.stopTyping(),
        msg.reply(reply + 'ㅤ'),
        log_chat(user, '>>', reply)), Math.max(Math.min(reply.length, 100)*50, 1500))),
    (!msg.author.bot) &&
      (priv || (self && user) || (user && user.match(/byteframe.*#0942/))) ? (
        (!self) ?
          (incoming_message_event(user, msg.content, discord)) &&
            send_reply(get_reply(user, msg.content))
        : (handle_message_echo(user, msg.content)) &&
            send_reply(get_reply(user, msg.content.substr(2))),
        (msg.content.indexOf('ㅤ') == -1) &&
          log_chat(user, vector, msg.content))
      : (msg.channel.id != "391678265166921760" || !msg.author.tag.match(/byteframe.*#0942/)) &&
        log_chat(msg.channel.id, '@@', msg.author.tag + ": \n" + msg.content))),
  (discord_activity_blinker = () => (
    discord.user.setActivity(generate_artwork_text(), { type: pool(discord_activity_types) } ),
    discord.user.setStatus('idle').then(() =>
      setTimeout(() =>
        discord.user.setStatus('dnd').then(() =>
          setTimeout(() =>
            discord.user.setStatus('online').then(() =>
              setTimeout(() =>
                discord_activity_blinker(), 3000)), 3000)), 3000))))())),
discord_change_profile = (minutes, tag, avatar) =>
  (discord.status == 0) &&
    (minutes == 30) ?
      discord.user.setUsername(tag, accounts[0].pass)
    : (minutes == 20 || minutes == 40) &&
      discord.user.setAvatar(avatar));
//------------------------------------------------------------------------------ OldDiscordProcedure
var priv = (msg.channel instanceof Discord.DMChannel ? true : false)
  , self = (msg.author.tag.match(/byteframe.*#0942/) ? true : false)
  , user = (priv ? msg.channel.recipient.tag : (msg.mentions.users.first() ? msg.mentions.users.first().tag : ''));
if (!msg.author.bot) {
  if (priv || (self && user) || (user && user.match(/byteframe.*#0942/))) {
    if (self) {
      return handle_message_echo(user, msg.content, (reply) => { msg.reply(reply + "ㅤ"); }, discord);
    }
    incoming_message_event(msg.author.tag, msg.content,
      () => { msg.channel.startTyping(); },
      () => { msg.channel.stopTyping(); },
      (discord, reply) => { msg.reply(reply); }
    , discord);
  } else {
    log_line(msg.channel.id, "@@", msg.author.tag + ": " + msg.content, discord);
  }
}
//------------------------------------------------------------------------------ DiscordProcedural
var Discord = require('discord.js')
  , discord = new Discord.Client()
  , discord_activity_blinker_delay = 3000
  , discord_activity_types = [ 'PLAYING', 'STREAMING', 'LISTENING', 'WATCHING' ];
discord.active_chat = false;
discord.on('error', console.error);
discord.once('ready', () => {
  console.log("SESSION |" + '000'.gray + "| discord logon: ".reset + discord.user.tag.yellow);
  discord.on('message', (msg) => {
    var priv = (msg.channel instanceof Discord.DMChannel ? true : false)
      , self = (msg.author.tag.match(/byteframe.*#0942/) ? true : false)
      , user = (priv ? msg.channel.recipient.tag : (msg.mentions.users.first() ? msg.mentions.users.first().tag : ''))
      , vector = (!self) ? '<<' : '^^';
    send_reply = (reply) => {
      discord.active_chat = true;
      msg.channel.startTyping();
      setTimeout(() => {
        discord.active_chat = true;
        msg.channel.stopTyping();
        msg.reply(reply + 'ㅤ');
        log_chat(user, '>>', reply);
      }, Math.max(Math.min(reply.length, 100)*50, 1500));
    };
    if (!msg.author.bot) {
      if (priv || (self && user) || (user && user.match(/byteframe.*#0942/))) {
        if (!self) {
          if (incoming_message_event(user, msg.content, discord)) {
            send_reply(get_reply(user, msg.content));
          }
        } else {
          if (handle_message_echo(user, msg.content)) {
            send_reply(get_reply(user, msg.content.substr(2)));
          }
        }
        if (msg.content.indexOf('ㅤ') == -1) {
          log_chat(user, vector, msg.content);
        }
      } else {
        log_chat(msg.channel.id, '@@', msg.author.tag + ": " + msg.content);
      }
    }
  });
  (start_discord_activity_blinker = () => {
    discord.user.setActivity(artwork_selection_text(), { type: pool(discord_activity_types) } );
    discord.user.setStatus('idle').then(() => {
      setTimeout(() => {
        discord.user.setStatus('dnd').then(() => {
          setTimeout(() => {
            discord.user.setStatus('invisible').then(() => {
              setTimeout(() => {
                discord.user.setStatus('online').then(() => {
                  setTimeout(() => {
                    start_discord_activity_blinker();
                  }, discord_activity_blinker_delay);
                });
              }, discord_activity_blinker_delay);
            });
          }, discord_activity_blinker_delay);
        });
      }, discord_activity_blinker_delay);
    });
  })();
});
discord_change_profile = (minutes, tag, avatar) => {
  if (discord == 'inactive' && discord.status == 0) {
    if (minutes == 30) {
      discord.user.setUsername(tag, config.discord.discord_password);
    } else if (minutes == 20 || minutes == 40) {
      discord.user.setAvatar(avatar);
    }
  }
};
//------------------------------------------------------------------------------