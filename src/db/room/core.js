class Core {
  constructor() {
  }

  /********************* GETTERS *******************/
  async roomById(id) {
    return await shared.db.pg.massive.rooms.findOne({id: id, deleted_at: null})
  }

  async roomByUrlId(urlId) {
    return await shared.db.pg.massive.rooms.findOne({url_id: urlId, deleted_at: null})
  }

  async roomByRoute(route) {
    const urlId = shared.db.room.namesAndRoutes.urlIdFromRoute(route)
    return await shared.db.room.core.roomByUrlId(urlId)
  }

  async routableRoomById(id) {
    /*
      TODO: At this point, this should return a model,
      or be deleted altogether - perhaps a model constructor
      would work better
    */
    return this.roomById(id)
  }

  async getCreatedRoutableRooms(actorId) {
    return await shared.db.pg.massive.query(`
      SELECT
        id, creator_id, display_name, url_id
      FROM
        rooms
      WHERE
        creator_id = $1
        AND
        deleted_at IS NULL
      ORDER BY
        id DESC
    `, [actorId])
  }

  async getMemberRoutableRooms(actorId) {
    // I.e. rooms you're a member in
    return await shared.db.pg.massive.query(`
      SELECT
        rooms_and_memberships.room_id AS room_id,
        rooms_and_memberships.creator_id AS creator_id,
        rooms_and_memberships.display_name AS display_name,
        rooms_and_memberships.member_as_of AS member_as_of
      FROM
        (
          SELECT creator_id, room_id, display_name, room_memberships.created_at as member_as_of
          FROM
            room_memberships LEFT OUTER JOIN rooms
          ON
            room_memberships.room_id = rooms.id
          WHERE
            room_memberships.actor_id = $1
            AND
            room_memberships.revoked_at IS NULL
            AND
            rooms.deleted_at IS NULL
        ) AS rooms_and_memberships
        ORDER BY rooms_and_memberships.member_as_of DESC;
    `, [actorId])
  }


  /*********************************** MODIFIERS ****************************/
  /**
   * Create a room using provided template data.
   * @param {TemplateData} template
   * @param {number} creatorId - may be deprecated as we move to anon actors
   */
  async createRoomFromTemplate(templateName, template, creatorId, isPublic=true) {
    let templateData = template;
    if (templateData === null) {
      const templateRow = await shared.db.pg.massive.room_templates.findOne({ name: templateName })
      if (!templateRow) {
        throw new Error(`No template found for name ${templateName}`)
      }
      templateData = templateRow.data
    }
    const room = await this.createRoom(creatorId, templateData.display_name || 'New Meeting', templateName, isPublic)
    const roomData = await shared.db.room.templates.setUpRoomFromTemplate(
      room.id,
      templateData
    )
    return { room, roomData }
  }

  async createRoom(creatorId, displayName, templateName, isPublic=true) {
    const urlId = await shared.db.room.namesAndRoutes.generateUniqueRoomUrlId()
    const room = await shared.db.pg.massive.rooms.insert({
      creator_id: creatorId,
      is_public: isPublic,
      url_id: urlId,
      display_name: displayName,
      template_name: templateName
    })
    return room
  }

  async createEmptyRoom(creatorId, isPublic, displayName) {
    return this.createRoomFromTemplate("empty", shared.db.room.templates.empty(), creatorId, isPublic)
  }

  async setDisplayName(roomId, newDisplayName) {
    return await shared.db.pg.massive.rooms.update({id: roomId}, {
      display_name: newDisplayName
    })
  }

  async deleteRoom(roomId) {
    await shared.db.pg.massive.rooms.update({id: roomId}, {deleted_at: shared.db.time.now()})
  }

  async restoreRoom(roomId) {
    await shared.db.pg.massive.rooms.update({id: roomId}, {deleted_at: null})
  }
}

module.exports = new Core()
