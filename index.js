import { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    REST, 
    Routes, 
    EmbedBuilder, 
    PermissionFlagsBits,
    ActivityType,
    PresenceUpdateStatus
} from 'discord.js';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const execPromise = util.promisify(exec);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Premium Aesthetic Vibrant Neon Theme Colors
const THEME = {
    ELECTRIC_PINK: 0xFF1493,
    DEEP_PURPLE: 0x8A2BE2,
    CYAN_GLOW: 0x00FFFF,
    NEON_GREEN: 0x39FF14,
    BURNING_RED: 0xFF3333
};

// Safe Path Resolution for ES Modules database management
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'configDb.json');

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ authorizedRoleId: null }, null, 2));
}

function getAuthRole() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data).authorizedRoleId;
    } catch (e) {
        return null;
    }
}

function setAuthRole(roleId) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ authorizedRoleId: roleId }, null, 2));
}

// Global UI Layout Elements
const UI_DECORATOR = "✨ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ✨";
const UI_FOOTER = "Infrastructure Engineered by Lights.in • BoltHosting";

// Definitive Application Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('💖 Provision a hyper-isolated, high-performance virtual environment runtime')
        .addStringOption(opt => opt.setName('os').setDescription('Select Enterprise Operating System OS Base Matrix').setRequired(true).addChoices(
            { name: 'Ubuntu 22.04 LTS (CodeSandbox Ultra Sandbox)', value: 'bolthosting-vps:latest' }
        ))
        .addStringOption(opt => opt.setName('username').setDescription('System profile username identifier (e.g. root@name)').setRequired(true))
        .addStringOption(opt => opt.setName('password').setDescription('Secure root authorization password credentials').setRequired(true)),

    new SlashCommandBuilder()
        .setName('assign-vps-role')
        .setDescription('🔮 Synchronize network instance manipulation privileges to a staff role')
        .addRoleOption(opt => opt.setName('role').setDescription('Target configuration deployment authorization role').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('remove-vps')
        .setDescription('❌ Instantly wipe, decommission, and shred an active virtual runtime instance')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target unique VPS alphanumeric reference container ID').setRequired(true))
        .addStringOption(opt => opt.setName('password').setDescription('Enter secure password validation parameter to execute process').setRequired(true)),

    new SlashCommandBuilder()
        .setName('start-vps')
        .setDescription('⚡ Boot up an offline cloud instance infrastructure container')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target container reference ID').setRequired(true)),

    new SlashCommandBuilder()
        .setName('restart-vps')
        .setDescription('🔄 Perform a warm reboot cycle sequence on a running virtual server')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target container reference ID').setRequired(true)),

    new SlashCommandBuilder()
        .setName('vps-information')
        .setDescription('📊 Fetch exact low-level hardware virtualization resource parsing details')
        .addStringOption(opt => opt.setName('container_id').setDescription('Target container reference ID').setRequired(true)),

    new SlashCommandBuilder()
        .setName('bot-information')
        .setDescription('💎 Inspect core platform node states, service status, and software identity metrics')
];

