const vscode = require('vscode');
const formatter = require('./formatter'); // formatter.js のインポート

function activate(context) {
    let disposable = vscode.commands.registerCommand('cps-formatter.format', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // アクティブなエディタがない場合は何もしない
        }
        const document = editor.document;
        const filePath = document.fileName;

        formatter.formatFile(filePath) // formatter.js の関数を呼び出し
            .then(formattedText => {
                // 成功時の処理（エディタの内容を置き換えるなど）
                return editor.edit(editBuilder => {
                    const entireRange = new vscode.Range(
                        document.lineAt(0).range.start,
                        document.lineAt(document.lineCount - 1).range.end
                    );
                    editBuilder.replace(entireRange, formattedText);
                });
            })
            .catch(error => {
                // エラー処理
                vscode.window.showErrorMessage('Formatting failed: ' + error.message);
            });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
