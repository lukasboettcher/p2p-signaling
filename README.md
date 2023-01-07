# p2p-signaling
A simple peer to peer signaling server using plain websockets to establish webRTC connections between users.

## build and run dockerfile
```
docker build . -t p2p-signaling
docker run -d --restart unless-stopped --name p2p-signaling p2p-signaling
```
## or run latest image from ghcr
```
docker run -d --restart unless-stopped --name p2p-signaling \
	-l traefik.enable=true \
	-l traefik.http.routers.signal.rule="Host(\`<HOST>\`)" \
	-l traefik.http.routers.signal.entrypoints=websecure \
 	-l traefik.http.routers.signal.tls.certresolver=letsencrypt \
  ghcr.io/lukasboettcher/p2p-signaling:master
```
