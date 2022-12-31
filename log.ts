import { MessageEmbed } from "discord.js";
import settings from "./settings.json"
import { GuildMember, TextChannel } from "discord.js";

export async function log(channel:TextChannel, user:GuildMember, action:string, msg:string) {
    const embed = new MessageEmbed()
        .setTitle('System Logs')
        .setDescription(`**Kullanılan Eylem: ${action}**\n**Kullanan Kullanıcı: ${user.user.tag} | ${user.user.id}**\n\n**Çıkan Sonuç:**\n**${msg}**`)
        .setTimestamp()
        .setFooter({
            text: settings.footer,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
    await channel.send({ embeds: [embed] })
}