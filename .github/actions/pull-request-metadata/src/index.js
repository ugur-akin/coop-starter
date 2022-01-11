import { JSDOM } from "jsdom";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { fetchProblemTags } from "./airtable";
import fetch from "node-fetch";

const issueHtmlRe =
  /https:\/\/github.com\/(?<org>.+)\/(?<repo>.+)\/issues\/(?<num>\d+)/;

// Run below for every review
const additionalLabels = ["generic"];

const fetchPullRequest = async (url) => {
  const fetchOptions = {
    method: "GET",
    headers: { "Content-Type": "text/html" },
    credentials: "include",
  };

  const resp = await fetch(url, fetchOptions);
  if (!resp.ok) {
    throw new Error(`Unable to fetch pull request at ${url}`);
  }

  return await resp.text();
};

const fromHtmlUrl = async (url) => {
  const match = issueHtmlRe.match(url);
  const { org, repo, num } = match.groups;

  const result = `/${org}/${repo}/issues/${num}`;
  return result;
};

const run = async () => {
  try {
    const prHtmlUrl = github.context.payload?.pull_request.html_url;

    // TODO: Implement fetching pulls if context doesn't exist (good for manual runs)
    if (!prHtmlUrl) {
      throw new Error(
        `Pull request URL is missing from context. Please ensure the action
            is triggered with a pull request event.`
      );
    }

    const prPayload = github.context.payload.pull_request;
    const auth = core.getInput("GITHUB_TOKEN");
    const octokit = github.getOctokit(auth);

    const html = await fetchPullRequest(prHtmlUrl);
    const { document } = new JSDOM(html).window;

    const issuesForm = document.querySelector(`form[aria-label="Link issues"]`);

    let issues = [];
    if (issuesForm) {
      const anchors = issuesForm.querySelectorAll("a");
      const issueURLs = [];

      for (let anchor of anchors) {
        const issueURL = anchor.getAttribute("href");
        issueURLs.push(issueURL);
      }

      const issueRequests = issueURLs.forEach((url) =>
        octokit.request(`GET ${fromHtmlUrl(url)}`)
      );
      issues = await Promise.all(issueRequests);
    }

    const issueTitles = issues.map((issue) => issue.title);
    const issueLabels = issues.map((issue) => issue.labels.name);
    const prLabels = prPayload.labels.map((label) => label.name);

    const keywordSet = new Set();
    prLabels.forEach((label) => keywordSet.add(label));
    issueTitles.forEach((title) => keywordSet.add(title));
    issueLabels.forEach((label) => keywordSet.add(label));

    const labelSet = new Set();
    issueLabels.forEach((label) => labelSet.add(label));
    prLabels.forEach((label) => labelSet.add(label));
    additionalLabels.forEach((label) => labelSet.add(label));

    const labels = [...labelSet];
    const keywords = [...keywordSet];

    core.setOutput("issues", issues);
    core.setOutput("labels", labels);
    core.setOutput("keywords", keywords);

    const { categories: categorySet, tags } = await fetchProblemTags(
      labels,
      issueTitles
    );

    const categories = [...categorySet];
    core.setOutput("categories", categories);
    core.setOutput("tags", tags);
  } catch (err) {
    core.setFailed(err);
  }
};

run();
