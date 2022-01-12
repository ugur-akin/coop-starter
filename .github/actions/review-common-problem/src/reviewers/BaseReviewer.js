class BaseReviewer {
  #tags;
  #activeTags;

  #pull;
  #reviewStatus;
  #review;
  #comments;

  constructor() {
    if (new.target === BaseReviewer) {
      throw new TypeError(
        "BaseReviewer is an abstract base class and isn't meant to be constructed directly."
      );
    }
  }

  /**
   * TODO: Implement
   */
  static fromCategory(category) {
    switch (category) {
      case "Abc":
        break;
      default:
        throw new Error(
          `Aborted review process: Review category ${category} ` +
            `is incorrect or its automated reviewer is not yet implemented.`
        );
    }
  }

  activate(tags) {
    this.activeChecks = tags;
  }

  withOctokit(instance) {
    this.octokit = instance;
    return this;
  }

  onPullRequest(pullPayload) {
    this.pull = pullPayload;
  }

  post() {}
  review() {}
}

export { BaseReviewer };
