const { Telegraf } = require("telegraf");
const dotEnv = require("dotenv");
const shortId = require("short-id");
const express = require("express");

const { User } = require("./models/User");
const { Link } = require("./models/Link");
const { connectDB } = require("./config/DB");

//! Load Config
dotEnv.config({ path: "./config/config.env" });

//! Initialize
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

//! Connect to DataBase
connectDB();

//! Handle Functions
bot.start(async (ctx) => {
  try {
    console.log(ctx.chat.id);
    const user = await User.findOne({ telegramId: ctx.chat.id });

    if (!user) {
      await User.create({
        telegramId: ctx.chat.id,
        username: ctx.chat.username,
      });
    }

    ctx.reply("What should I do?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Create New Link", callback_data: "newLink" },
            { text: "Previus Links", callback_data: "showLinks" },
          ],
        ],
      },
    });
  } catch (err) {
    console.log(err);
    ctx.reply("A problem has occurred");
  }
});

//! Listen to Callbacks
bot.on("callback_query", async (ctx) => {
  const { data } = ctx.update.callback_query;

  if (data.startsWith("link")) {
    return;
  }

  const user = await User.findOne({
    telegramId: ctx.update.callback_query.from.id,
  });

  const userlinks = await Link.find({ _id: { $in: user.links } });

  let links = [];

  userlinks.map((link, index) => {
    index = index + 1;
    links.push({
      text: `${index}. ${link.url}`,
      callback_data: `link-${index}`,
    });
  });

  switch (data) {
    case "newLink":
      ctx.reply("Insert Your Link: ");
      break;
    case "showLinks":
      console.log(links);
      ctx.reply("Your Links: ", {
        reply_markup: {
          inline_keyboard: [links],
        },
      });
      break;
  }
});

//! Listen to url
bot.url(async (ctx) => {
  let telegramId = ctx.update.message.chat.id;
  let text = ctx.update.message.text;

  let id = shortId.generate();

  let newUrl = `http://localhost:3000/${id}?url=${text}`;

  const user = await User.findOne({ telegramId: telegramId });

  if (!user) {
    bot.telegram.sendMessage(
      telegramId,
      "A problem has occurred: User Not Found"
    );
  }

  const link = await Link.create({
    url: newUrl,
    uuid: id,
    creator: user._id,
  });

  user.links.push(link._id);
  await user.save();

  ctx.reply(`Your Trackable Link: ${newUrl}`);
});

//! Routes
app.get("/:id", async (req, res) => {
  try {
    const link = await Link.findOne({ uuid: req.params.id });

    if (!link) {
      return;
    }

    const creator = await User.findById(link.creator);

    link.views++;
    await link.save();

    bot.telegram.sendMessage(creator.telegramId, "One VIew");

    res.redirect(req.query.url);
  } catch (err) {
    console.log(err);
  }
});

//! Launch the bot
bot.launch();

//! Listening
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

//! Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
