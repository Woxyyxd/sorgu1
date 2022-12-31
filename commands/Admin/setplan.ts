import { ICommand } from "wokcommands";
import { log } from "../../log";
import settings from "../../settings.json"
import { QuickDB } from "quick.db";
import { TextChannel } from "discord.js";
const db = new QuickDB()

export default {
    category: "ADMIN",
    description: "Kullanıcıların planını düzenlemenizi sağlar. [SADECE ADMIN]",
    slash: true,
    options: [
        {
            name: 'user',
            description: 'Planını düzenlemek istediğiniz kullanıcıyı seçin.',
            type: 'USER',
            required: true
        },
        {
            name: 'plan',
            description: 'Vermek istediğiniz planı seçin.',
            choices: [
                {
                    name: 'free',
                    value: "free"
                },
                {
                    name: 'premium',
                    value: "premium"
                }
            ],
            type: 'STRING',
            required: true
        }
    ],

    callback: async ({ interaction, guild }) => {
        if(!guild) return

        const yetkili = guild.members.cache.get(interaction.user.id)
        if(!yetkili) return

        const logChannel = guild.channels.cache.get(settings.kanallar.logs)

        if(!settings.admins.some(w => yetkili.id.includes(w))) {
            interaction.reply({ content: "*Bu komutu kullanacak yetkiye sahip değilsin.*" })
            return
        }

        const plan = interaction.options.getString("plan")
        let preStatus = 0
        const user = interaction.options.getUser("user")
        if(!plan || !user) return
        const member = guild.members.cache.get(user.id)
        if(!member) return

        plan == "premium" ? preStatus = 1 : preStatus = 0

        await db.set(`${guild.id}_${user.id}_premium`, preStatus)
        interaction.reply({ content: `**${user.tag}** *Adlı kullanıcıya başarıyla* **${plan}** *planı verildi.*`, ephemeral: true })
        if(logChannel) {
            log((logChannel as TextChannel), member, "Plan Değiştirildi", `Verilen Plan: ${plan}`)
        }
    }
} as ICommand