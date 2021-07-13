import { RoomTemplate } from '@api/roomState/exportRoomTemplate';
import { ApiError } from '@src/errors/ApiError';
import { logger } from '@utils/logger';

import { ApiSubClient } from './ApiSubClient';

export class TemplateClient extends ApiSubClient {
  saveCurrentRoomAsTemplate = async (templateName: string) => {
    const templateData = this.core.cacheApi.exportTemplate();
    try {
      const existing = await this.getTemplate(templateName);
      await this.updateTemplate(templateName, templateData);
      logger.warn(`A template named "${templateName}" already existed. It has been updated.`);
      logger.info(`👀👀👀 Verify the template by creating a new tab now! 👀👀👀`);
      logger.warn(
        `If you made a mistake, you can quickly revert by calling window.undoTemplateSave(). This only works while this tab is open.`
      );
      // @ts-ignore
      window.undoTemplateSave = async () => {
        await this.updateTemplate(templateName, existing.data);
        logger.info(`Template "${templateName}" reverted to previous state.`);
      };
    } catch (e) {
      if (e instanceof ApiError && e.httpCode === 404) {
        logger.log(`(Ignore a 404 on a GET above; that's not a problem)`);
        // Template does not exist, create it
        await this.createTemplate(templateName, templateData);
        logger.log(`Template "${templateName}" created.`);
        logger.info(`👀👀👀 verify the template by creating a new room now! 👀👀👀`);
      } else {
        throw e;
      }
    }
  };

  getTemplate = async (templateName: string) => {
    const response = await this.core.get<{ template: { id: string; name: string; data: RoomTemplate } }>(
      `/get_template?template_name=${templateName}`,
      this.core.SERVICES.api
    );
    return response.template;
  };

  updateTemplate = async (templateName: string, templateData: RoomTemplate) => {
    const response = await this.core.post<{ template: RoomTemplate }>(
      '/update_template',
      { template_name: templateName, template_data: templateData },
      this.core.SERVICES.api
    );
    return response.template;
  };

  createTemplate = async (templateName: string, templateData: RoomTemplate) => {
    const response = await this.core.post<{ template: RoomTemplate }>(
      '/create_template',
      { template_name: templateName, template_data: templateData },
      this.core.SERVICES.api
    );
    return response.template;
  };
}
