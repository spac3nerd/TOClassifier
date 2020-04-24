/*
    This program takes a list of raw source files containing speeches and creates a formatted output which ensures
that each line of the output file contains only one sentence

 */
let sources = [
    {
        source: "./data/obamaRaw.txt",
        out: "./data/obamaOneLiner.txt",
        encoding: "utf-8"
    },
        {
        source: "./data/trumpRaw.txt",
        out: "./data/trumpOneLiner.txt",
        encoding: "utf-8"
    }
];

//import libs
let fs = require("fs");
let readline = require("readline");
let emptyLineRegEx = /^\s*$/;

function format(items) {
    //check if the outfile already, if so delete it
    fs.exists(items[items.length - 1].out, function(exists) {
        if (exists) {
            fs.unlinkSync(items[items.length - 1].out);
        }

        //continue processing
        let r = readline.createInterface({
            input: fs.createReadStream(items[items.length - 1].source, {encoding: items[items.length - 1].encoding}),
            console: false
         });

        let w = fs.createWriteStream(items[items.length - 1].out, {flags: 'a'});

        //called on every new line
        r.on("line", function(line, lineNum, bytes) {
            //if the line is not empty
            if (!emptyLineRegEx.test(line)) {
                //replace some characters
                line = line.replace(/"/g, "");
                line = line.replace(/”/g, "");
                line = line.replace(/“/g, "");
                line = line.replace(/---/g, "");
                line = line.replace(/--/g, " ");
                line = line.replace(/_/g, "");
                line = line.replace(/@/g, "");
                line = line.replace(/~/g, "");
                line = line.replace(/#/g, "");
                line = line.replace(/`/g, "");
                line = line.replace(/\*/g, "");
                line = line.replace(/—/g, ""); //it seems that this type of dash implies a filler as does '--'
                line = line.replace(/\[(.*?)\]/g, "");


                //fix some non-utf chars
                line = line.replace(/’/g, "'");


                let tokens = line.split(":").join(".").split("!").join(".").split("?").join(".")
                    .split(";").join(".").split(".");
                for (let k = 0; k < tokens.length; k++) {
                    //note the removal of leading and training spaces
                    //fs.writeFile(items[items.length - 1].out, tokens[k].trim(), () => {
                    //});
                    // console.log(tokens[k].trim());
                    if (!emptyLineRegEx.test(tokens[k])) {
                        if (tokens[k].trim().length > 2) {
                            //force to upper case
                            w.write(tokens[k].trim().toLowerCase() + "\r\n");
                        }
                    }
                }
            }
        });

        //called on end of file
        r.on("close", function() {
            console.log("Writing: " + items[items.length - 1].out + "\n");
            w.end();
            if (items.length > 1) {
                items.pop();
                //recursively call format again if there are left over items
                format(items);
            }
            else {
                console.log("\nDone!")
            }
        });
    });
}


format(sources);