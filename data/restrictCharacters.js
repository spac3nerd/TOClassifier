/*
    This program takes a list of one line converted files and cuts each line to a certain number of characters
If the last word is cut off, it will be replaced by spaces
If the length of the sentence is less than the minimum length, it becomes discarded
 */
let sources = [
    {
        source: "./data/obamaOneLiner.txt",
        out: "./data/obamaOneLinerReduced.txt",
        encoding: "utf-8"
    },
        {
        source: "./data/trumpOneLiner.txt",
        out: "./data/trumpOneLinerReduced.txt",
        encoding: "utf-8"
    }
];
let minLength = 15;

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
                if (line.length >= minLength) {
                    let tokens = line.split(" ");
                    let tempStr = "";
                    let k = 0;
                    while (tempStr.length < minLength) {
                        let checkStr = "";
                        if (tempStr.length === 0) {
                            checkStr = tokens[k];
                        }
                        else {
                            checkStr = tempStr + " " + tokens[k];
                        }

                        if (checkStr.length < minLength) {
                            tempStr = checkStr;
                            k++;
                        }
                        else {
                            //simple solution - just keep appending a space, the loop will take care of the rest
                            tempStr += " ";
                        }
                    }
                    w.write(tempStr + "\r\n");
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