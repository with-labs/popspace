import { ApiSubClient } from './ApiSubClient';

export class FileClient extends ApiSubClient {
  getRoomFileUploadUrl = this.core.requireActor(async (fileName: string, contentType: string) => {
    return await this.core.post<{ uploadUrl: string; downloadUrl: string }>(
      '/get_room_file_upload_url',
      {
        fileName,
        contentType,
      },
      this.core.SERVICES.api
    );
  });

  deleteFile = this.core.requireActor(async (fileUrl: string) => {
    return await this.core.post('/delete_file', { fileUrl }, this.core.SERVICES.api);
  });
}
