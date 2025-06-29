const { exec } = require('child_process');
const readline = require('readline');

class DevCTOChat {
    constructor() {
        this.isRunning = false;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.conversationHistory = [];
    }

    // Copy text to clipboard (macOS)
    async copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            const process = exec(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    // Get text from clipboard (macOS)
    async getFromClipboard() {
        return new Promise((resolve, reject) => {
            exec('pbpaste', (error, stdout) => {
                if (error) reject(error);
                else resolve(stdout.trim());
            });
        });
    }

    // Wait for user to copy response
    async waitForResponse() {
        return new Promise((resolve) => {
            console.log('📋 Copy the response to clipboard, then press Enter...');
            this.rl.question('', () => {
                resolve();
            });
        });
    }

    async startProject() {
        console.log('🚀 Starting Dev-CTO Project Chat');
        console.log('You are the Senior Developer');
        console.log('Gemini is the CTO');
        console.log('\nInstructions:');
        console.log('1. Keep Gemini chat open');
        console.log('2. This script will help you copy responses back and forth');
        console.log('3. Start with your project request\n');

        this.isRunning = true;
        let turnCount = 0;

        while (this.isRunning) {
            turnCount++;
            console.log(`\n🔄 Turn ${turnCount}`);
            
            if (turnCount === 1) {
                // First turn - Dev sends initial request
                console.log('👨‍💻 DEV: Type your project request in Gemini chat, then copy Gemini\'s response...');
                await this.waitForResponse();
                const ctoResponse = await this.getFromClipboard();
                console.log(`👔 CTO Response: ${ctoResponse.substring(0, 150)}...`);
                this.conversationHistory.push({ role: 'cto', content: ctoResponse });
                
                // Dev responds to CTO
                console.log('\n👨‍💻 DEV: Now respond to the CTO\'s plan...');
                console.log('Type your response in Gemini chat, then copy it...');
                await this.waitForResponse();
                const devResponse = await this.getFromClipboard();
                console.log(`👨‍💻 DEV Response: ${devResponse.substring(0, 150)}...`);
                this.conversationHistory.push({ role: 'dev', content: devResponse });
                
            } else {
                // Continue conversation
                console.log('👔 CTO: Waiting for CTO response...');
                await this.waitForResponse();
                const ctoResponse = await this.getFromClipboard();
                console.log(`👔 CTO Response: ${ctoResponse.substring(0, 150)}...`);
                this.conversationHistory.push({ role: 'cto', content: ctoResponse });
                
                // Dev responds
                console.log('\n👨‍💻 DEV: Respond to the CTO...');
                console.log('Type your response in Gemini chat, then copy it...');
                await this.waitForResponse();
                const devResponse = await this.getFromClipboard();
                console.log(`👨‍💻 DEV Response: ${devResponse.substring(0, 150)}...`);
                this.conversationHistory.push({ role: 'dev', content: devResponse });
            }

            // Ask if user wants to continue
            this.rl.question('\nContinue conversation? (y/n): ', (answer) => {
                if (answer.toLowerCase() !== 'y') {
                    this.isRunning = false;
                    this.rl.close();
                    console.log('👋 Project chat ended!');
                    console.log(`📊 Total exchanges: ${this.conversationHistory.length}`);
                }
            });
        }
    }

    stop() {
        this.isRunning = false;
        this.rl.close();
        console.log('🛑 Chat stopped.');
    }

    getHistory() {
        return this.conversationHistory;
    }
}

// Main function
async function main() {
    const chat = new DevCTOChat();
    
    console.log('🎯 Dev-CTO Project Chat Assistant');
    console.log('You = Senior Developer | Gemini = CTO\n');
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        chat.stop();
        process.exit(0);
    });

    await chat.startProject();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DevCTOChat; 