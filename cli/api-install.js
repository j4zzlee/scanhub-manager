import chalk from 'chalk';
import prompt from 'prompt';
import Promise from 'bluebird';
import {exec} from 'child_process';
import fs from 'fs';
import os from 'os';
import PortManager from '../libs/net';
Promise.promisifyAll(prompt);

class ApiConfigurationCommand {
    static command = {
        name       : 'api:install',
        description: 'Install Scanhub\'s API from DockerHub',
        options    : [
            {
                name        : '-p --port <port>',
                description : 'The API port, defaults to 3000',
                defaultValue: 3000
            },
            {
                name        : '-f --force',
                description : 'Force remove and re-create Docker Machine',
                defaultValue: false
            }
        ]
    };

    constructor (program) {
        this.program = program;
    }


    async action () {
        var self        = this,
            portManager = new PortManager(this.program.port),
            properties  = [
                {
                    name       : 'mysql_root_password',
                    description: chalk.green('Enter Mysql Root Password, defaults to "P@ssword123":'),
                    hidden     : true,
                    replace    : '*',
                    default    : 'P@ssword123'
                },
                {
                    name       : 'mysql_password',
                    description: chalk.green('Enter Mysql Password, defaults to "P@ssword123":'),
                    hidden     : true,
                    replace    : '*',
                    default    : 'P@ssword123'
                }
            ];
        portManager.isInUse((res) => {
            if (res) {
                console.log(chalk.red('The requested port number: ' + this.program.port + ', is not available.'));
                process.exit(1);
                return;
            }

            prompt.message   = '';
            prompt.delimiter = '';

            prompt.start();

            prompt.get(properties, function (err, result) {
                var mysqlRootPassword = result.mysql_root_password,
                    mysqlPassword     = result.mysql_password,
                    isWin             = /^win/.test(os.platform()),
                    force             = !!self.program.force,
                    targetPath        = './scanhub',
                    envFile           = './cli/installers/env.dist',
                    dockerFile        = './cli/installers/docker-compose.prod.yml';

                if (!fs.existsSync(targetPath)) {
                    fs.mkdirSync(targetPath);
                }

                var envFileContent = fs.readFileSync(envFile, 'utf8');
                envFileContent     = envFileContent.replace('{MYSQL_ROOT_PASSWORD}', mysqlRootPassword);
                envFileContent     = envFileContent.replace('{MYSQL_PASSWORD}', mysqlPassword);
                envFileContent     = envFileContent.replace('{NODE_PORT}', self.program.port);
                fs.writeFileSync(targetPath + '/.env', envFileContent);
                fs.writeFileSync(targetPath + '/docker-compose.yml', fs.readFileSync(dockerFile));

                var command = 'sh ./cli/installers/linux.sh';
                if (isWin) {
                    command = './cli/installers/windows.bat';
                }

                if (force) {
                    command += ' --force';
                }

                command += ' ' + targetPath;
                command += ' ' + self.program.port;
                var res = exec(command, // command line argument directly in string
                    function (error, stdout, stderr) {      // one easy function to capture data/errors
                        if (error || stderr) {
                            console.log(chalk.red(stdout));
                        } else {
                            console.log(stdout);
                        }

                        process.exit(0);
                    });

                res.stdout.on('data', function(data) {
                    console.log(data);
                });
            });
        });
    }
}


module.exports = ApiConfigurationCommand;
