/*
https://stackoverflow.com/questions/10179114/execute-powershell-script-from-node-js
*/

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Readable } from 'stream';
import * as vscode from 'vscode';
import { SfUtility } from './sfUtility';
import { get } from 'http';

export class SfPs {
    private out: string[] = [];
    private err: string[] = [];
    private pwsh = 'pwsh.exe';
    private powershell = 'powershell.exe';
    private ps = this.powershell;// required for sf scripts to work .net 4.7.2
    private psSession: ChildProcessWithoutNullStreams | undefined = undefined;

    constructor() {
        SfUtility.outputLog(`sfPs constructor: ${vscode.version}`);
        this.isPwshInstalled();
        //this.init();
    }

    destroy(): void {
        SfUtility.outputLog(`sfPs destroy: ${vscode.version}`);
        this.psSession?.kill();
    }

    public async getPemFromLocalCertStore(thumbprint: string, password?: string, searchSubject = false): Promise<string> {
        let getItem = `get-item 'cert:\\CurrentUser\\My\\${thumbprint}'`;

        if (searchSubject) {
            getItem = `get-item 'cert:\\CurrentUser\\My\\* | where-item Subject -imatch ${thumbprint}'`;
        }

        const command = `
        $cert = ${getItem};
        $bytes = $cert.GetRawCertData();
        write-output '-----BEGIN CERTIFICATE-----';
        write-output ([convert]::ToBase64String($bytes));
        write-output '-----END CERTIFICATE-----';
        `;

        return await this.send(command); //.replace(/(\n|^\s+|\s+$)/gm,''));
    }

    // public async getCertFromHttpEndpoint(httpEndpoint: string): Promise<string> {
    //     return new Promise<string>();
    // }

    private isPwshInstalled(): Promise<boolean> {
        return this.sendOnce(this.pwsh, ['$PSVersionTable.PSVersion.Major']).then((result) => {
            SfUtility.outputLog(`pwsh installed:sfPs using: ${this.ps}`);
            return true;
        }).catch((err) => {
            SfUtility.outputLog(`powershell installed:sfPs using: ${this.ps}`);
            return false;
        });
    }

    public async init(): Promise<void> {
        //if (this.psSession === undefined) {
        SfUtility.outputLog(`sfPs init using: ${this.ps}`);
        await this.session().then((session) => {
            this.psSession = session;
        }).catch((err) => {
            SfUtility.outputLog(`sfPs init error: ${err}`);
        });
        //}
    }

    public async sendOnce(ps: string = this.ps, commands: string[], jsonDepth = 2, end = true): Promise<string[]> {
        const promise = new Promise<string[]>((resolve, reject) => {
            //const results: any[] = [];
            const out: string[] = [];
            const err: string[] = [];
            const child = spawn(ps, ['-ExecutionPolicy', 'RemoteSigned', '-Command', '-']);

            child.stdin.setDefaultEncoding('utf-8');
            child.stdout.setEncoding('utf-8');

            child.stdout.on('data', function (data) {
                //out.push(data.toString());
                resolve([data.toString() + '\n']);
            });
            child.stderr.on('data', function (data) {
                err.push(data.toString());
                reject([data.toString() + '\n']);
            });
            child.on('exit', function (code, signal) {
                SfUtility.outputLog(`sfPs send close: ${code} ${signal}`);
                //results.push({ command: commands, output: out, errors: err });
                //resolve(out);
            });

            commands.forEach(function (cmd) {
                const command = `convertto-json -inputobject "[$(${cmd})]" -depth ${jsonDepth} -compress`;
                SfUtility.outputLog(`sfPs send command: ${command}`);
                child.stdin.write(command + '\n');
            });

            if (end) {
                child.stdin.end();
            }
        });
        return promise;
    }

    public async send(command: string, jsonDepth = 2): Promise<string> {
        if (this.psSession === undefined || this.psSession?.killed) {
            await this.init();
        }

        SfUtility.outputLog(`send:command:${command}`);
        const compressedCommand = command.replace(/(\n|^\s+|\s+$)/gm,'');
        const promise = new Promise<string>((resolve, reject) => {
            //const results: any[] = [];
            //const out: string[] = [];
            // const err: string[] = [];

            this.psSession?.stdin.setDefaultEncoding('utf-8');
            this.psSession?.stdout.setEncoding('utf-8');

            this.psSession?.stdout.on('data', function (data) {
                //out.push(data.toString());
                //resolve([data.toString() + '\n']);
                resolve(data.toString());
                //resolve(JSON.stringify(JSON.parse(data.toString().result)));
            });
            this.psSession?.stderr.on('data', function (data) {
                // err.push(data.toString());
                reject([data.toString() + '\n']);
            });
            this.psSession?.stdout.on('close', function () {
                SfUtility.outputLog(`sfPs send close:`);
                //  resolve(out.join(''));
            });
            // this.psSession?.stdout.on('readable', function () {
            //     SFUtility.outputLog(`sfPs send readable:`);
            // });
            this.psSession?.stdout.on('pause', function () {
                SfUtility.outputLog(`sfPs send pause:`);
            });
            this.psSession?.stdout.on('resume', function () {
                SfUtility.outputLog(`sfPs send resume:`);
            });
            this.psSession?.stdout.on('end', function () {
                SfUtility.outputLog(`sfPs send end:`);
                //resolve(out.join(''));
            });
            this.psSession?.stdout.on('error', function (data) {
                SfUtility.outputLog(`sfPs send error: ${data}`);
            });

            // this.psSession?.on('exit', function (code, signal) {
            //     SFUtility.outputLog(`sfPs send close: ${code} ${signal}`);
            //     //results.push({ command: commands, output: out, errors: err });
            //     //resolve(out);
            // });

            const cmd = `convertto-json -inputobject @{result=(invoke-command -scriptblock {${compressedCommand}})} -depth ${jsonDepth} -compress`;
            SfUtility.outputLog(`sfPs send command: ${cmd}`);
            this.psSession?.stdin.write(cmd + '\n');
        });
        return promise;
    }

    public async session(): Promise<ChildProcessWithoutNullStreams> {
        const promise = new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
            //const results: any[] = [];
            // const out: string[] = [];
            // const err: string[] = [];
            const child = spawn(this.ps, ['-ExecutionPolicy', 'RemoteSigned', '-Command', '-']);

            child.stdin.setDefaultEncoding('utf-8');
            child.stdout.setEncoding('utf-8');

            child.stdout.on('data', function (data) {
                // out.push(data.toString());
                //resolve([data.toString() + '\n']);
            });
            child.stderr.on('data', function (data) {
                // err.push(data.toString());
                reject([data.toString() + '\n']);
            });
            child.on('exit', function (code, signal) {
                SfUtility.outputLog(`sfPs send close: ${code} ${signal}`);
                //results.push({ command: commands, output: out, errors: err });
                //resolve(out);
            });
            child.on('spawn', function () {
                SfUtility.outputLog(`sfPs send spawn: ${child.pid}`);
                resolve(child);
            });
        });
        return promise;
    }
}

//module.exports = sfPs;