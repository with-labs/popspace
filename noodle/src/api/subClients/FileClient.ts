import { ApiSubClient } from './ApiSubClient';

export class FileClient extends ApiSubClient {
  /** Uploads a file into the room the client is connected to */
  uploadFile = this.core.requireActor(async (file: File) => {
    const roomRoute = this.core.roomRoute;
    if (!roomRoute) {
      throw new Error('Files can only be uploaded inside a room');
    }
    return this.core.request<{
      file: {
        id: string;
        name: string;
        url: string;
        mimetype: string;
        thumbnailUrl?: string;
      };
    }>({
      method: 'POST',
      endpoint: '/upload_file',
      data: {
        roomRoute,
        file,
      },
      contentType: 'multipart/form-data',
      service: this.core.SERVICES.api,
    });
  });

  deleteFile = this.core.requireActor(async (fileId: string) => {
    return await this.core.post('/delete_file', { fileId }, this.core.SERVICES.api);
  });
}
