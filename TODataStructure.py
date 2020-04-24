#Credit goes to "ahmedbesbe" for developing this type of class - it certainly made interfacing with the torch Dataset much easier!
import numpy as np
import torch
from torch.utils.data import Dataset

class TODataStructure(Dataset):
    def __init__(self, texts, labels, settings):
        self.texts = texts
        self.labels = labels
        self.length = len(self.texts)

        self.characterSet = settings["characterSet"]
        self.charsPerEntry = 47 #settings["charsPerEntry"]
        self.max_length = 150
        self.identity_mat = np.identity(self.charsPerEntry)

    def __len__(self):
        return self.length

    def __getitem__(self, index):
        raw_text = self.texts[index]

        data = np.array([self.identity_mat[self.characterSet.index(i)] for i in list(raw_text)[::-1] if i in self.characterSet],
                        dtype=np.float32)
        if len(data) > self.max_length:
            data = data[:self.max_length]
        elif 0 < len(data) < self.max_length:
            data = np.concatenate(
                (data, np.zeros((self.max_length - len(data), self.charsPerEntry), dtype=np.float32)))
        elif len(data) == 0:
            data = np.zeros(
                (self.max_length, self.charsPerEntry), dtype=np.float32)

        label = self.labels[index]
        data = torch.Tensor(data)

        return data, label