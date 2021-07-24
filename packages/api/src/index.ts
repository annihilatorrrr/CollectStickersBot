import chalk from 'chalk';
import express from 'express';
import Redis from 'ioredis';

const app = express();
const port = 3000;

const redis = new Redis();

app.get('/statistics', async (_, res) => {
    const stickers = await redis.hgetall('stickers_usage');

    const rawCommands = await redis.hgetall('commands_usage');
    const commands: Record<string, number> = {};

    Object.entries(rawCommands).forEach(([key, value]) => commands[key] = Number.parseInt(value, 10));

    const statistics = {
        commands,

        usersCount: await redis.scard('users') ?? 0,
        stickers: {
            static: Number.parseInt(stickers['static'] ?? '0', 10),
            animated: Number.parseInt(stickers['animated'] ?? '0', 10),
            image: Number.parseInt(stickers['image'] ?? '0', 10),
        },
    };

    res.json(statistics);
});

async function main() {
    const info = chalk.blueBright;
    const ready = chalk.greenBright;

    console.info(info('> Connecting to database...'));
    await redis.ping();

    console.info(info('> Starting server...'));
    await new Promise<void>((resolve) => app.listen(port, resolve));

    console.info(ready(`> Ready and listening at http://127.0.0.1:${port}/ ✔`));
}

main().catch(console.error);