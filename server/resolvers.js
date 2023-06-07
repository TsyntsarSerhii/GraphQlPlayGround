import { GraphQLError } from 'graphql';
import { getCompany } from "./db/companies.js";
import { getJob, getJobs, getJobsByCompanyId } from "./db/jobs.js";

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
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND'},
  })
}

function toISOString(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
};