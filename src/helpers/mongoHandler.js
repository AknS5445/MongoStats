const mongoose = require("mongoose")
const config = require("../../config.json");

mongoose.connect(config.bot.mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(x => console.log("[MONGO] Mongoose veri tabanına bağlanıldı!"))
    .catch(err => console.log(`[MONGO] Mongoose veri tabanına bağlanırken bir hata ile karşılaşıldı! Hata: ${err}`));