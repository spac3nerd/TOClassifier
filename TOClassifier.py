import sys
import numpy as np
from collections import Counter
import pandas
from tqdm import tqdm
import torch
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from TOModel import TOModel
from TODataStructure import TODataStructure

settings = {
    "characterSet": "abcdefghijklmnopqrstuvwxyz0123456789-,/$%& ()[]",
    "inputData": "./data/data.csv",
    "charsPerEntry": 15,
    "learningRate": 0.01,
    "batchSize": 50,
    "workers": 0,
    "epochs": 100
}


#Read our CSV file using pandas
def dataLoader():
    #Using the same CSV metadata as our converter
    chunks = pandas.read_csv(settings['inputData'],
                         usecols=["LABEL", "TEXT"],
                         encoding="UTF-8",
                             # redundant, but it wants it for some reason
                         sep=",",
                         chunksize=100000)
    textList = []
    labelList = []
    #vanilla implementation of chunk parser
    for originalChunk in tqdm(chunks):
        #we won't modify the original chunk - copy it and then sample it - this will randomize the order too!
        shuffledChunk = originalChunk.copy().sample(frac=1)
        #shuffledChunk['processed_text'] = shuffledChunk['TEXT']

        textList += shuffledChunk['TEXT'].tolist()
        labelList += shuffledChunk['LABEL'].tolist()

    number_of_classes = len(set(labelList))

    print("Entries loaded: %d" % len(labelList))
    print("Class Distribution: ", Counter(labelList))

    return {
        "textList": textList,
        "labelList": labelList
    }

#def init():
if __name__ == "__main__":
    print("Loading Data...")
    loadedData = dataLoader()

    #Get the list of text and label items - note that the order is already randomized
    textList = loadedData['textList']
    labelList = loadedData['labelList']

    #Use SKlearn to split our set into training and validation segments
    trainingTextList, valTextList, trainingLabelList, valLabelList = train_test_split(textList,
                                                                                         labelList,
                                                                                         test_size=0.2,
                                                                                         random_state=42,
                                                                                         stratify=labelList)
    print("Training Set Length: ", len(trainingTextList))
    print("Validation Set Length: ", len(valTextList))


    trainingDataSet = TODataStructure(trainingTextList, trainingLabelList, settings)
    validationDataSet = TODataStructure(valTextList, valLabelList, settings)

    trainingLoader = torch.utils.data.DataLoader(trainingDataSet, batch_size=settings["batchSize"],
                                              shuffle=True, num_workers=settings["workers"])
    validationLoader = torch.utils.data.DataLoader(validationDataSet, batch_size=settings["batchSize"],
                                              shuffle=True, num_workers=settings["workers"])

    # ***Initialize model and optimizer***
    modelParams = {
        "dropOutIn": 0.1,
        "charsPerEntry": settings["charsPerEntry"]
    }

    net = TOModel(modelParams)
    if torch.cuda.is_available():
        net.cuda()

    optimizer = torch.optim.SGD(net.parameters(), lr=settings["learningRate"], momentum=0.9)
    criterion = torch.nn.CrossEntropyLoss()

    # ***Start training loop***
    previousLoss = 0

    #We will append to these lists at the end of every epoch
    validationAccuracy = []
    trainingAccuracy = []
    for epoch in range(settings["epochs"]):
        print(epoch)
        runningLoss = 0.0
        correctT = 0
        totalT = 0
        for i, data in enumerate(trainingLoader, 0):
            inputs, labels = data

            if torch.cuda.is_available():
                inputs = inputs.cuda()
                labels = labels.cuda()

            # zero the parameter gradients
            optimizer.zero_grad()

            outputs = net(inputs)

            #Take a snapshot of the training accuracy
            _, predicted = torch.max(outputs.data, 1)
            totalT += labels.size(0)
            correctT += (predicted == labels).sum().item()


            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            runningLoss += loss.item()

            if i % 100 == 99:    # print every 100 mini-batches
                if previousLoss == 0:
                    previousLoss = runningLoss / 10
                print('[%d, %5d] loss: %.3f %.3f' %
                      (epoch + 1, i + 1, runningLoss / 10, ((runningLoss / 10) / previousLoss) * 100))
                previousLoss = runningLoss / 10
                runningLoss = 0.0

        #At the end of every epoch - do something
        #In this case, I want to keep track of testing and validation accuracy
        correctV = 0
        totalV = 0
        with torch.no_grad():
            for data in validationLoader:
                inputs, labels = data
                if torch.cuda.is_available():
                    inputs = inputs.cuda()
                    labels = labels.cuda()

                outputs = net(inputs)
                _, predicted = torch.max(outputs.data, 1)
                totalV += labels.size(0)
                correctV += (predicted == labels).sum().item()
        print('Validation Accuracy: %d %%' % (
                100 * correctV / totalV))
        validationAccuracy.append(100 * correctV / totalV)
        print('Training Accuracy: %d %%' % (
                100 * correctT / totalT))
        trainingAccuracy.append(100 * correctT / totalT)



    print("Done!")
    print(validationAccuracy)
    print(trainingAccuracy)

    xAxis = list(range(settings["epochs"]))
    plt.plot(xAxis, validationAccuracy, 'b', label="Validation")
    plt.plot(xAxis, trainingAccuracy, 'r', label="Training")
    plt.legend(loc="lower left")
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.show()

#init()

#sys.exit(0)

