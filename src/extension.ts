import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

// Funzione universale per riprodurre il suono
function playSelectedSound(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('apro-vsc');
    const selectedSound = config.get<string>('selectSound') || 'startup1.mp3';
    let soundPath = path.join(context.extensionPath, 'dist', 'assets', selectedSound);

    if (process.platform === 'win32') {
        soundPath = soundPath.replace(/\//g, '\\');
    }

    let command = '';
    if (process.platform === 'win32') {
        command = `powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Add-Type -AssemblyName PresentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open('${soundPath}'); $m.Play(); Start-Sleep -s 5"`;
    } else if (process.platform === 'darwin') {
        command = `afplay "${soundPath}"`;
    } else {
        command = `paplay "${soundPath}" || mpg123 "${soundPath}"`;
    }

    if (command) exec(command);
}

export function activate(context: vscode.ExtensionContext) {
    // 1. Riproduci all'avvio
    playSelectedSound(context);

    // 2. Registra il comando per il test manuale
    let testCommand = vscode.commands.registerCommand('apro-vsc.testSound', () => {
        playSelectedSound(context);
        vscode.window.showInformationMessage('Riproduzione del suono di test...');
    });

    context.subscriptions.push(testCommand);

    // 3. Opzionale: Crea un pulsante nella barra di stato in basso
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'apro-vsc.testSound';
    statusBarItem.text = `$(play) Test Sound`;
    statusBarItem.tooltip = 'Clicca per provare il suono di avvio selezionato';
    statusBarItem.show();
    
    context.subscriptions.push(statusBarItem);
}

export function deactivate() {}