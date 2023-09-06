import { getJob, getJobs, getJobsByCompany, createJob, deleteJob, updateJob } from "./db/jobs.js"
import { getCompany } from "./db/companies.js"
import { GraphQLError } from "graphql"

export const resolvers = {
  Query: {
    job: async (_, { id }) => {
      const job = await getJob(id);
      if (!job) throw notFoundError(`No job found with ID ${id}`);
      return job;
    },
    company: async (_, { id }) => {
      const company = await getCompany(id)
      if (!company)
        throw notFoundError(`No company found with ID ${id}`)
      return (company)
    },
    jobs: () => getJobs(),
  },
  Job: {
    date: ({ createdAt }) => createdAt.slice(0, 'yyyy-mm-dd'.length),
    company: ({ companyId }) => getCompany(companyId)
  },
  Company: {
    jobs: ({ id: companyId }) => getJobsByCompany(companyId)
  },
  Mutation: {
    createJob: (_, { input: { title, description } }, { user }) => {
      if (user) {
        return createJob({ title, description, companyId: user.companyId })
      }
      else
        throw forbiddenError("Cannot create job! You are UNAUTHORIZED")
    },
    deleteJob: async (_, { id }, { user }) => {
      if (user) {
        const { companyId } = user
        const job = await deleteJob(id, companyId)
        if (job === false)
          throw notFoundError(`No company found with ID ${id}`)
        else
          return job
      }
      throw forbiddenError("Cannot delete job! You are UNAUTHORIZED")
    },
    updateJob: (_, { input: { title, description, id } }) => updateJob({ title, description, id }),
  }
}

function forbiddenError(message) {
  return new GraphQLError(message, { extensions: { code: 'UNAUTHORIZED' } });
}

function notFoundError(message) {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });
}
