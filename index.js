import { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    REST, 
    Routes, 
    EmbedBuilder, 
    PermissionFlagsBits 
} from 'discord.js';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const execPromise = util.promisify(exec);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Vibrant, High-Contrast Aesthetic Themes
const THEME = {
    VIBRANT_PINK: 0xFF69B4,
    NEON_PURPLE: 0x9400D3,
    GRADIENT_CYAN: 0x00FFFF,
    SUCCESS_GREEN: 0x00FF7F,
    CRIMSON_RED: 0xDC143C
};

// Local storage config database for tracking authorized role
const DB_FILE = './configDb.json';
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ authorizedRoleId: null }));
}

function getAuthRole() {
    return JSON.parse(fs.readFileSync(DB_FILE)).authorizedRoleId;
}

function setAuthRole(roleId) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ authorizedRoleId: roleId }));
}

// Register Discord Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('💖 Deploy a fresh isolated Docker VPS instance container')
        .addStringOption(opt => opt.setName('os').setDescription('Select Operating System').setRequired(true).addChoices(
            { name: 'Ubuntu 22.04 (CodeSandbox Style)', value: 'bolthosting-vps:latest' }
        ))
        .addStringOption(opt => opt.setName('username').setDescription('System profile identity (e.g. root@name)').setRequired(true))
        .addStringOption(opt => opt.setName('password').setDescription('Secure root password access credentials').setRequired(true)),

    new SlashCommandBuilder()
        .setName('assign-vps-role')
        .setDescription('🔮 Assign deployment privileges to a specific role')
        .addRoleOption(opt => opt.setName('role').setDescription('Target role for deployment permissions').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('remove-vps')
        .setDescription('❌ Instantly delete and wipe a specific Docker VPS container')
        .addStringOption(opt => opt.setName('container_id').setDescription('The unique container ID of the VPS').setRequired(true))
        .addStringOption(opt => opt.setName('password').setDescription('Confirm deletion process with your secure password').setRequired(true)),

    new SlashCommandBuilder()
        .setName('start-vps')
        .setDescription('⚡ Boot up an offline VPS container')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target container ID').setRequired(true)),

    new SlashCommandBuilder()
        .setName('restart-vps')
        .setDescription('🔄 Perform a clean restart sequence on a VPS container')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target container ID').setRequired(true)),

    new SlashCommandBuilder()
        .setName('vps-information')
        .setDescription('📊 Fetch resource allocation status for a specific VPS container')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target container ID').setRequired(true)),

    new SlashCommandBuilder()
        .setName('bot-information')
        .setDescription('💎 Inspect core bot infrastructure and platform information')
];

