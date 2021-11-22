class Templates {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/create_template", async (req, res, params) => {
      const templateName = params.templateName
      const templateData = params.templateData

      const template = await shared.db.room.templates.createTemplate(templateName, templateData)
      return await api.http.succeed(req, res, { template })
    }, ["templateName", "templateData"], [shared.api.middleware.requireAdmin])
    this.zoo.loggedInGetEndpoint("/get_template", async (req, res, params) => {
      const templateName = params.templateName

      const template = await shared.db.prisma.roomTemplate.findFirst({ where: { name: templateName } })
      if (!template) {
        return await api.http.fail(req, res, { message: "No template exists with that name" }, shared.api.http.code.NOT_FOUND)
      }
      return await api.http.succeed(req, res, { template })
    }, ["templateName"])
    this.zoo.loggedInPostEndpoint("/update_template", async (req, res, params) => {
      const templateName = params.templateName
      const templateData = params.templateData

      const template = await shared.db.prisma.roomTemplate.update({ where: { name: templateName }, data: { data: templateData } })
      return await api.http.succeed(req, res, { template })
    }, ["templateName", "templateData"], [shared.api.middleware.requireAdmin])
  }
}

module.exports = Templates
