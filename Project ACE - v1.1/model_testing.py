import warnings
warnings.filterwarnings("ignore", category=UserWarning)
import pandas as pd
from sklearn.linear_model import LinearRegression

veri = pd.read_csv("Student_Marks.csv")

print(veri.head(5))
print("")


# Y = mx + b -- Y = m1.x1 + m2.x2 + b
# Y = Marks
# x1 = number_courses, x2 = time_study
y = veri[["Marks"]]
x = veri[["number_courses", "time_study"]] 

#veri.info()

lineer = LinearRegression()

model = lineer.fit(x, y)

print("Tahmin1:",model.
      predict([[8, 4]]))
print("Tahmin2:",model.
      predict([[4, 1]]))
print("Tahmin3:",
      model.predict([[1, 8]]))

#print(veri["Marks"].max())

print("Başarı Oranı:",
      model.score(x, y) * 100)
print("")