class CommandTool {
    options = null;

    constructor(options) {
        this.options = options || {};
    }

    static tools() {
        return [
            require.context('../', false, /\.js$/)
        ];
    }

    /**
     * @param program
     */
    register(program) {
        var tools = CommandTool.tools();
        tools.forEach((ctx) => {
            ctx
                .keys()
                .forEach((key) => {
                    if (/index\.js/.test(key)) {
                        return;
                    }
                    
                    var Command = ctx(key);
                    var cmd     = program
                        .command(Command.command.name)
                        .description(Command.command.description);

                    if (Command.command.alias) {
                        cmd.alias(Command.command.alias);
                    }

                    Command.command.options.forEach((option) => {
                        cmd.option(option.name, option.description, option.defaultValue || '');
                    });

                    cmd.action(async() => {
                        try {
                            var command = new Command(cmd);
                            await command.action();
                        } catch (ex) {
                            console.error(ex)
                        }
                    });
                });
        });
    }
}

module.exports = CommandTool;

