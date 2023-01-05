# p2p-signaling
A simple peer to peer signaling server using plain websockets to establish webRTC connections between users.

## build dockerfile
```
docker build . -t p2p-signaling
```
## run dockerfile
```
docker run -d --restart unless-stopped --name p2p-signaling p2p-signaling
```