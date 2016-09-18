var program      = require('commander');

try {

    var CommandTool = require('./tools'),
        tool        = new CommandTool({});

    tool.register(program);

    if (process.argv.length < 3) {
        program.help();
    }

    program.parse(process.argv);
} catch (ex) {

    console.error(ex);
    //show help again
    program.help();
}


