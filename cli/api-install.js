import chalk from 'chalk';
import prompt from 'prompt';
import Promise from 'bluebird';
import {exec} from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
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
        var self         = this,
            properties   = [
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
        prompt.message   = '';
        prompt.delimiter = '';

        prompt.start();

        prompt.get(properties, function (err, result) {
            if (err) {
                if (err.message !== 'canceled') {
                    console.log(err);
                } else {
                    console.log(chalk.red('User has cancelled.'));
                }

                process.exit(1);
            }

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
                    if (!error) {
                        console.log(chalk.green('- You have successfully installed new Scanhub API servers.'));
                        console.log(chalk.red('\t*** It is up to you to share the API across your networks.'));
                        console.log('- The set up folder is located at ' + chalk.green(path.resolve(targetPath)));
                        console.log('- The API server is located at ' + chalk.blue('http://localhost:' + self.program.port + '/api/1.0'));
                        console.log('- Please follow the documents to know how to manage docker containers: ' + chalk.blue('https://docs.docker.com/'));
                        console.log('- To initialize API server, please enter "api" container and run:' + chalk.green('scanhub api:init'));
                        console.log('- For more information, please take a look to our document at ' + chalk.blue('http://scanhub.io/documents/scanhub_api_1.0_manual.pdf'));
                    }
                    process.exit(0);
                });

            res.stdout.on('data', function (data) {
                console.log(data);
            });
            res.stderr.on('data', function (data) {
                console.log(chalk.red(data));
            })
        });
    }
}


module.exports = ApiConfigurationCommand;
