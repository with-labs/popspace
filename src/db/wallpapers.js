const SYSTEM_USER_ID = -5000;

class Wallpapers {
  getWallpapersForActor = (actorId) => {
    return shared.db.pg.massive.wallpapers.where('creator_id IN ($1, $2)', [actorId, SYSTEM_USER_ID]);
  }

  canUserAccessWallpaper = (actorId, wallpaperId) => {
    const wallpaper = shared.db.pg.massive.wallpapers.findOne(wallpaperId);
    return (wallpaper && (wallpaper.creator_id === actorId || wallpaper.creator_id === SYSTEM_USER_ID));
  }
}

module.exports = new Wallpapers();
