const { default: shared } = require("@withso/noodle-shared");

class Surveys {
  constructor(zoo) {
    zoo.loggedInPostEndpoint("/respond_to_survey", this.handleRespondToSurvey.bind(this), ['surveyName', 'response'], []);
    zoo.loggedInGetEndpoint("/survey_responses", this.getSurveyResponses.bind(this), [], []);
    zoo.loggedInGetEndpoint("/survey_response", this.getSurveyResponse.bind(this), ['surveyName'], []);
  }

  async handleRespondToSurvey(req, res) {
    const { surveyName, response } = req.body;
    const existingResponse = await shared.db.prisma.surveyResponse.findFirst({
      where: {
        actorId: req.actor.id,
        surveyName,
      }
    })
    let newResponse;
    if (existingResponse) {
      newResponse = await shared.db.prisma.surveyResponse.update({
        where: {
          id: existingResponse.id,
        },
        data: {
          response
        }
      })
    } else {
      newResponse = await shared.db.prisma.surveyResponse.create({
        data: {
          actorId: req.actor.id,
          surveyName,
          response,
        }
      });
    }
    lib.feedback.notifySurveyResponse(newResponse, req.actor)
    return api.http.succeed(req, res, { response: newResponse });
  }

  async getSurveyResponses(req, res) {
    const responses = await shared.db.prisma.surveyResponse.findMany({
      where: {
        actorId: req.actor.id,
      }
    })
    return api.http.succeed(req, res, { responses });
  }

  async getSurveyResponse(req, res) {
    const { surveyName } = req.params;
    const response = await shared.db.prisma.surveyResponse.findFirst({
      where: {
        actorId: req.actor.id,
        surveyName,
      }
    })
    return api.http.succeed(req, res, { response });
  }
}

module.exports = Surveys;
