import { AvatarSpriteSheetSet } from './AvatarAnimator';

const SPRITE_SHEET_ORIGIN = '/avatars/spritesheets';

export class AvatarSpriteSheetCache {
  private _promises: { [key: string]: Promise<AvatarSpriteSheetSet> } = {};
  private _spritesheets: { [key: string]: AvatarSpriteSheetSet } = {};

  get = async (name: string, cancelSignal?: AbortSignal): Promise<AvatarSpriteSheetSet | null> => {
    if (!this._spritesheets[name]) {
      if (!this._promises[name]) {
        this._promises[name] = this.load(name, cancelSignal);
      }
      const loaded = await this._promises[name];
      this._spritesheets[name] = loaded;
    }

    return this._spritesheets[name];
  };

  private load = async (name: string, cancelSignal?: AbortSignal): Promise<AvatarSpriteSheetSet> => {
    const dataPath = `${SPRITE_SHEET_ORIGIN}/${name}/spritesheet.json`;
    const response = await fetch(dataPath, {
      signal: cancelSignal,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to load spritesheet ${name}`);
    }
    const data = (await response.json()) as AvatarSpriteSheetSet;
    // normalize spritesheet image src to the base path
    data.spritesheetSrc = `${SPRITE_SHEET_ORIGIN}/${name}${data.spritesheetSrc}`;
    return data;
  };
}

export const avatarSpriteSheetCache = new AvatarSpriteSheetCache();
