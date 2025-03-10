const ethers = require('ethers');
const config = require('../config');

async function withdrawFunds() {
    try {
        console.log('Starting withdrawal process...');
        
        // Get node URL from environment or use default
        const nodeUrl = process.env.NODE_URL || 'http://localhost:8545';
        console.log('Connecting to node:', nodeUrl);
        
        // Connect to provider
        const provider = new ethers.providers.JsonRpcProvider(nodeUrl);
        
        // Get wallet from private key
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY environment variable not set');
        }
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Get withdrawal address from environment or use wallet address
        const withdrawalAddress = process.env.WITHDRAWAL_ADDRESS || wallet.address;
        console.log('Withdrawal address:', withdrawalAddress);
        
        // Get current balance
        const balance = await provider.getBalance(wallet.address);
        console.log('Current balance:', ethers.utils.formatEther(balance), 'ETH');
        
        // Get current gas price
        const gasPrice = await provider.getGasPrice();
        console.log('Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
        
        // Calculate gas cost for transfer
        const gasLimit = 21000; // Standard ETH transfer
        const gasCost = gasPrice.mul(gasLimit);
        console.log('Estimated gas cost:', ethers.utils.formatEther(gasCost), 'ETH');
        
        // Calculate amount to withdraw (balance - gas cost)
        const withdrawAmount = balance.sub(gasCost);
        
        if (withdrawAmount.lte(0)) {
            throw new Error('Insufficient balance to cover gas costs');
        }
        
        console.log('Amount to withdraw:', ethers.utils.formatEther(withdrawAmount), 'ETH');
        
        // Create transaction
        const tx = {
            to: withdrawalAddress,
            value: withdrawAmount,
            gasPrice: gasPrice,
            gasLimit: gasLimit
        };
        
        // Confirm withdrawal
        console.log('\nPlease confirm withdrawal:');
        console.log('- From:', wallet.address);
        console.log('- To:', withdrawalAddress);
        console.log('- Amount:', ethers.utils.formatEther(withdrawAmount), 'ETH');
        console.log('- Gas cost:', ethers.utils.formatEther(gasCost), 'ETH');
        console.log('\nSending transaction...');
        
        // Send transaction
        const transaction = await wallet.sendTransaction(tx);
        console.log('Transaction sent:', transaction.hash);
        
        // Wait for confirmation
        console.log('Waiting for confirmation...');
        const receipt = await transaction.wait();
        
        console.log('\nWithdrawal successful!');
        console.log('Transaction hash:', receipt.transactionHash);
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        
        // Calculate final amounts
        const actualGasCost = receipt.gasUsed.mul(gasPrice);
        console.log('\nFinal summary:');
        console.log('- Amount withdrawn:', ethers.utils.formatEther(withdrawAmount), 'ETH');
        console.log('- Actual gas cost:', ethers.utils.formatEther(actualGasCost), 'ETH');
        console.log('- Total deducted:', ethers.utils.formatEther(withdrawAmount.add(actualGasCost)), 'ETH');
        
        // Verify new balance
        const newBalance = await provider.getBalance(wallet.address);
        console.log('New balance:', ethers.utils.formatEther(newBalance), 'ETH');
        
    } catch (error) {
        console.error('Error during withdrawal:', error);
        process.exit(1);
    }
}

// Execute withdrawal
withdrawFunds().then(() => {
    console.log('Withdrawal process completed');
    process.exit(0);
}).catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
