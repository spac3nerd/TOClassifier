## TOClassifier
Welcome, this is my attempt at a text classifier using CNNs

#### Required software

Node.js (https://nodejs.org/en/)

To build the prerequisite node project, run the following in the root of the project:
```
npm install
```

You don't necessarily have to generate new datasets, but if you modify the raw data, you must run the following scripts in this order:

1. convertOneLine.js
2. restrictCharacters.js
3. convertToCSV.js

Note that you may perform the necessary changes to paramters directly in those scripts. You may also invoke them directly 
or via npm (see package.json aliases).

Finally, ensure you have all of the prerequisite Python libraries installed, and simply run:

```
python TOClassifier.py
``` 

All of the parameters are available at the top of TOClassifier.py