/* eslint-disable @typescript-eslint/camelcase */
import { GitHubService } from './GitHubService';
import { GitHubClient } from './GitHubClient';
import { getRepoContentResponse } from './__MOCKS__/gitHubClientMockFolder/getRepoContentResponse.mock';
import { getPullsServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getPullsServiceResponse.mock';
import { getPullsReviewsServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getPullsReviewsServiceResponse.mock';
import { getCommitServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getCommitServiceResponse.mock';
import { getContributorsServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getContributorsServiceResponse.mock';
import { getContributorsStatsServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getContributorsStatsServiceResponse.mock';
import { getRepoContentServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getRepoContentServiceResponse.mock';
import { getIssuesServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getIssuesServiceResponse.mock';
import { getPullsRequestsResponse } from './__MOCKS__/gitHubClientMockFolder/getPullsRequestsResponse.mock';
import { getPullRequestsReviewsResponse } from './__MOCKS__/gitHubClientMockFolder/getPullRequestsReviewsResponse.mock';
import { getCommitResponse } from './__MOCKS__/gitHubClientMockFolder/getCommitResponse.mock';
import { getContributorsStatsResponse } from './__MOCKS__/gitHubClientMockFolder/getContributorsStatsResponse.mock';
import { getContributorsResponse } from './__MOCKS__/gitHubClientMockFolder/getContributorsResponse.mock';
import { getIssuesResponse } from './__MOCKS__/gitHubClientMockFolder/getIssuesResponse.mock';
import { getIssueCommentsResponse } from './__MOCKS__/gitHubClientMockFolder/getIssueCommentsResponse.mock';
import { getIssueCommentsServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getIssueCommentsServiceResponse.mock';
import nock from 'nock';
import { getPullsFilesResponse } from './__MOCKS__/gitHubClientMockFolder/getPullsFiles.mock';
import { getPullsFilesServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getPullFilesServiceResponse.mock';
import { getPullCommitsResponse } from './__MOCKS__/gitHubClientMockFolder/getPullsCommitsResponse.mock';
import { getPullCommitsServiceResponse } from './__MOCKS__/gitHubServiceMockFolder/getPullCommitsServiceResponse.mock';

describe('GitHub Service', () => {
  let service: GitHubService;
  let client: GitHubClient;
  const gitHubNock = nock('https://api.github.com');

  beforeEach(async () => {
    client = new GitHubClient({ uri: '.' });
    service = new GitHubService(client);
  });

  it('returns open pulls in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/pulls').reply(200, getPullsRequestsResponse);

    const response = await service.getPullRequests('octocat', 'Hello-World');
    expect(response).toMatchObject(getPullsServiceResponse);
  });

  it('returns pull request reviews in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/pulls/1/reviews').reply(200, getPullRequestsReviewsResponse);

    const response = await service.getPullRequestReviews('octocat', 'Hello-World', 1);
    expect(response).toMatchObject(getPullsReviewsServiceResponse);
  });

  it('returns commits in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/git/commits/762941318ee16e59dabbacb1b4049eec22f0d303').reply(200, getCommitResponse);

    const response = await service.getCommit('octocat', 'Hello-World', '762941318ee16e59dabbacb1b4049eec22f0d303');
    expect(response).toMatchObject(getCommitServiceResponse);
  });

  it('returns contributors in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/contributors').reply(200, getContributorsResponse);

    const response = await service.getContributors('octocat', 'Hello-World');
    expect(response).toMatchObject(getContributorsServiceResponse);
  });

  it('returns contributor stats in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/stats/contributors').reply(200, getContributorsStatsResponse);

    const response = await service.getContributorsStats('octocat', 'Hello-World');
    expect(response).toMatchObject(getContributorsStatsServiceResponse);
  });

  it('returns repo content in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/contents/README').reply(200, getRepoContentResponse);

    const response = await service.getRepoContent('octocat', 'Hello-World', 'README');
    expect(response).toMatchObject(getRepoContentServiceResponse);
  });

  it('returns issues in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/issues').reply(200, getIssuesResponse);

    const response = await service.getIssues('octocat', 'Hello-World');
    expect(response).toMatchObject(getIssuesServiceResponse);
  });

  it('returns comments in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/issues/1/comments').reply(200, getIssueCommentsResponse);

    const response = await service.getIssueComments('octocat', 'Hello-World', 1);
    expect(response).toMatchObject(getIssueCommentsServiceResponse);
  });

  it('returns commits in own interfa', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/issues/1/comments').reply(200, getIssueCommentsResponse);

    const response = await service.getIssueComments('octocat', 'Hello-World', 1);
    expect(response).toMatchObject(getIssueCommentsServiceResponse);
  });

  it('returns pull files in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/pulls/1/files').reply(200, getPullsFilesResponse);

    const response = await service.getPullRequestFiles('octocat', 'Hello-World', 1);
    expect(response).toMatchObject(getPullsFilesServiceResponse);
  });

  it('returns pull commits in own interface', async () => {
    gitHubNock.get('/repos/octocat/Hello-World/pulls/1/commits').reply(200, getPullCommitsResponse);

    const response = await service.getPullCommits('octocat', 'Hello-World', 1);
    expect(response).toMatchObject(getPullCommitsServiceResponse);
  });
});
