import { ICommand } from "wokcommands";
import { log } from "../../log";
import settings from "../../settings.json"
import { QuickDB } from "quick.db";
import { MessageEmbed, TextChannel } from "discord.js";
const fetch = require("request")
const db = new QuickDB()

export default {
    category: "Sorgu",
    description: "TC kullanarak telefon sorgusu yapın.",
    slash: true,
    options: [
        {
            name: 'tc',
            description: "Sorgulatmak istediğiniz kişinin TC'sini yazın.",
            type: 'STRING',
            required: true
        }
    ],

    callback: async ({ interaction, guild }) => {
        if(!guild) return

        const premium = await db.get(`${guild.id}_${interaction.user.id}_premium`)
        const satinAlChannel = guild.channels.cache.get(settings.kanallar.satinAl)
        const logChannel = guild.channels.cache.get(settings.kanallar.logs)

        const channel = interaction.channel
        if(!channel) return

        if(!settings.admins.some(w => interaction.user.id.includes(w))) {
            if(Number(premium) != 1) {
                interaction.reply({ content: `*Bu komutu kullanabilmek için premium satın alman gerekiyor.*\n> ${satinAlChannel}` })
                return
            }
        }

        const member = guild.members.cache.get(interaction.user.id)
        if(!member) return

        const tc = interaction.options.getString("tc")

        if(!tc) return

        const api = `http://20.62.97.31/apiservice/woxy/tcgsm.php?tc=${tc}&auth=woxynindaramcigi` // Kullanılan API
        await interaction.deferReply({ ephemeral: true });

        await fetch(api, function (error:any, response:any) {
            if(error) {
                interaction.editReply({ content: "*Hatalı yazım.*" })
                return
            }
            if(!tc[10]) {
                interaction.editReply({ content: "*Hatalı yazım.*" })
                return
            }

            let gsm:string[] = []

            const jsonResponse = JSON.parse(response.body)

            jsonResponse.forEach((w:any) => {
                gsm.push(w.GSM)
            })

            let msg = `TC: ${tc}\nGSM: ${gsm.join(" | ")}`

            const embed = new MessageEmbed()
            .setTitle(`${guild.name}`)
            .setDescription(`**Çıktı:\n${msg}**`)
            .setTimestamp()
            .setFooter({
                text: settings.footer,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })

            interaction.editReply({ embeds: [embed] })
            log((logChannel as TextChannel), member, "TC-GSM Sorgu", msg)
        })
    }
} as ICommand