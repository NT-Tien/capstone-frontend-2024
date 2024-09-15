declare module 'recordrtc' {
    class RecordRTC {
      constructor(stream: MediaStream, options: { type: 'video'; mimeType?: string; audio?: boolean; video?: boolean });
      startRecording(): void;
      stopRecording(callback: () => void): void;
      getBlob(): Blob;
    }
    export = RecordRTC;
  }
  