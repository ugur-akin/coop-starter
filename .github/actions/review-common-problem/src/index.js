import * as core from "@actions/core";
import * as github from "@actions/github";
import { SuboptimalTitleReviewer } from "./reviewers/SuboptimalTitleReviewer";

/**
 * TODO: Implement a design pattern for reviewers:
 *      - Inheritence
 *      - Dependency injection (e.g. octo/review requests ready)
 *      - Decorator?
 *      - Composite actions in the future?
 */

const run = async () => {
  try {
    const category = core.getInput("for");
    const tags = JSON.parse(core.getInput("tags"));
    const owner = core.getInput("owner");
    const repository = core.getInput("repository");
    const pullNumber = core.getInput("pull_number");
    const auth = core.getInput("GITHUB_TOKEN");
    const octokit = github.getOctokit(auth);

    const pullInput = core.getInput("pull_payload");
    let pullRequest = pullInput && JSON.parse(pullInput);
    if (!pullRequest) {
      const { data: pullPayload } = await octokit.rest.pulls.get({
        owner: owner,
        repo: repository,
        pull_number: pullNumber,
        mediaType: {
          format: "diff",
        },
      });

      pullRequest = pullPayload;
    }

    const reviewer = Reviewer.fromCategory(category);

    reviewer.activate(tags).withOctokit(octokit).onPull(pullRequest);
    await reviewer.runReview();

    if (reviewer.status !== "Aborted") {
      await reviewer.postReview();
    } else {
      throw new Error(
        `Review was aborted due to following reasons:
            ${reviewer.getAbortReason()}`
      );
    }
  } catch (err) {
    core.setFailed(err);
  }
};

run();
