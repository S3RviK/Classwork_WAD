import os from 'os';
import fs from 'fs/promises';
import chalk from 'chalk';
import axios from 'axios';

async function fetchEnvironmentData() {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
            latitude: 19.4326,
            longitude: -99.1332,
            current: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
            timezone: 'auto'
        }
    });

    return response.data.current;
}

function formatMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(2);
}

function formatHours(seconds) {
    return (seconds / 3600).toFixed(2);
}

async function generateTelemetryReport() {
    console.log('Initializing Node.js Telemetry Engine...');

    try {
        const totalMemMB = formatMB(os.totalmem());
        const freeMemMB = formatMB(os.freemem());
        const usedMemMB = (Number(totalMemMB) - Number(freeMemMB)).toFixed(2);
        const platform = os.platform();
        const arch = os.arch();
        const cpuModel = os.cpus()[0]?.model || 'Unknown';
        const uptimeHours = formatHours(os.uptime());
        const envData = await fetchEnvironmentData();

        console.log('==========================================');
        console.log('         SYSTEM & ENV TELEMETRY           ');
        console.log('==========================================');
        console.log(`${chalk.bold('OS Platform:')}      ${chalk.yellow(platform)}`);
        console.log(`${chalk.bold('CPU Arch:')}          ${chalk.cyan(arch)}`);
        console.log(`${chalk.bold('CPU Model:')}        ${chalk.magenta(cpuModel)}`);
        console.log(`${chalk.bold('Total Memory:')}     ${chalk.green(`${totalMemMB} MB`)}`);
        console.log(`${chalk.bold('Used Memory:')}      ${chalk.red(`${usedMemMB} MB`)}`);
        console.log(`${chalk.bold('Free Memory:')}      ${chalk.blue(`${freeMemMB} MB`)}`);
        console.log(`${chalk.bold('Uptime:')}           ${chalk.white(`${uptimeHours} hours`)}`);

        console.log('------------------------------------------');
        console.log(`${chalk.bold('Weather Temp:')}     ${chalk.green(`${envData.temperature_2m}°C`)}`);
        console.log(`${chalk.bold('Humidity:')}         ${chalk.cyan(`${envData.relative_humidity_2m}%`)}`);
        console.log(`${chalk.bold('Wind Speed:')}       ${chalk.yellow(`${envData.wind_speed_10m} km/h`)}`);

        const logEntry = `[${new Date().toISOString()}] PLATFORM: ${platform} | ARCH: ${arch} | CPU: ${cpuModel} | TOTALMEM: ${totalMemMB}MB | USEDMEM: ${usedMemMB}MB | FREEMEM: ${freeMemMB}MB | UPTIME: ${uptimeHours}h | TEMP: ${envData.temperature_2m}°C\n`;

        await fs.appendFile('telemetry.log', logEntry, 'utf8');
        console.log('Writing log entry to disk...');
        console.log('Telemetry audit completed successfully!');
    } catch (error) {
        console.error('Telemetry report generation failed:', error.message);
    }
}

generateTelemetryReport();
