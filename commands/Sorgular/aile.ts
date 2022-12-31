import { ICommand } from "wokcommands";
import { log } from "../../log";
import settings from "../../settings.json"
import { QuickDB } from "quick.db";
import { MessageEmbed, TextChannel } from "discord.js";
const fetch = require("request")
const db = new QuickDB()

export default {
    category: "Sorgu",
    description: "TC kullanarak aile sorgusu yapın.",
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

        const bakim = 1
        if(bakim == 1) {
            interaction.reply({ content: "**Bu komut şu anda bakımdadır.**" })
            return
        }

        const premium = await db.get(`${guild.id}_${interaction.user.id}_premium`)
        const satinAlChannel = guild.channels.cache.get(settings.kanallar.satinAl)
        const logChannel = guild.channels.cache.get(settings.kanallar.logs)

        const channel = interaction.channel
        if(!channel) return

        if(!settings.admins.some(w => interaction.user.id.includes(w))) {
            if((channel as TextChannel).name != interaction.user.id) {
                interaction.reply({ content: `*Bu komutu kullanmak için oda oluşturmanız gerekiyor.*\n> </oda-olustur:${settings.komutIDs.odaolustur}>` })
                return
            }
            if(Number(premium) != 1) {
                interaction.reply({ content: `*Bu komutu kullanabilmek için premium satın alman gerekiyor.*\n> ${satinAlChannel}` })
                return
            }
        }

        const member = guild.members.cache.get(interaction.user.id)
        if(!member) return

        const tc = interaction.options.getString("tc")

        if(!tc) return

        const api = `http://20.62.97.31/apiservice/woxy/aile.php?tcno=${tc}&auth=woxynindaramcigi` // Kullanılan API

        await fetch(api, function (error:any, response:any) {
            if(error) {
                interaction.reply({ content: "*Hatalı yazım.*" })
                return
            }

            const jsonResponse = JSON.parse(response.body)

            const embed = new MessageEmbed()
            .setTitle(`${guild.name}`)
            .addFields([
                {
                    name: 'Çıktı:',
                    value: `**${jsonResponse}**`
                }
            ])
            .setTimestamp()
            .setFooter({
                text: settings.footer,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })

            interaction.reply({ embeds: [embed] })
            log((logChannel as TextChannel), member, "Aile Sorgu", response.body)
        })
    }
} as ICommand