// Deploy slash commands on boot
client.once('ready', async () => {
    console.log(`✨ Connected successfully as ${client.user.tag}!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('🔮 Aesthetic slash commands populated successfully.');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
});

// Interaction Handling Router
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member } = interaction;
    const adminRole = getAuthRole();

    // Permissions Guard
    if (['deploy', 'assign-vps-role', 'remove-vps'].includes(commandName)) {
        const hasRole = member.roles.cache.has(adminRole);
        const isServerAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        
        if (!hasRole && !isServerAdmin) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(THEME.CRIMSON_RED)
                    .setTitle('⚠️ Operational Security Access Restrained')
                    .setDescription('```diff\n- You do not have the required administrative role to manage VPS containers.```')
                    .setFooter({ text: `Powered by BoltHosting • Lights.in` })
                ], ephemeral: true
            });
        }
    }

    if (commandName === 'assign-vps-role') {
        const targetRole = options.getRole('role');
        setAuthRole(targetRole.id);
        
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(THEME.SUCCESS_GREEN)
                .setTitle('✨ Privilege Configuration Updated')
                .setDescription(`🔮 Deployment privileges successfully assigned to: **${targetRole.name}**\nMembers with this role can now use all admin commands.`)
                .setTimestamp()
            ]
        });
    }

    if (commandName === 'deploy') {
        await interaction.deferReply({ ephemeral: true });
        const customUser = options.getString('username').replace(/[^a-zA-Z0-9]/g, ''); 
        const rootPass = options.getString('password');
        const containerId = `vps-${Math.random().toString(36).substring(2, 7)}`;

        try {
            // 1. Run a new detached Docker Container from our custom image
            await execPromise(`docker run -d --name ${containerId} --privileged bolthosting-vps:latest`);
            
            // 2. Inject and update the root password dynamically inside the container
            await execPromise(`docker exec ${containerId} bash -c "echo 'root:${rootPass}' | chpasswd"`);

            // 3. Fire up sshx in the background inside the container to grab a web shell link
            const sshxCmd = `docker exec ${containerId} bash -c "timeout 300 sshx -q > /root/sshx.log 2>&1 &"`;
            exec(sshxCmd); // Run non-blocking

            // Let sshx complete its connection handshake handshake
            await new Promise(resolve => setTimeout(resolve, 4000));

            // 4. Extract the generated URL link out of the log file
            const { stdout: logData } = await execPromise(`docker exec ${containerId} cat /root/sshx.log`);
            const webShellUrl = logData.match(/https:\/\/sshx\.io\/c\/[a-zA-Z0-9_-]+/)?.[0] || "🔗 Session initialized background loop.";

            const embedFeedback = new EmbedBuilder()
                .setColor(THEME.VIBRANT_PINK)
                .setTitle('💖 Premium VPS Container Fabricated Successfully')
                .setDescription('✨ Your isolated Docker-based virtual runtime env environment is ready!')
                .addFields(
                    { name: '🆔 Container Reference ID', value: `\`${containerId}\``, inline: true },
                    { name: '💿 Operating System Matrix', value: `\`Ubuntu 22.04 LTS\``, inline: true },
                    { name: '👤 Identity User Target', value: `\`${customUser}\``, inline: true },
                    { name: '🔑 Security Access Password', value: `|| ${rootPass} ||`, inline: false },
                    { name: '⚡ Secure Web SSH Link (sshx)', value: `[🎯 Instant Web Terminal Direct Entry](${webShellUrl})`, inline: false }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: `Infrastructure Provided by Lights.in • System Active` })
                .setTimestamp();

            try {
                await interaction.user.send({ embeds: [embedFeedback] });
                await interaction.editReply({ content: '✨ 💖 Check your direct messages! Your secure private runtime environment coordinates have arrived.' });
            } catch {
                await interaction.editReply({ content: '⚠️ DM delivery failed. Check your privacy options, here are the details:', embeds: [embedFeedback] });
            }

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: `❌ Critical system exception during container build: \`${err.message}\`` });
        }
    }

    if (commandName === 'start-vps') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            await execPromise(`docker start ${containerId}`);
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(THEME.SUCCESS_GREEN).setTitle(`⚡ Container [${containerId}] Online`).setDescription('🔄 Docker environment engines engaged successfully.').setTimestamp()]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ Error running start sequence: \`${e.message}\`` });
        }
    }

    if (commandName === 'restart-vps') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            await execPromise(`docker restart ${containerId}`);
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(THEME.GRADIENT_CYAN).setTitle(`🔄 Warm Reboot Executed [${containerId}]`).setDescription('💖 Container engine layer states re-aligned successfully.').setTimestamp()]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ Error running restart commands: \`${e.message}\`` });
        }
    }

    if (commandName === 'remove-vps') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            await execPromise(`docker rm -f ${containerId}`);
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(THEME.CRIMSON_RED).setTitle(`🗑️ Hardware Container Terminated Successfully`).setDescription(`✨ Container \`${containerId}\` has been permanently purged from internal system storage.`).setTimestamp()]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ System purge exception encountered: \`${e.message}\`` });
        }
    }

    if (commandName === 'vps-information') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            const { stdout: info } = await execPromise(`docker stats ${containerId} --no-stream --format "json"`);
            const data = JSON.parse(info);
            
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(THEME.NEON_PURPLE)
                    .setTitle(`📊 Core Hardware Profile: ${containerId}`)
                    .addFields(
                        { name: '🖥️ CPU Usage', value: `\`${data.CPUPerc}\``, inline: true },
                        { name: '💾 Memory Usage', value: `\`${data.MemUsage}\``, inline: true },
                        { name: '📈 Memory Limit', value: `\`${data.MemPerc}\``, inline: true },
                        { name: '🌐 Network I/O', value: `\`${data.NetIO}\``, inline: false }
                    )
                    .setTimestamp()]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ Failed parsing metrics context layer: \`${e.message}\`` });
        }
    }

    if (commandName === 'bot-information') {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(THEME.VIBRANT_PINK)
                .setTitle('💎 BoltHosting Deployer Bot Core Profiles')
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription('✨ Ultra-premium aesthetic automated standalone sandbox deployment container platform daemon setup.')
                .addFields(
                    { name: '👑 Master Platform Owner', value: `\`${process.env.OWNER_NAME || 'Lights.in'}\``, inline: true },
                    { name: '🟢 Automation Engine Status', value: '`Natively Active` 🛡️', inline: true },
                    { name: '⚙️ Virtualization Layer Type', value: '`Docker Container Core Sandboxing` 🐳', inline: false }
                )
                .setFooter({ text: 'Designed uniquely for BoltHosting systems' })
                .setTimestamp()
            ]
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
      
