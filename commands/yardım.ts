import { MessageEmbed } from "discord.js";
import { QuickDB } from "quick.db";
import { ICommand } from "wokcommands";
import settings from "../settings.json"
const db = new QuickDB()

export default {
    category: "Normal",
    description: "Komutlar hakkında yardım almanızı sağlar.",
    slash: 'both',

    callback: async ({ message, interaction, guild }) => {
        if(!guild) return

        const embed = new MessageEmbed()
            .setTitle(`${guild.name}`)
            .setDescription(`**Sorgu Komutları**\n\n</adsoyad:${settings.komutIDs.adsoyad}> *Ad Soyad Sorgusu*\n</aile:${settings.komutIDs.aile}> *Aile Sorgusu*\n</sülale:${settings.komutIDs.sulale}> *Sülale Sorgusu*\n</tc-gsm:${settings.komutIDs.tcgsm}> *TC-GSM Sorgusu*\n</gsm-tc:${settings.komutIDs.gsmtc}> *GSM-TC Sorgusu*\n</tc:${settings.komutIDs.tc}> *TC Sorgusu*`)
            .setTimestamp()
            .setFooter({
                text: settings.footer,
                iconURL: message ? message.author.displayAvatarURL({ dynamic: true }) : interaction.user.displayAvatarURL({ dynamic: true })
            })

        const preStatus = await db.get(`${guild.id}_${message ? message.author.id : interaction.user.id}_premium`)
        if(Number(preStatus) != 1) {
            message ? message.reply({ content: "*Bu komutu kullanacak yetkiye sahip değilsin.*" }) : interaction.reply({ content: "*Bu komutu kullanacak yetkiye sahip değilsin.*" })
            return
        }

        message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] })
    }
} as ICommand