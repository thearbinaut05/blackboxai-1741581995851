const puppeteer = require('puppeteer');
const express = require('express');
const open = require('open');
const app = express();
const port = 3333;

// Setup express server for callback
app.get('/callback', (req, res) => {
    const { provider, key } = req.query;
    if (key) {
        console.log(`\n✅ Successfully got API key from ${provider}!`);
        console.log(`API Key: ${key}`);
        res.send('You can close this window and return to the terminal.');
    } else {
        res.status(400).send('No API key received');
    }
});

async function getAlchemyKey() {
    console.log('\n🔄 Getting Alchemy API key...');
    console.log('1. Opening Alchemy signup page...');
    await open('https://auth.alchemy.com/signup?redirectUrl=https://dashboard.alchemy.com/signup-redirect');
    console.log('2. Complete signup and create an app named "CryptoMiner"');
    console.log('3. Copy the API key from your dashboard');
    return await promptForKey('Alchemy');
}

async function getInfuraKey() {
    console.log('\n🔄 Getting Infura API key...');
    console.log('1. Opening Infura signup page...');
    await open('https://app.infura.io/register');
    console.log('2. Complete signup and create a new project named "CryptoMiner"');
    console.log('3. Copy the Project ID from your project settings');
    return await promptForKey('Infura');
}

async function getQuickNodeKey() {
    console.log('\n🔄 Getting QuickNode API key...');
    console.log('1. Opening QuickNode signup page...');
    await open('https://www.quicknode.com/signup');
    console.log('2. Complete signup and create an endpoint for Ethereum mainnet');
    console.log('3. Copy the HTTP Provider URL');
    return await promptForKey('QuickNode');
}

async function promptForKey(provider) {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question(`\nEnter your ${provider} API key: `, (key) => {
            readline.close();
            resolve(key);
        });
    });
}

async function main() {
    console.clear();
    console.log('🚀 Welcome to the Crypto Miner API Key Setup!\n');
    console.log('This script will help you get API keys from major providers.\n');
    console.log('Choose a provider to get started:');
    console.log('1. Alchemy (Recommended)');
    console.log('2. Infura');
    console.log('3. QuickNode');
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise((resolve) => {
        readline.question('\nEnter your choice (1-3): ', (choice) => {
            readline.close();
            resolve(choice);
        });
    });

    let key;
    switch (answer) {
        case '1':
            key = await getAlchemyKey();
            if (key) {
                return {
                    provider: 'Alchemy',
                    url: `https://eth-mainnet.alchemyapi.io/v2/${key}`
                };
            }
            break;
        case '2':
            key = await getInfuraKey();
            if (key) {
                return {
                    provider: 'Infura',
                    url: `https://mainnet.infura.io/v3/${key}`
                };
            }
            break;
        case '3':
            key = await getQuickNodeKey();
            if (key) {
                return {
                    provider: 'QuickNode',
                    url: key // QuickNode provides full URL
                };
            }
            break;
        default:
            console.log('Invalid choice');
            process.exit(1);
    }
}

// Start the setup process
main().then(result => {
    if (result) {
        console.log('\n✨ Setup Complete!');
        console.log('\nTo start mining with your new API key, run:');
        console.log(`\nNODE_URL=${result.url} npm start\n`);
        
        // Save to .env file
        const fs = require('fs');
        fs.writeFileSync('.env', `NODE_URL=${result.url}\n`);
        console.log('API key has been saved to .env file\n');
    }
}).catch(error => {
    console.error('Error during setup:', error);
    process.exit(1);
});
