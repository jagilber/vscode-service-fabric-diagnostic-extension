/*
https://stackoverflow.com/questions/10179114/execute-powershell-script-from-node-js
*/

import { spawn } from 'child_process';
import { Readable } from 'stream';
import * as vscode from 'vscode';
import { SFUtility } from './sfUtility';

export class SFPs {
    private out: string[] = [];
    private err: string[] = [];
    private pwsh = 'pwsh.exe';
    private powershell = 'powershell.exe';
    private ps = this.pwsh;


    constructor() {
        SFUtility.outputLog(`sfPs constructor: ${vscode.version}`);
        this.isPwshInstalled();
        this.init();
    }

    private isPwshInstalled(): Promise<boolean> {
        return this.send(['$PSVersionTable.PSVersion.Major']).then((result) => {
            this.ps = this.pwsh;
            SFUtility.outputLog(`sfPs using: ${this.ps}`);
            return true;
        }).catch((err) => {
            this.ps = this.powershell;
            SFUtility.outputLog(`sfPs using: ${this.ps}`);
            return false;
        });
    }

    private async init(): Promise<void> {
        SFUtility.outputLog(`sfPs init using: ${this.ps}`);
    }

    public async send(commands: string[], jsonDepth = 2): Promise<string[]> {
        const promise = new Promise<string[]>((resolve, reject) => {
            //const results: any[] = [];
            const out: string[] = [];
            const err: string[] = [];
            const child = spawn(this.ps, ['-Command', '-']);

            child.stdin.setDefaultEncoding('utf-8');
            child.stdout.setEncoding('utf-8');

            child.stdout.on('data', function (data) {
                out.push(data.toString());
                //resolve([data.toString() + '\n']);
            });
            child.stderr.on('data', function (data) {
                err.push(data.toString());
                reject([data.toString() + '\n']);
            });
            child.on('exit', function (code, signal) {
                SFUtility.outputLog(`sfPs send close: ${code} ${signal}`);
                //results.push({ command: commands, output: out, errors: err });
                resolve(out);
            });

            commands.forEach(function (cmd) {
                const command = `convertto-json -inputobject (${cmd}) -depth ${jsonDepth} -compress`;
                SFUtility.outputLog(`sfPs send command: ${command}`);
                child.stdin.write(command + '\n');

            });

            child.stdin.end();
        });
        return promise;
    }
}

//module.exports = sfPs;