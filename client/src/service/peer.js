class PeerService {
  constructor() {
    try {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error creating RTCPeerConnection:", error);
    }
  }

  async getAnswer(offer) {
    try {
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
      }
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  }

  async setLocalDescription(answer) {
    try {
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error setting local description:", error);
    }
  }

  async getOffer() {
    try {
      if (this.peer) {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }
}

export default new PeerService();
