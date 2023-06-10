import { GraphQLError } from 'graphql';
import { getCompany } from "./db/companies.js";
import { createJob, deleteJob, getJob, getJobs, getJobsByCompanyId, updateJob } from "./db/jobs.js";

export const resolvers = {
  Query: {
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },

    jobs: () => getJobs(),

    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if(!company) {
        throw notFoundError('No Company found with id ' + id)
      }

      return company;
    } 
  },

  Company: {
    jobs: (company) => getJobsByCompanyId(company.id),
  },

  Job: {
    date: (job) => toISOString(job.createdAt),
    company: (job) => getCompany(job.companyId)
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, { auth }) => {
      if(!auth) {
        return unauthorizedError('Missing authentication')
      }
      const companyId = 'FjcJCHJALA4i' // TODO: set based on user
      return createJob({ companyId, title, description })
    },
    deleteJob: (_root, { id }) => deleteJob(id),
    updateJob: (_root, { input: {id, title, description }}) => {
      return updateJob({ id, title, description })
    }
  }
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND'},
  })
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}

function toISOString(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
};