import { ICommand } from "wokcommands";
import { log } from "../../log";
import settings from "../../settings.json"
import { QuickDB } from "quick.db";
import { MessageEmbed, TextChannel } from "discord.js";
const fetch = require("request")
const db = new QuickDB()

export default {
    category: "Sorgu",
    description: "TC kullanarak sorgu yapın.",
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

        const api = `http://20.62.97.31/apiservice/woxy/tc.php?tc=${tc}&auth=woxynindaramcigi` // Kullanılan API
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

            const jsonResponse = JSON.parse(response.body)
            let tcs:string[] = []
            let ad:string[] = []
            let soyad:string[] = []
            let dogum:string[] = []
            let nufusil:string[] = []
            let nufusilce:string[] = []
            let anaadi:string[] = []
            let anatc:string[] = []
            let babadi:string[] = []
            let babatc:string[] = []
            let uyruk:string[] = []

            jsonResponse.forEach((w:any) => {
                tcs.push(w.TC)
                ad.push(w.ADI)
                soyad.push(w.SOYADI)
                dogum.push(w.DOGUMTARIHI)
                nufusil.push(w.NUFUSIL)
                nufusilce.push(w.NUFUSILCE)
                anaadi.push(w.ANNEADI)
                anatc.push(w.ANNETC)
                babadi.push(w.BABAADI)
                babatc.push(w.BABATC)
                uyruk.push(w.UYRUK)
            })

            let msg = `TC: ${tcs}\nADI: ${ad}\nSOYADI: ${soyad}\nDOGUM TARIHI: ${dogum}\nNUFUS IL: ${nufusil}\nNUFUS ILCE: ${nufusilce}\nANNE ADI: ${anaadi}\nBABA ADI: ${babadi}\nANNE TC: ${anatc}\nBABA TC: ${babatc}\nUYRUK: ${uyruk}`

            const embed = new MessageEmbed()
            .setTitle(`${guild.name}`)
            .setDescription(`**Çıktı:\n${msg}**`)
            .setTimestamp()
            .setFooter({
                text: settings.footer,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })

            interaction.editReply({ embeds: [embed] })
            log((logChannel as TextChannel), member, "TC Sorgu", msg)
        })
    }
} as ICommand