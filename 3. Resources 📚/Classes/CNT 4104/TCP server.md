```python
# C:...>  python UDPClient.py

# Kevin Antony

# CNT 4104 Assignment 2

# 9/25/2021

from socket import *

serverName = 'C017128.forest.usf.edu' # 'localhost' '127.0.0.1'


serverPort = 39123

clientSocket = socket(AF_INET, SOCK_STREAM)

clientSocket.connect((serverName, serverPort))

# message = input('Enter your email: ')

clientSocket.send("jdoe123@usf.edu".encode())

modifiedMessage, serverAddress = clientSocket.recvfrom(1024)

print(modifiedMessage.decode())

l = input("Enter checksum: ")

clientSocket.send(l.encode())

  

modifiedMessage2, serverAddress2 = clientSocket.recvfrom(1024)

print(modifiedMessage2.decode())

# print(modifiedMessage2.decode())
```