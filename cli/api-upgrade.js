import chalk from 'chalk';
import {exec} from 'child_process';
import util from 'util';
import path from 'path';
import os from 'os';

class ApiUpgradeCommand {
    static command = {
        name       : 'api:upgrade',
        description: 'Upgrade Scanhub\'s API',
        options    : [
            {
                name        : '-m --docker-machine <machine>',
                description : 'The docker machine name, defaults to "scanhub"',
                defaultValue: 'scanhub'
            },
            {
                name        : '-c --docker-container <container>',
                description : 'The docker container ID or Name'
            },
            {
                name        : '-d --working-directory <directory>',
                description : 'The working directory of scanhub API, defaults to "/src/app"',
                defaultValue: '/src/app'
            }
        ]
    };

    constructor (program) {
        this.program = program;
    }

    async action () {
        var machine = this.program.machine || this.program.dockerMachine,
            container = this.program.container || this.program.dockerContainer,
            directory = this.program.directory || this.program.workingDirectory;

        if (!container) {
            console.error(chalk.red('Please specify docker container that is pointing to scanhub/api'))
            process.exit(1);
        }
        var isWin             = /^win/.test(os.platform());

        var command = 'sh ' + path.join(__dirname, 'cli/upgraders/linux.sh');
        if (isWin) {
            command = path.join(__dirname, 'cli/upgraders/windows.bat');
        }

        command += util.format(' %s %s %s', machine, container, directory);
        var res = exec(command, // command line argument directly in string
            function (error, stdout, stderr) {      // one easy function to capture data/errors
                if (!error) {
                    console.log(chalk.green('Upgrade successful.'));
                } else {
                    console.log(chalk.red(error));
                }
                process.exit(0);
            });

        res.stdout.on('data', function (data) {
            console.log(data);
        });
        res.stderr.on('data', function (data) {
            console.log(chalk.red(data));
        })
    }
}


module.exports = ApiUpgradeCommand;
