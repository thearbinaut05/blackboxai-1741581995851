const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Main withdrawal page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/withdraw.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Withdrawal interface running at http://localhost:${port}`);
    console.log('\nInstructions:');
    console.log('1. Connect your wallet using MetaMask');
    console.log('2. Review your available profits');
    console.log('3. Click Withdraw to claim your earnings');
});
