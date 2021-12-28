import { JSDOM } from "jsdom";
import core from "@actions/core";
import github from "@actions/github";

const fetchPullRequest = async (url) => {
    const fetchOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'text/html' },
        credentials: 'include',
      };

    const resp = await fetch(url, fetchOptions);
    if(!resp.ok){
        throw new Error(`Unable to fetch pull request at ${url}`);
    }

    return await resp.text();
}   

try {
    const url = core.getInput('URL');
    const contextURL = github.context.payload?.pull_request.html_url
    console.log(`URL from input: ${url}`);
    console.log(`URL from context: ${contextURL}`);

    const html = fetchPullRequest(url);
    const { document } = new JSDOM(html).window;
    const issuesForm = document.querySelector("form", {"aria-label": "Link issues"});

    const issueLinks = issuesForm.querySelectorAll("a")
    const issues = []
    for (let anchor of anchors){
        const issueURL = anchor.getAttribute("href");
        // const issue
        issues.push(issueURL);
    }

    core.setOutput('issueURLs', issues);
}
catch (err) {
    core.setFailed(err);
}