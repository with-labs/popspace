import { ApiSubClient } from './ApiSubClient';

export class FileClient extends ApiSubClient {
  uploadFile = this.core.requireActor(async (file: File) => {
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
