import { getCompany } from "./db/companies.js";
import { getJob, getJobs, getJobsByCompanyId } from "./db/jobs.js";

export const resolvers = {
  Query: {
    job: (_root, { id }) => getJob(id),
    jobs: () => getJobs(),
    company: (_root, { id }) => getCompany(id)
  },

  Company: {
    jobs: (company) => getJobsByCompanyId(company.id),
  },

  Job: {
    date: (job) => toISOString(job.createdAt),
    company: (job) => getCompany(job.companyId)
  },
};

function toISOString(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
};