# Connection oriented Transport: TCP

TCP - is a connection oriented application process where one end client sends another client data. The two processes complete a handshake and send preliminary segments to each other to establish the parameters of the ensuing data transfer.   
- full duplex service
- The TCP “connection” is not an end-to-end TDM or FDM circuit as in a circuit switched network
- connection is a logical one with a common state
- TCP protocol runs only in the end systems and not in the intermediate network elements (routers and link-layer switches), the intermediate network elements do not maintain TCP connection state
- A TCP connection is also always point-to-point (that is, between a single sender and a single receiver)
- Steps for TCP
	1. Client tells transport layer that it wants to establish a connection with server
	2. establish the connection 
	3. client sends special tcp segment
	4. server responds with second special segment
	5. client responds with third special segment.
- First two segments carry no payload that is no application layer data
- The third segment may carry a payload because 
- connection procedure is called three way handshake.
- The client process passes a stream of data through the socket (the door of the process), as described in Section 2.7. Once the data passes through the door, the data is in the hands of TCP running in the client. As shown in Figure 3.28, TCP directs this data to the connection’s send buffer, which is one of the buffers that is set aside during the initial three-way handshake