import { MessageEmbed } from "discord.js";
import { TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import { log } from "../log";
import settings from "../settings.json"

export default {
    category: "Normal",
    description: "Kendinize özel bir oda oluşturmanızı ve komutları kullanabilmenizi sağlar.",
    slash: true,

    callback: async ({ interaction, guild }) => {
        if(!guild) return
        const bakim = 1
        if(bakim == 1) {
            interaction.reply({ content: "*Bu komut kullanım dışı.*" })
            return
        }

        if(guild.channels.cache.find(w => w.id.includes(interaction.user.id))) {
            const channel = guild.channels.cache.find(w => w.id.includes(interaction.user.id))
            interaction.reply({ content: `*Zaten bir odaya sahipsin.*\n> ${channel}` })
            return
        }

        const logChannel = guild.channels.cache.get(settings.kanallar.logs)
        const userMember = guild.members.cache.get(interaction.user.id)
        if(!userMember) return

        const channel = await guild.channels.create(interaction.user.id, { parent: settings.odaKategorisi, type: 'GUILD_TEXT', topic: interaction.user.id, permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: interaction.user.id,
                allow: ["VIEW_CHANNEL"]
            }
        ] })
        
        const memberList: string[] = []
        await guild.members.fetch().then(w => {
            w.forEach(w => {
                memberList.push(w.id)
            })
        })
        for(let i = 0; i < memberList.length; i++) {
            if(!settings.admins.some(w => memberList[i].includes(w))) continue
            const yetkili = guild.members.cache.get(memberList[i])
            if(!yetkili) continue
            channel.permissionOverwrites.edit(yetkili, {
                VIEW_CHANNEL: true
            })
        }

        interaction.reply({ content: `*Başarıyla bir oda oluşturdun.*\n> ${channel}` })
        if(logChannel) {
            log((logChannel as TextChannel), userMember, "Oda Oluşturuldu", `Oluşturulan Oda: ${channel} | ${channel.id}`)
        }
        const embed = new MessageEmbed()
            .setTitle(`${guild.name}`)
            .setDescription(`**Odana Hoş Geldin! İşte işine yarayacak komut.**\n\n> </yardım:${settings.komutIDs.yardim}>`)
            .setTimestamp()
            .setFooter({
                text: settings.footer,
                iconURL: userMember.displayAvatarURL({ dynamic: true })
            })

        await channel.send({ embeds: [embed] })
    }
} as ICommand