import { IGitInspector, Commit, Author, Tag } from './IGitInspector';
import { ListGetterOptions } from './common/ListGetterOptions';
import { ErrorFactory } from '../lib/errors';
import git from 'simple-git/promise';
import { isEqual, uniqWith } from 'lodash';
import { injectable, inject } from 'inversify';
import { Types } from '../types';
import { paginate, Paginated } from './common/Paginated';

/**
 * A Git repository inspector.
 */
@injectable()
export class GitInspector implements IGitInspector {
  /**
   * The repository to be inspected.
   */
  private readonly git: git.SimpleGit;

  /**
   * Create an instance of GitInspector.
   *
   * @param repoPath A path to the repository to be inspected.
   */
  constructor(@inject(Types.RepositoryPath) repoPath: string) {
    this.git = git(repoPath);
  }

  /**
   * Get commits in the repository.
   *
   * @param options Options specifying a subset of all the repository commits.
   * @returns The specified commits.
   * @throws Throws an arror if there are no commits in the repository (the path does not exist, the path is not a repository, no commits in the repository) or if filtering or sorting is required.
   */
  async getCommits(options: ListGetterOptions): Promise<Paginated<Commit>> {
    if (options.filter !== undefined || options.sort !== undefined) {
      throw ErrorFactory.newInternalError('filtering and sorting not implemented');
    }

    const log = await this.git.log({ multiLine: true });
    return paginate(
      log.all.map((commit) => {
        return {
          sha: commit.hash,
          date: new Date(commit.date),
          message: commit.body,
          author: { name: commit.author_name, email: commit.author_email },
          commiter: undefined,
        };
      }),
      options.pagination,
    );
  }

  /**
   * Get authors in the repository.
   *
   * @param options Options specifying a subset of all the repository authors.
   * @returns The specified authors.
   * @throws Throws an arror if there are no commits in the repository (the path does not exist, the path is not a repository, no commits in the repository) or if filtering or sorting is required.
   */
  async getAuthors(options: ListGetterOptions): Promise<Paginated<Author>> {
    if (options.filter !== undefined || options.sort !== undefined) {
      throw ErrorFactory.newInternalError('filtering and sorting not implemented');
    }

    const commits = await this.getCommits({});
    const items = uniqWith(commits.items.map((commit) => commit.author), isEqual);

    return paginate(items, options.pagination);
  }

  /**
   * Get tags in the repository.
   *
   * @returns The tags.
   * @throws Throws an arror if there is no repository (the path does not exist, the path is not a repository).
   */
  async getAllTags(): Promise<Tag[]> {
    const tags = await this.git.tags();
    return Promise.all(
      tags.all.map(async (tag) => {
        return {
          tag,
          commit: await this.git.revparse([tag]),
        };
      }),
    );
  }
}
