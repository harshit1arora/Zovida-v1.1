import pandas as pd

def load_known_drugs():
    df = pd.read_csv("app/ml/data/drug_interactions.csv")
    drugs = set()

    drugs.update(df["Drug_A"].str.lower())
    drugs.update(df["Drug_B"].str.lower())

    return drugs
