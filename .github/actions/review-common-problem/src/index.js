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
    const tag = core.getInput("for");
    const owner = core.getInput("owner");
    const repository = core.getInput("repository");
    const pullNumber = core.getInput("pull_number");
    const reviewId = core.getInput("review_id");
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

    switch (tag) {
      case "suboptimal-unedited-title":
        const passed = SuboptimalTitleReviewer(pullRequest);
        octokit.rest.pulls.createReviewComment({
          owner: owner,
          repo: repository,
          pull_number: pullNumber,
          path: ".github/actions/.gitignore",
          // review_id: reviewId,
          body: "Please use a descriptive title as close to plain english as possible.",
          line: 1,
          side: "RIGHT",
          commit_id: "048a3f00a383d61b76e52da89ce19fa1dd6f276a",
          // commit_id: "a1f107360f4b011330f9e49c2af1dc5e87284f27",
        });
        break;
      default:
        throw new Error(
          `Aborted review process: Review tag ${tag} is incorrect or its automated review is not yet implemented.`
        );
    }
  } catch (err) {
    core.setFailed(err);
  }
};

run();
