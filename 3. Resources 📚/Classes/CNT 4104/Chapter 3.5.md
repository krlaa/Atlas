# Connection oriented Transport: TCP

TCP - is a connection oriented application process where one end client sends another client data. The two processes complete a handshake and send preliminary segments to each other to establish the parameters of the ensuing data transfer.   
- full duplex service
- The TCP “connection” is not an end-to-end TDM or FDM circuit as in a circuit switched network
- connection is a logical one with a common state
- TCP protocol runs only in the end systems and not in the intermediate network elements (routers and link-layer switches), the intermediate network elements do not maintain TCP connection state
- A TCP connection is also always point-to-point (that is, between a single sender and a single receiver)
- Steps for TCP
	1. Client tells transport layer that it wants to establish 