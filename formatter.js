const fs = require('fs');
const readline = require('readline');

function formatDate(date) {
    const pad = (num) => (num < 10 ? '0' + num : num);
    return date.getFullYear() + '-' +
           pad(date.getMonth() + 1) + '-' +
           pad(date.getDate()) + 'T' +
           pad(date.getHours()) + ':' +
           pad(date.getMinutes()) + ':' +
           pad(date.getSeconds()) + ' JST';
}

function formatFile(filePath, lastUpdateDateTimeTag) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineNo = 0;
        let formattedText = '';

        // 現在時刻の取得とフォーマット
        const now = new Date();
        const jstOffset = 9 * 60; // JSTはUTC+9
        now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + jstOffset);
        const formattedDate = formatDate(now);

        rl.on('line', (line) => {
            // ここで各行を加工する
            let processedLine = '';
            let originalLine = line;
    
            if (/^[0-9]/.test(line)) {
                if (/^[0-9]+\s+\.\s*[^\s]/.test(line)) {
                    processedLine += `${lineNo.toString().padStart(4, '0')}   .`;
                } else {
                    processedLine += `${lineNo.toString().padStart(4, '0')}    `;
                }
                lineNo++;
    
                originalLine = originalLine.replace(/^[0-9]+\s+\.\s*/, '');
                originalLine = originalLine.replace(/^[0-9]+\s*/, '');
    
                // 時刻フォーマット
                if (originalLine.startsWith(lastUpdateDateTimeTag)) {
                    const regex = new RegExp(lastUpdateDateTimeTag + ".*");
                    originalLine = originalLine.replace(regex, lastUpdateDateTimeTag + ' ' + formattedDate);
                }
                if (!(/^\s*#/.test(originalLine))) {
                    originalLine = originalLine.replace(/\s+/g, ' ');
                }
                if (!(/^,/.test(originalLine)) && !(/^&/.test(originalLine))) {
                    originalLine = ' ' + originalLine;
                }
            }
            processedLine += originalLine + '\n';
            formattedText += processedLine;
    
        });

        rl.on('close', () => {
            resolve(formattedText); // 全ての行を加工し終えたら、加工後のテキストを返す
        });

        rl.on('error', (error) => {
            reject(error); // エラーが発生した場合はreject
        });
    });
}

module.exports = { formatFile };