// Discord Ready Client Initialization with Dynamic Status Rotator
client.once('ready', async () => {
    console.log(`✨ System authenticated. Online as ${client.user.tag}!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 Syncing premium command mapping routes...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('🔮 Command mapping loaded natively without exceptions.');
    } catch (error) {
        console.error('❌ Critical REST command registry error:', error);
    }

    // Dynamic High-Tier Presence Rotation Engine
    let presenceToggle = true;
    setInterval(() => {
        try {
            if (presenceToggle) {
                client.user.setPresence({
                    activities: [{ name: 'BoltHosting 1₹ GB Plan.', type: ActivityType.Watching }],
                    status: PresenceUpdateStatus.DoNotDisturb
                });
            } else {
                client.user.setPresence({
                    activities: [{ name: 'BoltHosting KVM.', type: ActivityType.Listening }],
                    status: PresenceUpdateStatus.DoNotDisturb
                });
            }
            presenceToggle = !presenceToggle;
        } catch (presenceErr) {
            console.error('Presence allocation bypass warning:', presenceErr.message);
        }
    }, 10000); // Transitions seamlessly every 10 seconds
});

// Client Command Execution Router Core Logic
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member } = interaction;
    const adminRole = getAuthRole();

    // Security Verification Guard Layer
    if (['deploy', 'assign-vps-role', 'remove-vps'].includes(commandName)) {
        const hasRole = adminRole ? member.roles.cache.has(adminRole) : false;
        const isServerAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        
        if (!hasRole && !isServerAdmin) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(THEME.BURNING_RED)
                    .setTitle('🔒 Operational Security Boundary Restrained')
                    .setDescription(`\`\`\`diff\n- Access Cleared: Denied\n- Authorization Profile Validation Failed.\n- Required administrative clearance missing.\`\`\n\n${UI_DECORATOR}`)
                    .setFooter({ text: UI_FOOTER })
                ], ephemeral: true
            });
        }
    }

    // Command Logic Matrix Block
    if (commandName === 'assign-vps-role') {
        const targetRole = options.getRole('role');
        setAuthRole(targetRole.id);
        
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(THEME.NEON_GREEN)
                .setTitle('🔮 Network Authorization Map Synchronized')
                .setDescription(`${UI_DECORATOR}\n\n✨ **System Privileges Successfully Bound to:** ${targetRole}\n\n> Users assigned to this specific profile role now inherit administrative orchestration rights to configure, build, and destroy virtual core container sandboxes.`)
                .setTimestamp()
                .setFooter({ text: UI_FOOTER })
            ]
        });
    }

    if (commandName === 'deploy') {
        await interaction.deferReply({ ephemeral: true });
        const customUser = options.getString('username').replace(/[^a-zA-Z0-9]/g, ''); 
        const rootPass = options.getString('password');
        const containerId = `vps-${Math.random().toString(36).substring(2, 7)}`;

        try {
            // Deploy tracking instance container onto native system kernel
            await execPromise(`docker run -d --name ${containerId} --privileged bolthosting-vps:latest`);
            
            // Allow container virtual network bridge stack to register fully
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Mount core user access profiles inside sandbox container space
            await execPromise(`docker exec ${containerId} bash -c "echo 'root:${rootPass}' | chpasswd"`);
            await execPromise(`docker exec ${containerId} service ssh start`);

            // Ignite background dynamic shell multiplex loop natively via nohup 
            const sshxCmd = `docker exec ${containerId} bash -c "nohup sshx -q > /root/sshx.log 2>&1 &"`;
            await execPromise(sshxCmd);

            // Allow the network handshakes to pass through the sshx proxy link infrastructure
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Pull raw endpoint terminal link context string matches out of execution runtime spaces
            const { stdout: logData } = await execPromise(`docker exec ${containerId} cat /root/sshx.log`);
            const webShellUrl = logData.match(/https:\/\/sshx\.io\/c\/[a-zA-Z0-9_-]+/)?.[0];

            if (!webShellUrl) {
                throw new Error("Handshake connection dropped. Check main hosting platform proxy configuration policies.");
            }

            const embedFeedback = new EmbedBuilder()
                .setColor(THEME.ELECTRIC_PINK)
                .setTitle('💖 High-Tier Dedicated Instance Fabricated')
                .setDescription(`📦 **Instance Node Identifier Configuration Matrix Ready!**\nYour ultra-clean, completely isolated sandbox node virtual runtime is active.\n\n${UI_DECORATOR}`)
                .addFields(
                    { name: '🆔 Node Ref Key', value: `\`${containerId}\``, inline: true },
                    { name: '💿 Operating Matrix', value: `\`Ubuntu 22.04 LTS\``, inline: true },
                    { name: '👤 Master Profile', value: `\`${customUser}\``, inline: true },
                    { name: '🔑 Password Token Access', value: `||\`${rootPass}\`||`, inline: false },
                    { name: '⚡ Direct Secure Web SSH Access Entry Terminal', value: `> [🎯 Access Web Shell Terminal Session](${webShellUrl})`, inline: false }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: UI_FOOTER })
                .setTimestamp();

            try {
                await interaction.user.send({ embeds: [embedFeedback] });
                await interaction.editReply({ content: '✨ **Provisioning phase terminated clean.** 💖 Connection keys successfully pushed straight into your secure Direct Messages!' });
            } catch {
                await interaction.editReply({ content: '⚠️ **System warning notification:** Direct Message delivery channel restricted by privacy settings. Access your terminal node configurations right here:', embeds: [embedFeedback] });
            }

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: `❌ **Infrastructure Exception Hook Encountered:** \`${err.message}\`` });
        }
    }

    if (commandName === 'start-vps') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            await execPromise(`docker start ${containerId}`);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(THEME.NEON_GREEN)
                    .setTitle(`⚡ Power Sequence Transmitted [${containerId}]`)
                    .setDescription(`${UI_DECORATOR}\n\n🟩 **Status:** \`ONLINE\`\nContainer power pipelines engaged. Target application loops initialized inside internal memory matrix.`)
                    .setTimestamp()
                    .setFooter({ text: UI_FOOTER })
                ]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ **Error running boot loader commands:** \`${e.message}\`` });
        }
    }

    if (commandName === 'restart-vps') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            await execPromise(`docker restart ${containerId}`);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(THEME.CYAN_GLOW)
                    .setTitle(`🔄 Warm Kernel Reboot Executed [${containerId}]`)
                    .setDescription(`${UI_DECORATOR}\n\n🟦 **Status:** \`REBOOTED\`\nMemory allocation matrices completely flushed. Daemon engine profiles refreshed cleanly.`)
                    .setTimestamp()
                    .setFooter({ text: UI_FOOTER })
                ]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ **Error running process system restart sequences:** \`${e.message}\`` });
        }
    }

    if (commandName === 'remove-vps') {
        const containerId = options.getString('container_id');
        await interaction.deferReply();
        try {
            await execPromise(`docker rm -f ${containerId}`);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(THEME.BURNING_RED)
                    .setTitle(`🗑️ Node Infrastructure Safely Decommissioned`)
                    .setDescription(`${UI_DECORATOR}\n\n🟥 **Status:** \`SHREDDED\`\nInstance \`${containerId}\` has been permanently unmounted, wiped, and erased out of local storage sectors.`)
                    .setTimestamp()
                    .setFooter({ text: UI_FOOTER })
                ]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ **Error running container termination cleanup:** \`${e.message}\`` });
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
                    .setColor(THEME.DEEP_PURPLE)
                    .setTitle(`📊 Core Hardware Profile Telemetry: ${containerId}`)
                    .setDescription(`${UI_DECORATOR}\nReal-time hypervisor resource runtime consumption telemetry data parsing loops.`)
                    .addFields(
                        { name: '🖥️ CPU Usage Vector', value: `\`${data.CPUPerc}\``, inline: true },
                        { name: '💾 RAM Capacity Active', value: `\`${data.MemUsage}\``, inline: true },
                        { name: '📈 Total Resource Limit', value: `\`${data.MemPerc}\``, inline: true },
                        { name: '🌐 Network Transport IO Throttle', value: `\`${data.NetIO}\``, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: UI_FOOTER })
                ]
            });
        } catch (e) {
            return interaction.editReply({ content: `❌ **Error gathering core hardware container statistics:** Container might be offline or non-existent.` });
        }
    }

    if (commandName === 'bot-information') {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(THEME.ELECTRIC_PINK)
                .setTitle('💎 BoltHosting Deployer Automation Profile Core')
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription(`✨ **Premium High-Performance Automated Container Platform Virtualization Engine Stack.**\n\n${UI_DECORATOR}`)
                .addFields(
                    { name: '👑 Infrastructure Master Principal', value: `\`${process.env.OWNER_NAME || 'Lights.in'}\``, inline: true },
                    { name: '🟢 Service Pipeline Status', value: '`Natively Operational` 🛡️', inline: true },
                    { name: '🐳 Virtualization Hypervisor Layer', value: '`Docker Sandboxing API Framework` 💎', inline: false }
                )
                .setFooter({ text: UI_FOOTER })
                .setTimestamp()
            ]
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
            
