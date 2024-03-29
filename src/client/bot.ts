import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Client, Intents } from 'discord.js';
import { ServerQueue } from '../../typings'

export default class BotClient extends AkairoClient {
    constructor() {
        super({
            ownerID: process.env.OWNER_ID,
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES]
        })

    }

    public commandHandler: CommandHandler = new CommandHandler(this, {
        allowMention: true,
        commandUtil: true,
        directory: __dirname + '/../commands',
        defaultCooldown: 5000,
        prefix: process.env.PREFIX
    })

    public listenerHandler = new ListenerHandler(this, {
        directory: __dirname + '/../listeners'
    });

    public queues = this.util.collection<String, ServerQueue>()

    private async _init() {
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler
        })
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.commandHandler.loadAll()
        this.listenerHandler.loadAll();
    }

    public async getQueue(guildID: String) {
        const queue = () => this.queues.get(guildID)

        if (!queue()) {

            const values: ServerQueue = {
                connection: null,
                guildID: guildID,
                playing: false,
                tracks: [],
                subs: null,
                channelID: null
            }
            await this.setQueue(guildID, values)
        }
        return queue();
    }

    public async setQueue(guildID: String, values) {
        this.queues.set(guildID, values)

        return this.getQueue(guildID)
    }

    public clearQueue(guildID: String) {
        this.queues.delete(guildID)
    }

    public async listen() {
        await this._init()

        return this.login(process.env.TOKEN)
    }

}