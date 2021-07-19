class Templates {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/create_template", async (req, res, params) => {
      const templateName = params.template_name
      const templateData = params.template_data

      const template = await shared.db.room.templates.createTemplate(templateName, templateData)
      return await api.http.succeed(req, res, { template })
    }, ["template_name", "template_data"], [shared.api.middleware.requireAdmin])
    this.zoo.loggedInGetEndpoint("/get_template", async (req, res, params) => {
      const templateName = params.template_name

      const template = await shared.db.pg.massive.room_templates.findOne({ name: templateName })
      if (!template) {
        return await api.http.fail(req, res, { message: "No template exists with that name" }, shared.api.http.code.NOT_FOUND)
      }
      return await api.http.succeed(req, res, { template })
    }, ["template_name"])
    this.zoo.loggedInPostEndpoint("/update_template", async (req, res, params) => {
      const templateName = params.template_name
      const templateData = params.template_data

      const template = await shared.db.pg.massive.room_templates.update({ name: templateName }, { data: templateData })
      return await api.http.succeed(req, res, { template })
    }, ["template_name", "template_data"], [shared.api.middleware.requireAdmin])
  }
}

module.exports = Templates
