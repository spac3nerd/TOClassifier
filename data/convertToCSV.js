/*
    This program combines multiple reduced one liner files into one CSV file. The first column is the label, and the
second column is the actual text
 */
let sources = [
    {
        source: "./data/obamaOneLinerReduced.txt",
        label: 0, //very important - this is the label which will be used by the model
        encoding: "utf-8"
    },
        {
        source: "./data/trumpOneLinerReduced.txt",
        label: 1, //very important - this is the label which will be used by the model
        encoding: "utf-8"
    }
];

let outputFile = "data/data.csv";
let emptyLineRegEx = /^\s*$/;
let rows = [];

//import libs
let fs = require("fs");
let readline = require("readline");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
        {id: 'label', title: 'LABEL'},
        {id: 'text', title: 'TEXT'}
    ]
});

function format(items) {
    //check if the outfile already, if so delete it
    fs.exists(outputFile, function(exists) {
        if (exists) {
            fs.unlinkSync(outputFile);
        }

        //continue processing
        let r = readline.createInterface({
            input: fs.createReadStream(items[items.length - 1].source, {encoding: items[items.length - 1].encoding}),
            console: false
         });

        //called on every new line
        r.on("line", function(line, lineNum, bytes) {
            //a redundant check since we've done it in the previous step, but it doesn't hurt
            if (!emptyLineRegEx.test(line)) {
                rows.push({label: items[items.length - 1].label,  text: line});
            }
        });

        //called on end of file
        r.on("close", function() {
            if (items.length > 1) {
                items.pop();
                //recursively call format again if there are left over items
                format(items);
            }
            else {
                console.log("Writing: " + outputFile + "\n");
                csvWriter.writeRecords(rows).then(() => {
                        console.log("\nDone!")
                    });
            }
        });
    });



}

format(sources);