/*
https://stackoverflow.com/questions/10179114/execute-powershell-script-from-node-js
*/

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Readable } from 'stream';
import * as vscode from 'vscode';
import { SFUtility } from './sfUtility';

export class SFPs {
    private out: string[] = [];
    private err: string[] = [];
    private pwsh = 'pwsh.exe';
    private powershell = 'powershell.exe'; 
    private ps = this.powershell;// required for sf scripts to work .net 4.7.2
    private psSession: ChildProcessWithoutNullStreams | undefined = undefined;

    constructor() {
        SFUtility.outputLog(`sfPs constructor: ${vscode.version}`);
        this.isPwshInstalled();
        //this.init();
    }

    destroy(): void {
        SFUtility.outputLog(`sfPs destroy: ${vscode.version}`);
        this.psSession?.kill();
    }

    private isPwshInstalled(): Promise<boolean> {
        return this.sendOnce(this.pwsh,['$PSVersionTable.PSVersion.Major']).then((result) => {
            SFUtility.outputLog(`pwsh installed:sfPs using: ${this.ps}`);
            return true;
        }).catch((err) => {
            SFUtility.outputLog(`powershell installed:sfPs using: ${this.ps}`);
            return false;
        });
    }

    public async init(): Promise<void> {
        //if (this.psSession === undefined) {
        SFUtility.outputLog(`sfPs init using: ${this.ps}`);
        await this.session().then((session) => {
            this.psSession = session;
        }).catch((err) => {
            SFUtility.outputLog(`sfPs init error: ${err}`);
        });
        //}
    }

    public async sendOnce(ps:string = this.ps, commands: string[], jsonDepth = 2, end = true): Promise<string[]> {
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
                SFUtility.outputLog(`sfPs send close: ${code} ${signal}`);
                //results.push({ command: commands, output: out, errors: err });
                //resolve(out);
            });

            commands.forEach(function (cmd) {
                const command = `convertto-json -inputobject "[$(${cmd})]" -depth ${jsonDepth} -compress`;
                SFUtility.outputLog(`sfPs send command: ${command}`);
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
                SFUtility.outputLog(`sfPs send close:`);
                //  resolve(out.join(''));
            });
            // this.psSession?.stdout.on('readable', function () {
            //     SFUtility.outputLog(`sfPs send readable:`);
            // });
            this.psSession?.stdout.on('pause', function () {
                SFUtility.outputLog(`sfPs send pause:`);
            });
            this.psSession?.stdout.on('resume', function () {
                SFUtility.outputLog(`sfPs send resume:`);
            });
            this.psSession?.stdout.on('end', function () {
                SFUtility.outputLog(`sfPs send end:`);
                //resolve(out.join(''));
            });
            this.psSession?.stdout.on('error', function (data) {
                SFUtility.outputLog(`sfPs send error: ${data}`);
            });

            // this.psSession?.on('exit', function (code, signal) {
            //     SFUtility.outputLog(`sfPs send close: ${code} ${signal}`);
            //     //results.push({ command: commands, output: out, errors: err });
            //     //resolve(out);
            // });

            const cmd = `convertto-json -inputobject @{result=(${command})} -depth ${jsonDepth} -compress`;
            SFUtility.outputLog(`sfPs send command: ${cmd}`);
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
                SFUtility.outputLog(`sfPs send close: ${code} ${signal}`);
                //results.push({ command: commands, output: out, errors: err });
                //resolve(out);
            });
            child.on('spawn', function () {
                SFUtility.outputLog(`sfPs send spawn: ${child.pid}`);
                resolve(child);
            });
        });
        return promise;
    }
}

//module.exports = sfPs;