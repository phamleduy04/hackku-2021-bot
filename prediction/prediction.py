from pyquery import PyQuery as pq
import requests
import json
from matplotlib import pyplot as plt
import math
import numpy as np
from sklearn import linear_model
import argparse

# Anything commented is for the original model

parser = argparse.ArgumentParser()
parser.add_argument('-c', type = str, dest = 'country', default = "us")
parser.add_argument('-l', type = float, dest = 'loss', default = 0.3)
args = parser.parse_args()

base = "https://814d531e73bd.ngrok.io"
country = args.country

res = requests.get(url=base + "/api/"+ country)
#oldData = requests.get(url= base + "/wom/countries/" + country)
#oldData = oldData.json()
#if (res.status_code == 404) print('error!')
d = pq(res.text)
data = d.__str__()
start = data.index("data") + 6
end = data.index("]", start) + 1
data = data[start:end]
P = json.loads(data)
n = len(P)
dP = []
re_dP = []

def calculate_dP_scatter():
  for i in range(n):
    val = 0
    if i == 0:
      val = P[1] - P[0]
    elif i == n - 1:
      val = P[n - 1] - P[n - 2]
    else:
      val = 0.5 * (P[i + 1] - P[i - 1])
    dP.append(val)
    if P[i] == 0:
      re_dP.append(dP[i] / 0.01)
    else:
      re_dP.append(dP[i] / P[i])

calculate_dP_scatter()

reg = linear_model.LinearRegression()
# reg.fit(np.array([P]).T, np.array([re_dP]).T)

ax = [
  plt.subplot2grid((2, 2), (0, 0), colspan = 2),
  plt.subplot2grid((2, 2), (1, 0)),
  plt.subplot2grid((2, 2), (1, 1)),
]

start = 0
while start < len(P) - 2:
  Xbar = np.array([P[start:]]).T
  Ybar = np.array([re_dP[start:]]).T

  reg = linear_model.LinearRegression()
  # reg.fit(Xbar, Ybar)
  reg.fit(np.sqrt(Xbar), Ybar)
  # print(reg.coef_, reg.intercept_)
  a = reg.coef_[0]
  b = reg.intercept_

  loss = 0
  for i in range(start, len(P)):
    _Y = re_dP[i]
    if _Y <= 1e-6:
      _Y = 0.001
    loss += np.abs(_Y - reg.predict(np.sqrt([[P[i]]]))) / _Y
  loss = loss / len(P)
  if loss <= args.loss or start == len(P) - 3:
    #print(a, b)
    dX = np.linspace(0, P[-1], len(P) * 10)
    dY = a * np.sqrt(dX) + b
    # dY = a * dX + b
    ax[1].plot(P, re_dP, 'bo')
    ax[1].plot(P[start:], re_dP[start:], "ro")
    ax[1].plot(dX, dY, 'r-')
    ax[1].set(title="Difference", xlabel="Tested case", ylabel="difference")
    ax[1].legend(['Difference'],loc="best")
    ax[1].grid(axis='both', color='0.95')
    break
  start += 1

'''
# def calculate_C(t, P):
#   if P == 0:
#     P = 0.01
#   return (b * np.exp(b * t)) / P + a * np.exp(b * t)

# def calculate_dP(t, C):
#   return (b**2 * C * np.exp(t * b)) / (C - a * np.exp(t * b)) ** 2

# def calculate_P(t, C):
#   return (b * np.exp(b * t)) / (C - a * np.exp(b * t))
'''
def calculate_C(t, P):
  if P == 0:
    P = 0.01
  return 2 * np.log(b/np.sqrt(P) + a) + b * t

def calculate_dP(t, C):
  return ((b ** 3) * np.exp((-b * t + C) / 2)) / ((np.exp((-b * t + C) / 2) - a) ** 3)

def calculate_P(t, C):
  return (b / (np.exp((-b * t + C) / 2) - a)) ** 2

def find_best_C():
  res = -1
  best_C = calculate_C(0, P[0])
  pos = 0
  for i in range(1, n):
    C = calculate_C(i, P[i])
    s = 0
    for j in range(n):
      _P = calculate_P(j, C)
      s += np.abs(P[j] - _P)
    if res == -1 or res > s:
      res = s
      best_C = C
      pos = i
  return best_C, pos

C, _ = find_best_C()

#print(C, _)
#print("total case:", (b / a) * (b / a))

X = np.linspace(0, n * 2, n * 100)
xP = np.linspace(0, n - 1, n)

ax[2].plot(X, calculate_dP(X, C), 'r-', label="dP")
ax[2].plot(xP, dP, 'ro', label="scatter dP")
ax[2].set(title="New cases", xlabel="Tested dates", ylabel="Predict new cases", xlim=(0,500))
ax[2].legend(['New case rate'],loc="best")
ax[2].grid(axis='both', color='0.95')

ax[0].plot(X, calculate_P(X, C), "b-", label="P", markerSize=1)
ax[0].plot(xP, P, "bo", label="scatter P")
ax[0].set(title="Total cases", xlabel="Tested dates", ylabel="Total dates", xlim=(0,500),ylim=(0,max(P)*1.5))
ax[0].legend(['Total case predicted'],loc="best")
ax[0].grid(axis='both', color='0.95')
#print("Next day prediction:", math.ceil(calculate_dP(len(dP)+1, C)),"()","with difference of",abs(round(dY[-1]*100,2)),"%", "at day", len(dP)+1)
print(f"Next day prediction: +{math.ceil(calculate_dP(len(dP)+1, C))} cases, with difference of {abs(round(dY[-1]*100,2))}% at {len(dP)+1}th day")
plt.tight_layout()
plt.savefig('final.jpg')