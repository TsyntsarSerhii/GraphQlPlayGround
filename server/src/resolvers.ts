import { GraphQLError } from 'graphql';
import { getCompany } from "./db/companies.js";
import { countJobs, createJob, deleteJob, getJob, getJobs, getJobsByCompanyId, updateJob } from './db/jobs.js';

export const resolvers = {
  Query: {
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },

    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { items, totalCount };
    },

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
    company: (job, _args, { companyLoader }) => {
      return companyLoader.load(job.companyId);
    },
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if(!user) {
        return unauthorizedError('Missing authentication')
      }
      return createJob({ companyId: user.companyId, title, description })
    },
    
    deleteJob: (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication')
      }
      const job = deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError(`No Job found with id: ${id}`)
      }
      return job;
    },

    updateJob: (_root, { input: {id, title, description }}, { user }) => {
      if (!user) {
        throw unauthorizedError(`Job not found: ${id}`)
      }
      const job = updateJob({ id, companyId: user.companyId, title, description });
      if (!job) {
        throw notFoundError(`No Job found with id: ${id}`)
      }
      return job;
    }
  }
};

function notFoundError(message: string) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND'},
  })
}

function unauthorizedError(message: string) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}

function toISOString(value: string) {
  return value.slice(0, 'yyyy-mm-dd'.length);
};