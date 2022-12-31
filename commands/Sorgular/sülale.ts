import { ICommand } from "wokcommands";
import { log } from "../../log";
import settings from "../../settings.json"
import { QuickDB } from "quick.db";
import crypto from "crypto"
import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
const fetch = require("request")
const db = new QuickDB()

export default {
    category: "Sorgu",
    description: "Ad Soyad kullanarak sorgu yapın.",
    slash: true,
    options: [
        {
            name: 'tc',
            description: "Sorgulatmak istediğiniz kişinin TC'sini yazın.",
            type: 'STRING',
            required: true
        },
    ],

    callback: async ({ interaction, guild, client }) => {
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

        const id = crypto.randomBytes(5).toString("hex")

        const member = guild.members.cache.get(interaction.user.id)
        if(!member) return

        let tc = interaction.options.getString("tc")
        if(!tc) return

        function setCharAt(str:any,index:any,chr:any) {
            if(index > str.length-1) return str;
            return str.substring(0,index) + chr + str.substring(index+1);
        }

        const api = `http://20.62.97.31/apiservice/woxy/sülale.php?tcno=${tc}&auth=woxynindaramcigi` // Kullanılan API
        await interaction.deferReply({ ephemeral: true });

        await fetch(api, async function (error:any, response:any) {
            if(error) {
                interaction.editReply({ content: "*Hatalı yazım.*" })
                console.log(error)
                return
            }
            console.log(response.body)
            const jsonResponse = JSON.parse(response.body)
            let ad:string[] = []
            let soyad:string[] = []
            let tc:string[] = []
            let dogum:string[] = []
            let nufusil:string[] = []
            let nufusilce:string[] = []
            let anaadi:string[] = []
            let anatc:string[] = []
            let babadi:string[] = []
            let babatc:string[] = []
            let uyruk:string[] = []

            let msg:string = "Sonuç Bulunamadı!"

            jsonResponse.forEach((w:any) => {
                ad.push(w.ADI)
                soyad.push(w.SOYADI)
                tc.push(w.TC)
                dogum.push(w.DOGUMTARIHI)
                nufusil.push(w.NUFUSIL)
                nufusilce.push(w.NUFUSILCE)
                anaadi.push(w.ANNEADI)
                anatc.push(w.ANNETC)
                babadi.push(w.BABAADI)
                babatc.push(w.BABATC)
                uyruk.push(w.UYRUK)
            })
            let vatandasIndex = 0
            tc.forEach(w => {
                vatandasIndex = vatandasIndex + 1
            })
            let currentIndex = 0
            if(!tc) return
            msg = `TC: ${tc[0]}\nADI: ${ad}\nSOYADI: ${soyad}\nDOGUM TARIHI: ${dogum[0]}\nNUFUS IL: ${nufusil[0]}\nNUFUS ILCE: ${nufusilce[0]}\nANNE ADI: ${anaadi[0]}\nBABA ADI: ${babadi[0]}\nANNE TC: ${anatc[0]}\nBABA TC: ${babatc[0]}\nUYRUK: ${uyruk[0]}\n\nSayfa: ${currentIndex + 1}\n${vatandasIndex} Adet sayfa mevcut`

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`back-adsoyad-${id}`)
                        .setLabel('Geri')
                        .setStyle('SECONDARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId(`next-adsoyad-${id}`)
                        .setLabel('İleri')
                        .setStyle('SECONDARY')
                )

            let embed = new MessageEmbed()
                .setTitle(`${guild.name}`)
                .setDescription(`**Çıktı:\n${msg}**`)
                .setTimestamp()
                .setFooter({
                    text: settings.footer,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
            let messssage = await interaction.channel?.send({ embeds: [embed], components: [row] })
            await interaction.editReply({ content: "**Sorgu Çıktısı:**" })
            log((logChannel as TextChannel), member, "Ad Soyad Sorgu", msg)
            client.on('interactionCreate', async (button) => {
                if(!button.isButton()) return

                if(button.customId == `next-adsoyad-${id}`) {
                    if(vatandasIndex <= currentIndex + 1) {
                        button.reply({ content: "*Zaten son sayfadasın.*", ephemeral: true })
                        return
                    }
                    currentIndex = currentIndex + 1
                    if(!ad || !soyad) return
                    msg = `TC: ${tc[currentIndex]}\nADI: ${ad}\nSOYADI: ${soyad}\nDOGUM TARIHI: ${dogum[currentIndex]}\nNUFUS IL: ${nufusil[currentIndex]}\nNUFUS ILCE: ${nufusilce[currentIndex]}\nANNE ADI: ${anaadi[currentIndex]}\nBABA ADI: ${babadi[currentIndex]}\nANNE TC: ${anatc[currentIndex]}\nBABA TC: ${babatc[currentIndex]}\nUYRUK: ${uyruk[currentIndex]}\n\nSayfa: ${currentIndex + 1}\n${vatandasIndex} Adet sayfa mevcut`
                    embed = embed.setDescription(`**Çıktı:\n${msg}**`)
                    messssage?.edit({ embeds: [embed], components: [row] })
                    button.reply({ content: "*Sayfa değiştirildi.*", ephemeral: true })
                    
                }
                if(button.customId == `back-adsoyad-${id}`) {
                    if(0 >= currentIndex) {
                        button.reply({ content: "*Zaten son sayfadasın.*", ephemeral: true })
                        return
                    }
                    currentIndex = currentIndex - 1
                    if(!ad || !soyad) return
                    msg = `TC: ${tc[currentIndex]}\nADI: ${ad}\nSOYADI: ${soyad}\nDOGUM TARIHI: ${dogum[currentIndex]}\nNUFUS IL: ${nufusil[currentIndex]}\nNUFUS ILCE: ${nufusilce[currentIndex]}\nANNE ADI: ${anaadi[currentIndex]}\nBABA ADI: ${babadi[currentIndex]}\nANNE TC: ${anatc[currentIndex]}\nBABA TC: ${babatc[currentIndex]}\nUYRUK: ${uyruk[currentIndex]}\n\nSayfa: ${currentIndex + 1}\n${vatandasIndex} Adet sayfa mevcut`
                    embed = embed.setDescription(`**Çıktı:\n${msg}**`)
                    messssage?.edit({ embeds: [embed], components: [row] })
                    button.reply({ content: "*Sayfa değiştirildi.*", ephemeral: true })
                }
            })
        })
    }
} as ICommand