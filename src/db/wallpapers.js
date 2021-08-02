const SYSTEM_USER_ID = -5000;

class Wallpapers {
  getWallpapersForActor = (actorId) => {
    return shared.db.pg.massive.wallpapers.where('creator_id IN ($1, $2)', [actorId, SYSTEM_USER_ID]);
  }
}

module.exports = new Wallpapers();
