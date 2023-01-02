const socket = io('/')
const videoGrid = document.getElementById('video-grid')
console.log(videoGrid)
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    // video: {
    //     width : {min:1920, ideal:1920, max:1920},
    //     height : {min:1080, ideal:1080, max:1080},
    // },
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

    socket.on('user-connected', userId => {
        console.log('userconneted', userId)
        connectToNewUser(userId , stream)
    })    
})

socket.on('user-disconnected', userId => {
    console.log(userId)
})

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID , id)
})



const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const connectToNewUser = (userId , stream) => {
    const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}
