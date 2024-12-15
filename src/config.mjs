import process from "process";
import dotenv from "dotenv";
dotenv.config();

export default {
    chat: {
        responseRate: process.env.RESPONSE_RATE || 0.2
    },
    mongo: {
        uri: process.env.MONGO_URI
    },
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN
    },
    x: {
        // x service configuration
    }
}