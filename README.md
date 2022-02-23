# p2p-signaling
A simple peer to peer signaling server - using socket.io - to establish webRTC connections between users.

## socket.io configuration
- room for a screenshare application: /comm
- room for filesharing: /files

## build dockerfile
```
docker build . -t p2p-signaling
```
## run dockerfile
```
docker run -d --restart unless-stopped -e "LETSENCRYPT_HOST=signal.bttchr.com" -e "VIRTUAL_HOST=signal.bttchr.com" -e "VIRTUAL_PORT=3000" --name p2p-signaling p2p-signaling
```