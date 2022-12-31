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
            name: 'ad',
            description: 'Sorgulatmak istediğiniz kişinin ismini yazın.',
            type: 'STRING',
            required: true
        },
        {
            name: 'soyad',
            description: 'Sorgulatmak istediğiniz kişinin soyadını yazın.',
            type: 'STRING',
            required: true
        }
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

        let ad = interaction.options.getString("ad")
        let soyad = interaction.options.getString("soyad")

        if(!ad || !soyad) return

        function setCharAt(str:any,index:any,chr:any) {
            if(index > str.length-1) return str;
            return str.substring(0,index) + chr + str.substring(index+1);
        }

        if(ad.toUpperCase().includes("İ") || ad.toUpperCase().includes("Ş") || ad.toUpperCase().includes("Ğ") || ad.toUpperCase().includes("Ü") || ad.toUpperCase().includes("Ö")) {
            const allIndex = ad.length
            for(let i = 0; i <= allIndex; i++) {
                if(!ad || !soyad) return
                if(ad[i] == "İ" || ad[i] == "i") {
                    ad = setCharAt(ad, i, "I")
                }
                if(!ad || !soyad) return
                if(ad[i] == "Ş" || ad[i] == "ş") {
                    ad = setCharAt(ad, i, "S")
                }
                if(!ad || !soyad) return
                if(ad[i] == "Ğ" || ad[i] == "ğ") {
                    ad = setCharAt(ad, i, "G")
                }
                if(!ad || !soyad) return
                if(ad[i] == "Ü" || ad[i] == "ü") {
                    ad = setCharAt(ad, i, "U")
                }
                if(!ad || !soyad) return
                if(ad[i] == "Ö" || ad[i] == "ö") {
                    ad = setCharAt(ad, i, "O")
                }
            }
        }
        if(soyad.toUpperCase().includes("İ") || soyad.toUpperCase().includes("Ş") || soyad.toUpperCase().includes("Ğ") || soyad.toUpperCase().includes("Ü") || soyad.toUpperCase().includes("Ö")) {
            const allIndex = soyad.length
            for(let i = 0; i <= allIndex; i++) {
                if(!ad || !soyad) return
                if(soyad[i] == "İ" || soyad[i] == "i") {
                    soyad = setCharAt(soyad, i, "I")
                }
                if(!ad || !soyad) return
                if(soyad[i] == "Ş" || soyad[i] == "ş") {
                    soyad = setCharAt(soyad, i, "S")
                }
                if(!ad || !soyad) return
                if(soyad[i] == "Ğ" || soyad[i] == "ğ") {
                    soyad = setCharAt(soyad, i, "G")
                }
                if(!ad || !soyad) return
                if(soyad[i] == "Ü" || soyad[i] == "ü") {
                    soyad = setCharAt(soyad, i, "U")
                }
                if(!ad || !soyad) return
                if(soyad[i] == "Ö" || soyad[i] == "ö") {
                    soyad = setCharAt(soyad, i, "O")
                }
            }
        }
        if(!ad || !soyad) return

        const api = `http://20.62.97.31/apiservice/woxy/adsoyad.php?adi=${ad.toUpperCase()}&soyadi=${soyad.toUpperCase()}&auth=woxynindaramcigi` // Kullanılan API
        await interaction.deferReply({ ephemeral: true });

        await fetch(api, async function (error:any, response:any) {
            if(error) {
                interaction.editReply({ content: "*Hatalı yazım.*" })
                console.log(error)
                return
            }

            const jsonResponse = JSON.parse(response.body)
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
            if(!ad || !soyad) return
            msg = `TC: ${tc[0]}\nADI: ${ad.toUpperCase()}\nSOYADI: ${soyad.toUpperCase()}\nDOGUM TARIHI: ${dogum[0]}\nNUFUS IL: ${nufusil[0]}\nNUFUS ILCE: ${nufusilce[0]}\nANNE ADI: ${anaadi[0]}\nBABA ADI: ${babadi[0]}\nANNE TC: ${anatc[0]}\nBABA TC: ${babatc[0]}\nUYRUK: ${uyruk[0]}\n\nSayfa: ${currentIndex + 1}\n${vatandasIndex} Adet sayfa mevcut`

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
                    msg = `TC: ${tc[currentIndex]}\nADI: ${ad.toUpperCase()}\nSOYADI: ${soyad.toUpperCase()}\nDOGUM TARIHI: ${dogum[currentIndex]}\nNUFUS IL: ${nufusil[currentIndex]}\nNUFUS ILCE: ${nufusilce[currentIndex]}\nANNE ADI: ${anaadi[currentIndex]}\nBABA ADI: ${babadi[currentIndex]}\nANNE TC: ${anatc[currentIndex]}\nBABA TC: ${babatc[currentIndex]}\nUYRUK: ${uyruk[currentIndex]}\n\nSayfa: ${currentIndex + 1}\n${vatandasIndex} Adet sayfa mevcut`
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
                    msg = `TC: ${tc[currentIndex]}\nADI: ${ad.toUpperCase()}\nSOYADI: ${soyad.toUpperCase()}\nDOGUM TARIHI: ${dogum[currentIndex]}\nNUFUS IL: ${nufusil[currentIndex]}\nNUFUS ILCE: ${nufusilce[currentIndex]}\nANNE ADI: ${anaadi[currentIndex]}\nBABA ADI: ${babadi[currentIndex]}\nANNE TC: ${anatc[currentIndex]}\nBABA TC: ${babatc[currentIndex]}\nUYRUK: ${uyruk[currentIndex]}\n\nSayfa: ${currentIndex + 1}\n${vatandasIndex} Adet sayfa mevcut`
                    embed = embed.setDescription(`**Çıktı:\n${msg}**`)
                    messssage?.edit({ embeds: [embed], components: [row] })
                    button.reply({ content: "*Sayfa değiştirildi.*", ephemeral: true })
                }
            })
        })
    }
} as ICommand